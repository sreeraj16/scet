import { createServerClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pcwjnhnmhyswbfxzcsxg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_RK0SvTbNkPC7zfCLCDKfCg_w2Bb-5k2";

export const createClient = (request: any) => {
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies ? request.cookies.getAll() : []
        },
        setAll(cookiesToSet) {
          if (request.cookies) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          }
        },
      },
    },
  );

  return supabase;
};
