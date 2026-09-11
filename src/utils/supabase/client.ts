import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcwjnhnmhyswbfxzcsxg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_RK0SvTbNkPC7zfCLCDKfCg_w2Bb-5k2";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
