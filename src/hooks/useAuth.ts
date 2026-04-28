'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';

const readIsAdmin = (currentUser: User | null): boolean => (
  currentUser?.app_metadata?.role === 'admin' || currentUser?.user_metadata?.role === 'admin'
);

export function useAuth() {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const currentUser = data.user;
      setUser(currentUser);
      setIsAdmin(readIsAdmin(currentUser));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(readIsAdmin(currentUser));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, isAdmin };
}
