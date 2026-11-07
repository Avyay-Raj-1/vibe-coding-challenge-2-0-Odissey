import { supabase } from '../supabaseClient';
import type { Session, AttendanceRecord } from '../types';

export async function getSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: false });
  if (error) throw error;
  return data as Session[];
}

export async function getSessionByDateSport(date: string, sport: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_date', date)
    .eq('sport', sport)
    .single();
  if (error) return null;
  return data as Session;
}

export async function createSession(
  sessionDate: string,
  sport: string,
  createdBy: string
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_date: sessionDate, sport, status: 'OPEN', created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}

export async function closeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'CLOSED', closed_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('session_id', sessionId);
  if (error) throw error;
  return data as AttendanceRecord[];
}

