-- Enable Row Level Security and Grants
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.players TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sessions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.attendance TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.matches TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.match_participants TO anon, authenticated, service_role;
GRANT SELECT ON public.player_readiness_view TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_scout_ready_players TO anon, authenticated, service_role;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Access players" ON public.players;
DROP POLICY IF EXISTS "Access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Access sessions" ON public.sessions;
DROP POLICY IF EXISTS "Access attendance" ON public.attendance;
DROP POLICY IF EXISTS "Access matches" ON public.matches;
DROP POLICY IF EXISTS "Access match_participants" ON public.match_participants;

-- Create Policies
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access players" ON public.players FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access match_participants" ON public.match_participants FOR ALL USING (true) WITH CHECK (true);

