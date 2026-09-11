import { createClient } from '@supabase/supabase-js';
import { createClient as createSsrBrowserClient } from '../utils/supabase/client';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pcwjnhnmhyswbfxzcsxg.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RK0SvTbNkPC7zfCLCDKfCg_w2Bb-5k2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const ssrBrowserClient = createSsrBrowserClient();

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
