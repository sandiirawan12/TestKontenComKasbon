import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/server";
import {
  listDebts,
  getSummaryDebts,
  createDebt,
  computeSummary,
} from "@/lib/services/debts";
import {
  createDebtSchema,
  listQuerySchema,
} from "@/lib/validation";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const auth = await getAuthedSupabase();
  if (!auth) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const { supabase, user } = auth;
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
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase();
  if (!auth) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const { supabase, user } = auth;

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
    return handleApiError(error);
  }
}
