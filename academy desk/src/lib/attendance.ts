import { supabase } from '../supabaseClient';
import type { AttendanceRecord } from '../types';

export async function markAttendance(
  sessionId: string,
  playerId: string,
  status: 'PRESENT' | 'ABSENT'
): Promise<void> {
  const { error } = await supabase
    .from('attendance')
    .upsert({ session_id: sessionId, player_id: playerId, status }, { onConflict: 'session_id,player_id' });
  if (error) throw error;
}

export async function getPlayerAttendance(playerId: string): Promise<(AttendanceRecord & { sessions: { session_date: string; sport: string; status: string } })[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, sessions(session_date, sport, status)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as (AttendanceRecord & { sessions: { session_date: string; sport: string; status: string } })[];
}

