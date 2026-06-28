import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import "@/lib/supabase/dev-tls";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore jika cookie read-only
          }
        },
      },
    }
  );
}

async function resolveUser(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ user: User; accessToken: string } | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  return { user, accessToken: session.access_token };
}

function createAuthedClient(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export async function getAuthedSupabase() {
  const supabase = await createClient();
  const auth = await resolveUser(supabase);
  if (!auth) return null;
  return {
    supabase: createAuthedClient(auth.accessToken),
    user: auth.user,
  };
}

export async function getSessionUser() {
  const auth = await getAuthedSupabase();
  return auth?.user ?? null;
}
