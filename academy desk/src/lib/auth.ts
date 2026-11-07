import { supabase } from '../supabaseClient';
import type { Profile, UserRole } from '../types';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole,
  playerId?: string
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Signup failed');

  const profileData: Omit<Profile, 'id' | 'created_at'> = {
    auth_id: data.user.id,
    email,
    name,
    role,
    player_id: playerId ?? null,
  };

  const { error: profileError } = await supabase.from('profiles').insert(profileData);
  if (profileError) throw profileError;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try by auth_id first
  let { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  // If not found by auth_id, fallback to matching email and link auth_id
  if (!data && user.email) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (byEmail) {
      await supabase
        .from('profiles')
        .update({ auth_id: user.id })
        .eq('id', byEmail.id);
      data = { ...byEmail, auth_id: user.id };
    }
  }

  return (data as Profile) || null;
}

export async function ensureDefaultAccounts() {
  // Ensure default coach
  const { data: coachExisting } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'coach')
    .limit(1);

  if (!coachExisting || coachExisting.length === 0) {
    try {
      await signUp('coach@academydesk.in', 'Coach@1234', 'Head Coach', 'coach');
    } catch {
      // already exists
    }
  }

  // Ensure default scout
  const { data: scoutExisting } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'scout')
    .limit(1);

  if (!scoutExisting || scoutExisting.length === 0) {
    try {
      await signUp('scout@academydesk.in', 'Scout@1234', 'Talent Scout (Jharkhand)', 'scout');
    } catch {
      // already exists
    }
  }

  // Ensure default player
  const { data: playerExisting } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'player@academydesk.in')
    .limit(1);

  if (!playerExisting || playerExisting.length === 0) {
    try {
      await signUp('player@academydesk.in', 'Player@1234', 'Rohit Soren', 'player', 'PLY-101');
    } catch {
      // already exists
    }
  }
}

export const ensureDefaultCoach = ensureDefaultAccounts;

