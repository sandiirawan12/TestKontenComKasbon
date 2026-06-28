"use client";

import { useCallback, useEffect, useState } from "react";
import type { Debt, DebtSummary } from "@/types/debt";
import type { ListQuery } from "@/lib/validation";

interface DebtsResponse {
  data: {
    debts: Debt[];
    summary: DebtSummary;
  };
}

interface ApiErrorResponse {
  error: string;
}

export function useDebts(filters: ListQuery) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary>({
    owedToMe: 0,
    iOwe: 0,
    net: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);

    try {
      const res = await fetch(`/api/debts?${params.toString()}`);
      const json = (await res.json()) as DebtsResponse | ApiErrorResponse;

      if (!res.ok) {
        setError("error" in json ? json.error : "Gagal ambil data");
        return;
      }

      if ("data" in json) {
        setDebts(json.data.debts);
        setSummary(json.data.summary);
      }
    } catch {
      setError("Koneksi bermasalah, coba lagi ya");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchDebts();
  }, [fetchDebts]);

  return { debts, summary, loading, error, refetch: fetchDebts };
}

export async function createDebtApi(
  body: Record<string, unknown>
): Promise<{ ok: true; debt: Debt } | { ok: false; error: string }> {
  const res = await fetch("/api/debts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { data?: Debt; error?: string };

  if (!res.ok) {
    return { ok: false, error: json.error ?? "Gagal simpan" };
  }

  return { ok: true, debt: json.data! };
}

export async function updateDebtApi(
  id: string,
  body: Record<string, unknown>
): Promise<{ ok: true; debt: Debt } | { ok: false; error: string }> {
  const res = await fetch(`/api/debts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { data?: Debt; error?: string };

  if (!res.ok) {
    return { ok: false, error: json.error ?? "Gagal update" };
  }

  return { ok: true, debt: json.data! };
}

export async function deleteDebtApi(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
  const json = (await res.json()) as { error?: string };

  if (!res.ok) {
    return { ok: false, error: json.error ?? "Gagal hapus" };
  }

  return { ok: true };
}

export async function settleDebtApi(
  id: string
): Promise<{ ok: true; debt: Debt } | { ok: false; error: string }> {
  return updateDebtApi(id, { settled: true });
}
