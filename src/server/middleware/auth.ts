import type { Request, Response, NextFunction } from "express";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  getUserFromToken,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/lib/services/debts";

export interface AuthedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

type CookieToSet = { name: string; value: string; options: CookieOptions };

function createSupabaseFromRequest(req: Request, res: Response) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = [];
          const raw = req.headers.cookie ?? "";
          raw.split(";").forEach((part) => {
            const [name, ...rest] = part.trim().split("=");
            if (name) {
              cookies.push({ name, value: rest.join("=") });
            }
          });
          return cookies;
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [`${name}=${value}`];
            if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
            if (options?.path) parts.push(`Path=${options.path}`);
            if (options?.httpOnly) parts.push("HttpOnly");
            if (options?.secure) parts.push("Secure");
            if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
            res.appendHeader("Set-Cookie", parts.join("; "));
          });
        },
      },
    }
  );
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  let supabase = createSupabaseFromRequest(req, res);
  let user = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { createAuthedSupabase } = await import("@/lib/services/debts");
    supabase = createAuthedSupabase(token);
    user = await getUserFromToken(supabase);
    if (user) {
      req.accessToken = token;
    }
  } else {
    user = await getUserFromToken(supabase);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    req.accessToken = session?.access_token;
  }

  if (!user || !req.accessToken) {
    res.status(401).json({ error: "Kamu harus login dulu" });
    return;
  }

  req.userId = user.id;
  next();
}

export function handleApiError(res: Response, error: unknown): void {
  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  console.error("[API Error]", error);
  res.status(500).json({ error: "Ada yang error di server, coba lagi nanti" });
}
