import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type {
  CreateDebtInput,
  Debt,
  DebtSummary,
  DebtStatusFilter,
  DebtTypeFilter,
  UpdateDebtInput,
} from "@/types/debt";
import type { ListQuery } from "@/lib/validation";

export function createAuthedSupabase(accessToken: string): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getUserFromToken(
  supabase: SupabaseClient
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

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

  switch (filters.sort) {
    case "date_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "amount_desc":
      query = query.order("amount", { ascending: false });
      break;
    case "amount_asc":
      query = query.order("amount", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Debt[];
}

export async function getSummaryDebts(
  supabase: SupabaseClient,
  userId: string
): Promise<Debt[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .is("settled_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Debt[];
}

export function computeSummary(debts: Debt[]): DebtSummary {
  const unsettled = debts.filter((d) => !d.settled_at);

  const owedToMe = unsettled
    .filter((d) => d.type === "owed_to_me")
    .reduce((sum, d) => sum + d.amount, 0);

  const iOwe = unsettled
    .filter((d) => d.type === "i_owe")
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    owedToMe,
    iOwe,
    net: owedToMe - iOwe,
  };
}

export async function createDebt(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDebtInput
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

  if (error) {
    throw new Error(error.message);
  }

  return data as Debt;
}

export async function updateDebt(
  supabase: SupabaseClient,
  userId: string,
  debtId: string,
  input: UpdateDebtInput
): Promise<Debt> {
  const payload: Record<string, unknown> = {};

  if (input.type !== undefined) payload.type = input.type;
  if (input.counterpart_name !== undefined)
    payload.counterpart_name = input.counterpart_name;
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.note !== undefined) payload.note = input.note;
  if (input.due_date !== undefined) payload.due_date = input.due_date;

  if (input.settled === true) {
    payload.settled_at = new Date().toISOString();
  } else if (input.settled === false) {
    payload.settled_at = null;
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

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new NotFoundError("Catatan kasbon tidak ditemukan");
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Kamu harus login dulu") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type { DebtStatusFilter, DebtTypeFilter };
