import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { applyUserPreferences } from '@/lib/preferences';

/**
 * Hook to get the current authenticated user from Supabase
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) applyUserPreferences(currentUser.user_metadata);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) applyUserPreferences(currentUser.user_metadata);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(data.user ?? null);
      if (data.user) applyUserPreferences(data.user.user_metadata);
    }
    return data.user ?? null;
  }, []);

  return { user, loading, refreshUser };
};
