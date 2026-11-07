import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import type { Profile } from '../types';
import { signIn as authSignIn, signOut as authSignOut, getCurrentProfile } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentProfile().then(setProfile).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentProfile().then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await authSignIn(email, password);
    setUser(data.user);
    const p = await getCurrentProfile();
    setProfile(p);
    return data;
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signIn, signOut };
}

