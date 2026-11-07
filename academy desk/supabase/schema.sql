-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coach', 'scout', 'player')),
  player_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0),
  sport TEXT NOT NULL,
  joining_date DATE DEFAULT CURRENT_DATE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Practice Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date DATE NOT NULL,
  sport TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_at TIMESTAMPTZ,
  CONSTRAINT unique_session_date_sport UNIQUE (session_date, sport)
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_session_player UNIQUE (session_id, player_id)
);

-- 5. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date DATE NOT NULL,
  sport TEXT NOT NULL,
  opponent TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Match Participants Table
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_match_player UNIQUE (match_id, player_id)
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_players_sport ON public.players(sport);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON public.players(player_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date_sport ON public.sessions(session_date, sport);
CREATE INDEX IF NOT EXISTS idx_attendance_player ON public.attendance(player_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_player ON public.match_participants(player_id);

-- TRIGGER 1: PREVENT MODIFYING ATTENDANCE OF CLOSED SESSIONS
CREATE OR REPLACE FUNCTION public.check_session_not_closed()
RETURNS TRIGGER AS $$
DECLARE
  v_status TEXT;
  v_session_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_session_id := OLD.session_id;
  ELSE
    v_session_id := NEW.session_id;
  END IF;

  SELECT status INTO v_status FROM public.sessions WHERE id = v_session_id;

  IF v_status = 'CLOSED' THEN
    RAISE EXCEPTION 'Session is CLOSED and locked. Attendance cannot be modified.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_attendance_edit_on_closed ON public.attendance;
CREATE TRIGGER trg_prevent_attendance_edit_on_closed
BEFORE INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.check_session_not_closed();

-- TRIGGER 2: STRICT MATCH PARTICIPATION VALIDATION
CREATE OR REPLACE FUNCTION public.validate_match_participant_attendance()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_session_status TEXT;
  v_attendance_status TEXT;
  v_player_sport TEXT;
  v_match_sport TEXT;
BEGIN
  -- Get match details
  SELECT session_id, sport INTO v_session_id, v_match_sport
  FROM public.matches
  WHERE id = NEW.match_id;

  IF v_session_id IS NULL THEN
    RAISE EXCEPTION 'Match must be associated with a valid practice session.';
  END IF;

  -- Verify session status is CLOSED
  SELECT status INTO v_session_status
  FROM public.sessions
  WHERE id = v_session_id;

  IF v_session_status <> 'CLOSED' THEN
    RAISE EXCEPTION 'Match practice session must be CLOSED before recording match performances.';
  END IF;

  -- Verify player sport matches
  SELECT sport INTO v_player_sport
  FROM public.players
  WHERE player_id = NEW.player_id;

  IF v_player_sport <> v_match_sport THEN
    RAISE EXCEPTION 'Player % belongs to % but match is for %', NEW.player_id, v_player_sport, v_match_sport;
  END IF;

  -- Check player attendance status in the corresponding session
  SELECT status INTO v_attendance_status
  FROM public.attendance
  WHERE session_id = v_session_id AND player_id = NEW.player_id;

  IF v_attendance_status IS NULL THEN
    RAISE EXCEPTION 'Player % has no attendance record for the corresponding session.', NEW.player_id;
  ELSIF v_attendance_status <> 'PRESENT' THEN
    RAISE EXCEPTION 'Player % was ABSENT in the practice session and cannot participate in the match.', NEW.player_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_match_participant ON public.match_participants;
CREATE TRIGGER trg_validate_match_participant
BEFORE INSERT OR UPDATE ON public.match_participants
FOR EACH ROW
EXECUTE FUNCTION public.validate_match_participant_attendance();

-- 7. READINESS CALCULATION VIEW & RPC FUNCTION
CREATE OR REPLACE VIEW public.player_readiness_view AS
WITH closed_sessions_per_sport AS (
  SELECT sport, COUNT(*) as total_closed_sessions
  FROM public.sessions
  WHERE status = 'CLOSED'
  GROUP BY sport
),
player_attendance_stats AS (
  SELECT 
    p.player_id,
    p.sport,
    COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present_sessions,
    COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent_sessions
  FROM public.players p
  LEFT JOIN public.attendance a ON p.player_id = a.player_id
  LEFT JOIN public.sessions s ON a.session_id = s.id AND s.status = 'CLOSED'
  GROUP BY p.player_id, p.sport
),
player_match_stats AS (
  SELECT 
    p.player_id,
    COUNT(DISTINCT mp.match_id) as matches_played,
    COALESCE(AVG(mp.score), 0) as avg_score,
    COALESCE(MAX(mp.score), 0) as max_score
  FROM public.players p
  LEFT JOIN public.match_participants mp ON p.player_id = mp.player_id
  GROUP BY p.player_id
)
SELECT 
  p.id,
  p.player_id,
  p.name,
  p.age,
  p.sport,
  p.joining_date,
  p.active,
  COALESCE(cs.total_closed_sessions, 0) as total_sessions,
  COALESCE(pas.present_sessions, 0) as present_sessions,
  COALESCE(pas.absent_sessions, 0) as absent_sessions,
  CASE 
    WHEN COALESCE(cs.total_closed_sessions, 0) = 0 THEN 0.0
    ELSE ROUND((COALESCE(pas.present_sessions, 0)::NUMERIC / cs.total_closed_sessions::NUMERIC) * 100.0, 2)
  END as attendance_percentage,
  COALESCE(pms.matches_played, 0) as matches_played,
  ROUND(pms.avg_score, 2) as avg_score,
  pms.max_score,
  CASE 
    WHEN (
      COALESCE(cs.total_closed_sessions, 0) > 0 
      AND (COALESCE(pas.present_sessions, 0)::NUMERIC / cs.total_closed_sessions::NUMERIC) * 100.0 >= 75.0 
      AND COALESCE(pms.matches_played, 0) >= 2
    ) THEN 'READY'
    ELSE 'NOT READY'
  END as readiness_status
FROM public.players p
LEFT JOIN closed_sessions_per_sport cs ON p.sport = cs.sport
LEFT JOIN player_attendance_stats pas ON p.player_id = pas.player_id
LEFT JOIN player_match_stats pms ON p.player_id = pms.player_id;

-- FUNCTION FOR SCOUT ACCESS (STRICT BACKEND SECURITY)
CREATE OR REPLACE FUNCTION public.get_scout_ready_players(
  filter_sport TEXT DEFAULT NULL,
  filter_min_age INT DEFAULT NULL,
  filter_max_age INT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  player_id TEXT,
  name TEXT,
  age INT,
  sport TEXT,
  joining_date DATE,
  total_sessions BIGINT,
  present_sessions BIGINT,
  attendance_percentage NUMERIC,
  matches_played BIGINT,
  avg_score NUMERIC,
  max_score NUMERIC,
  readiness_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    prv.id,
    prv.player_id,
    prv.name,
    prv.age,
    prv.sport,
    prv.joining_date,
    prv.total_sessions,
    prv.present_sessions,
    prv.attendance_percentage,
    prv.matches_played,
    prv.avg_score,
    prv.max_score,
    prv.readiness_status
  FROM public.player_readiness_view prv
  WHERE prv.readiness_status = 'READY'
    AND (filter_sport IS NULL OR filter_sport = '' OR prv.sport = filter_sport)
    AND (filter_min_age IS NULL OR prv.age >= filter_min_age)
    AND (filter_max_age IS NULL OR prv.age <= filter_max_age)
    AND (search_query IS NULL OR search_query = '' OR prv.name ILIKE '%' || search_query || '%' OR prv.player_id ILIKE '%' || search_query || '%')
  ORDER BY prv.attendance_percentage DESC, prv.matches_played DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

