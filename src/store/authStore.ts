import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Helper to wrap auth operations with loading/error handling
const withAuthLoading = async (
  set: (state: Partial<AuthState>) => void,
  operation: () => Promise<{ error: AuthError | null }>,
  onSuccess?: () => Partial<AuthState>
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    const { error } = await operation();
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set({ loading: false, ...(onSuccess?.() || {}) });
  } catch (error) {
    set({ loading: false });
    throw error;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signUp: (email, password) =>
    withAuthLoading(set, () => supabase.auth.signUp({ email, password })),

  signIn: (email, password) =>
    withAuthLoading(set, () => supabase.auth.signInWithPassword({ email, password })),

  signOut: () =>
    withAuthLoading(
      set,
      () => supabase.auth.signOut(),
      () => ({ user: null, session: null })
    ),
})); 