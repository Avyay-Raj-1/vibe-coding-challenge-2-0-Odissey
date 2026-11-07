export type UserRole = 'coach' | 'scout' | 'player';

export interface Profile {
  id: string;
  auth_id: string | null;
  email: string;
  name: string;
  role: UserRole;
  player_id: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  player_id: string;
  name: string;
  age: number;
  sport: string;
  joining_date: string;
  active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  session_date: string;
  sport: string;
  status: 'OPEN' | 'CLOSED';
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  player_id: string;
  status: 'PRESENT' | 'ABSENT';
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string;
  sport: string;
  opponent: string;
  session_id: string;
  created_at: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  score: number;
  created_at: string;
}

export interface PlayerReadiness {
  id: string;
  player_id: string;
  name: string;
  age: number;
  sport: string;
  joining_date: string;
  active: boolean;
  total_sessions: number;
  present_sessions: number;
  absent_sessions: number;
  attendance_percentage: number;
  matches_played: number;
  avg_score: number;
  max_score: number;
  readiness_status: 'READY' | 'NOT READY';
}

export type CoachPage =
  | 'dashboard'
  | 'players'
  | 'attendance'
  | 'matches'
  | 'ready'
  | 'reports'
  | 'settings';
