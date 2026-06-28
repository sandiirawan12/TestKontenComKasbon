"use client";

import { useCallback, useEffect, useState } from "react";
import type { Debt, DebtSummary } from "@/types/debt";
import type { ListQuery } from "@/lib/validation";

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
      const res = await fetch(`/api/debts?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal ambil data");
        return;
      }

      setDebts(json.data.debts);
      setSummary(json.data.summary);
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

export async function saveDebt(
  body: Record<string, unknown>,
  id?: string
): Promise<string | null> {
  const res = await fetch(id ? `/api/debts/${id}` : "/api/debts", {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return json.error ?? "Gagal simpan";
  return null;
}

export async function settleDebt(id: string): Promise<boolean> {
  const res = await fetch(`/api/debts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settled: true }),
  });
  return res.ok;
}

export async function deleteDebt(id: string): Promise<boolean> {
  const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
  return res.ok;
}
