export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtSummary {
  owedToMe: number;
  iOwe: number;
  net: number;
}

export interface CreateDebtInput {
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note?: string | null;
  due_date?: string | null;
}

export interface UpdateDebtInput {
  type?: DebtType;
  counterpart_name?: string;
  amount?: number;
  note?: string | null;
  due_date?: string | null;
  settled?: boolean;
}

export type DebtStatusFilter = "all" | "unsettled" | "settled";
export type DebtTypeFilter = "all" | DebtType;

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T> {
  data: T;
}
