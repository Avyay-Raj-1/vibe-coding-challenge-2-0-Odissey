import { supabase } from '../supabaseClient';
import type { Player } from '../types';

export async function getPlayers(onlyActive = false): Promise<Player[]> {
  let query = supabase.from('players').select('*').order('name');
  if (onlyActive) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as Player[];
}

export async function getPlayersBySport(sport: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('sport', sport)
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data as Player[];
}

export async function getPlayerById(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_id', playerId)
    .single();
  if (error) return null;
  return data as Player;
}

export async function addPlayer(player: Omit<Player, 'id' | 'created_at' | 'active'>): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({ ...player, active: true })
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(
  playerId: string,
  updates: Partial<Pick<Player, 'name' | 'age' | 'sport' | 'joining_date'>>
): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('player_id', playerId)
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function deactivatePlayer(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .update({ active: false })
    .eq('player_id', playerId);
  if (error) throw error;
}

