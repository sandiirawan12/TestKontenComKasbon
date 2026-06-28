"use client";

import type { Debt } from "@/types/debt";
import {
  formatRupiah,
  formatRelativeDate,
  debtTypeLabel,
  debtStatusLabel,
  cn,
} from "@/lib/format";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { deleteDebtApi, settleDebtApi } from "@/hooks/useDebts";
import { useState } from "react";

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onRefresh: () => void;
}

export function DebtList({ debts, onEdit, onRefresh }: DebtListProps) {
  const [actionId, setActionId] = useState<string | null>(null);

  async function handleSettle(id: string) {
    setActionId(id);
    const result = await settleDebtApi(id);
    setActionId(null);
    if (result.ok) onRefresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus catatan hutang ${name}?`)) return;
    setActionId(id);
    const result = await deleteDebtApi(id);
    setActionId(null);
    if (result.ok) onRefresh();
  }

  if (debts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">Belum ada catatan nih</p>
        <p className="mt-1 text-xs text-zinc-400">
          Tap &quot;+ Catat baru&quot; buat mulai
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => {
        const isSettled = !!debt.settled_at;
        const isOwed = debt.type === "owed_to_me";
        const busy = actionId === debt.id;

        return (
          <article
            key={debt.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-sm transition",
              isSettled ? "border-zinc-100 opacity-75" : "border-zinc-200"
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-zinc-900">
                    {debt.counterpart_name}
                  </h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      isOwed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {debtTypeLabel(debt.type)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      isSettled
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {debtStatusLabel(debt.settled_at)}
                  </span>
                </div>

                <p
                  className={cn(
                    "mt-1 text-lg font-bold",
                    isOwed ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {formatRupiah(debt.amount)}
                </p>

                <p className="mt-0.5 text-xs text-zinc-400">
                  {formatRelativeDate(debt.created_at)}
                  {debt.note && ` · ${debt.note}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {!isSettled && (
                  <button
                    disabled={busy}
                    onClick={() => void handleSettle(debt.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tandai lunas
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => onEdit(debt)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() => void handleDelete(debt.id, debt.counterpart_name)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
