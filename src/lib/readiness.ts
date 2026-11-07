import { supabase } from '../supabaseClient';
import type { PlayerReadiness } from '../types';

export async function getAllReadiness(): Promise<PlayerReadiness[]> {
  const { data, error } = await supabase
    .from('player_readiness_view')
    .select('*')
    .eq('active', true)
    .order('readiness_status')
    .order('attendance_percentage', { ascending: false });
  if (error) throw error;
  return data as PlayerReadiness[];
}

export async function getPlayerReadiness(playerId: string): Promise<PlayerReadiness | null> {
  const { data, error } = await supabase
    .from('player_readiness_view')
    .select('*')
    .eq('player_id', playerId)
    .single();
  if (error) return null;
  return data as PlayerReadiness;
}

export async function getScoutReadyPlayers(filters?: {
  sport?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
}): Promise<PlayerReadiness[]> {
  const { data, error } = await supabase.rpc('get_scout_ready_players', {
    filter_sport: filters?.sport || null,
    filter_min_age: filters?.minAge || null,
    filter_max_age: filters?.maxAge || null,
    search_query: filters?.search || null,
  });
  if (error) throw error;
  return data as PlayerReadiness[];
}

export async function getReadySummary(): Promise<{
  total: number;
  ready: number;
  sports: string[];
}> {
  const { data, error } = await supabase
    .from('player_readiness_view')
    .select('readiness_status, sport')
    .eq('active', true);
  if (error) throw error;
  const total = data.length;
  const ready = data.filter((r: { readiness_status: string }) => r.readiness_status === 'READY').length;
  const sports = [...new Set(data.map((r: { sport: string }) => r.sport))] as string[];
  return { total, ready, sports };
}

