import type { SupabaseClient } from "@supabase/supabase-js";
import type { Debt, DebtSummary } from "@/types/debt";
import type { CreateDebtBody, ListQuery, UpdateDebtBody } from "@/lib/validation";

export async function listDebts(
  supabase: SupabaseClient,
  userId: string,
  filters: ListQuery
): Promise<Debt[]> {
  let query = supabase.from("debts").select("*").eq("user_id", userId);

  if (filters.status === "unsettled") {
    query = query.is("settled_at", null);
  } else if (filters.status === "settled") {
    query = query.not("settled_at", "is", null);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.search?.trim()) {
    query = query.ilike("counterpart_name", `%${filters.search.trim()}%`);
  }

  const sort = filters.sort ?? "date_desc";
  if (sort === "date_asc") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "amount_desc") {
    query = query.order("amount", { ascending: false });
  } else if (sort === "amount_asc") {
    query = query.order("amount", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Debt[];
}

export async function fetchUnsettledDebts(
  supabase: SupabaseClient,
  userId: string
): Promise<Debt[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .is("settled_at", null);

  if (error) throw new Error(error.message);
  return (data ?? []) as Debt[];
}

export function summarizeDebts(debts: Debt[]): DebtSummary {
  let owedToMe = 0;
  let iOwe = 0;

  for (const d of debts) {
    if (d.type === "owed_to_me") owedToMe += d.amount;
    else iOwe += d.amount;
  }

  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

export async function createDebt(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDebtBody
): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: userId,
      type: input.type,
      counterpart_name: input.counterpart_name,
      amount: input.amount,
      note: input.note ?? null,
      due_date: input.due_date ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Debt;
}

export async function updateDebt(
  supabase: SupabaseClient,
  userId: string,
  debtId: string,
  input: UpdateDebtBody
): Promise<Debt> {
  const payload: Record<string, unknown> = {};

  if (input.type !== undefined) payload.type = input.type;
  if (input.counterpart_name !== undefined) {
    payload.counterpart_name = input.counterpart_name;
  }
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.note !== undefined) payload.note = input.note;
  if (input.due_date !== undefined) payload.due_date = input.due_date;

  if (input.settled === true) {
    payload.settled_at = new Date().toISOString();
  } else if (input.settled === false) {
    payload.settled_at = null;
  }

  if (Object.keys(payload).length === 0) {
    return fetchDebtById(supabase, userId, debtId);
  }

  const { data, error } = await supabase
    .from("debts")
    .update(payload)
    .eq("id", debtId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new NotFoundError("Catatan kasbon tidak ditemukan");
    }
    throw new Error(error.message);
  }

  return data as Debt;
}

export async function deleteDebt(
  supabase: SupabaseClient,
  userId: string,
  debtId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("debts")
    .delete()
    .eq("id", debtId)
    .eq("user_id", userId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new NotFoundError("Catatan kasbon tidak ditemukan");
  }
}

async function fetchDebtById(
  supabase: SupabaseClient,
  userId: string,
  debtId: string
): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("id", debtId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new NotFoundError("Catatan kasbon tidak ditemukan");
    }
    throw new Error(error.message);
  }

  return data as Debt;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
