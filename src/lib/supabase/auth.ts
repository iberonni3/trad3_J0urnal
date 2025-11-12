import { supabase } from '@/integrations/supabase/client';

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });
  
  return { data, error };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });
  
  return { data, error };
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const sendPasswordResetEmail = async (email: string) => {
  const redirectTo = `${window.location.origin}/`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { data, error };
};

type UserProfileUpdate = {
  displayName?: string;
  fontSize?: 'small' | 'medium' | 'large';
  accentColor?: 'indigo' | 'emerald' | 'purple';
  tradingGoal?: string;
};

export const updateUserProfile = async (updates: UserProfileUpdate) => {
  const metadataUpdates: Record<string, any> = {};
  if (updates.displayName !== undefined) metadataUpdates.display_name = updates.displayName;
  if (updates.fontSize !== undefined) metadataUpdates.font_size = updates.fontSize;
  if (updates.accentColor !== undefined) metadataUpdates.accent_color = updates.accentColor;
  if (updates.tradingGoal !== undefined) metadataUpdates.trading_goal = updates.tradingGoal;

  const { data, error } = await supabase.auth.updateUser({
    data: metadataUpdates,
  });

  return { data, error };
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};
