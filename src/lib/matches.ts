import { supabase } from '../supabaseClient';
import type { Match, MatchParticipant } from '../types';

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: false });
  if (error) throw error;
  return data as Match[];
}

export async function createMatch(
  matchDate: string,
  sport: string,
  opponent: string,
  sessionId: string
): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .insert({ match_date: matchDate, sport, opponent, session_id: sessionId })
    .select()
    .single();
  if (error) throw error;
  return data as Match;
}

export async function addMatchParticipant(
  matchId: string,
  playerId: string,
  score: number
): Promise<MatchParticipant> {
  const { data, error } = await supabase
    .from('match_participants')
    .insert({ match_id: matchId, player_id: playerId, score })
    .select()
    .single();
  if (error) throw error;
  return data as MatchParticipant;
}

export async function getMatchParticipants(matchId: string): Promise<MatchParticipant[]> {
  const { data, error } = await supabase
    .from('match_participants')
    .select('*')
    .eq('match_id', matchId);
  if (error) throw error;
  return data as MatchParticipant[];
}

export async function getPlayerMatches(playerId: string): Promise<
  (MatchParticipant & { matches: { match_date: string; sport: string; opponent: string } })[]
> {
  const { data, error } = await supabase
    .from('match_participants')
    .select('*, matches(match_date, sport, opponent)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as (MatchParticipant & { matches: { match_date: string; sport: string; opponent: string } })[];
}

