import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/services/debts";

type Cookie = { name: string; value: string; options: CookieOptions };

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
        setAll(cookiesToSet: Cookie[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // read-only di Server Component, abaikan
          }
        },
      },
    }
  );
}

export async function getAuthedSupabase() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const authed = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  return { supabase: authed, user };
}

export async function requireUser() {
  const auth = await getAuthedSupabase();
  if (!auth) {
    return {
      response: NextResponse.json(
        { error: "Kamu harus login dulu" },
        { status: 401 }
      ),
    };
  }
  return { supabase: auth.supabase, user: auth.user };
}

export function handleApiError(error: unknown) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  console.error("[API]", error);
  return NextResponse.json(
    { error: "Ada yang error di server, coba lagi nanti" },
    { status: 500 }
  );
}
