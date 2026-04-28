'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseEnv } from '@/lib/supabase/config';

export function useSupabase() {
  return useMemo(() => {
    if (!hasSupabaseEnv()) return null;
    return createClient();
  }, []);
}
