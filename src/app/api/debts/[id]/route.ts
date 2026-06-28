import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedSupabase } from "@/lib/supabase/server";
import { updateDebt, deleteDebt, NotFoundError } from "@/lib/services/debts";
import { updateDebtSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-error";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await getAuthedSupabase();
  if (!auth) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const { supabase, user } = auth;
  const { id } = await context.params;
  const idParsed = z.string().uuid("ID tidak valid").safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  const parsed = updateDebtSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  try {
    const debt = await updateDebt(supabase, user.id, idParsed.data, parsed.data);
    return NextResponse.json({ data: debt });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await getAuthedSupabase();
  if (!auth) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const { supabase, user } = auth;
  const { id } = await context.params;
  const idParsed = z.string().uuid("ID tidak valid").safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await deleteDebt(supabase, user.id, idParsed.data);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
