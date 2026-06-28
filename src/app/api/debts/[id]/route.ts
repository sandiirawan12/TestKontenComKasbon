import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateDebt, deleteDebt, NotFoundError } from "@/lib/services/debts";
import { updateDebtSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { supabase, user } = await getAuthedUser();
  if (!supabase || !user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

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
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { supabase, user } = await getAuthedUser();
  if (!supabase || !user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid("ID tidak valid").safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await deleteDebt(supabase, user.id, idParsed.data);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
}
