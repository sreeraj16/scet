import { createServerClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pcwjnhnmhyswbfxzcsxg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_RK0SvTbNkPC7zfCLCDKfCg_w2Bb-5k2";

export const createClient = (cookieStore?: any) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : []
        },
        setAll(cookiesToSet) {
          try {
            if (cookieStore) {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            }
          } catch {
            // Server Component ignore
          }
        },
      },
    },
  );
};
