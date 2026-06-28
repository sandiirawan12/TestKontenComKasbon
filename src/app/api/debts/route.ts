import { NextRequest, NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/supabase/server";
import {
  listDebts,
  fetchUnsettledDebts,
  createDebt,
  summarizeDebts,
} from "@/lib/services/debts";
import { createDebtSchema, listQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { supabase, user } = auth;
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Query tidak valid" },
      { status: 400 }
    );
  }

  try {
    const [debts, unsettled] = await Promise.all([
      listDebts(supabase, user.id, parsed.data),
      fetchUnsettledDebts(supabase, user.id),
    ]);
    return NextResponse.json({
      data: { debts, summary: summarizeDebts(unsettled) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

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
