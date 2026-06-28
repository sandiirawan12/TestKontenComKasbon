import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  listDebts,
  getSummaryDebts,
  createDebt,
  computeSummary,
  NotFoundError,
} from "@/lib/services/debts";
import {
  createDebtSchema,
  listQuerySchema,
} from "@/lib/validation";

async function getAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null };
  }

  return { supabase, user };
}

function handleError(error: unknown) {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  console.error("[API]", error);
  return NextResponse.json(
    { error: "Ada yang error di server, coba lagi nanti" },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthedUser();
  if (!supabase || !user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Query tidak valid" },
      { status: 400 }
    );
  }

  try {
    const [debts, summarySource] = await Promise.all([
      listDebts(supabase, user.id, parsed.data),
      getSummaryDebts(supabase, user.id),
    ]);
    const summary = computeSummary(summarySource);
    return NextResponse.json({ data: { debts, summary } });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthedUser();
  if (!supabase || !user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  const parsed = createDebtSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  try {
    const debt = await createDebt(supabase, user.id, parsed.data);
    return NextResponse.json({ data: debt }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
