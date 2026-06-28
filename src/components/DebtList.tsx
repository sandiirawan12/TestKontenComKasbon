"use client";

import type { Debt } from "@/types/debt";
import {
  formatRupiah,
  formatRelativeDate,
  debtTypeLabel,
  debtStatusLabel,
  cn,
} from "@/lib/format";
import { CheckCircle2, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { deleteDebt, settleDebt } from "@/hooks/useDebts";
import { useState } from "react";

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onRefresh: () => void;
  groupByPerson?: boolean;
}

export function DebtList({ debts, onEdit, onRefresh, groupByPerson }: DebtListProps) {
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  async function handleSettle(id: string) {
    setActionId(id);
    const ok = await settleDebt(id);
    setActionId(null);
    if (ok) onRefresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus catatan hutang ${name}?`)) return;
    setActionId(id);
    const ok = await deleteDebt(id);
    setActionId(null);
    if (ok) onRefresh();
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

  if (groupByPerson) {
    const groups = buildGroups(debts);

    return (
      <div className="space-y-3">
        {groups.map((group) => {
          const groupKey = group.name.toLowerCase();
          const expanded = expandedGroups.has(groupKey);

          return (
            <section
              key={groupKey}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(groupKey)) next.delete(groupKey);
                    else next.add(groupKey);
                    return next;
                  })
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{group.name}</p>
                  <p className="text-xs text-zinc-500">
                    {group.debts.length} entry
                    {group.unsettled > 0 && ` · ${group.unsettled} belum lunas`}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-zinc-800">
                  {formatRupiah(group.total)}
                </p>
              </button>

              {expanded && (
                <div className="space-y-2 border-t border-zinc-100 p-3">
                  {group.debts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      busy={actionId === debt.id}
                      onEdit={onEdit}
                      onSettle={handleSettle}
                      onDelete={handleDelete}
                      compact
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          busy={actionId === debt.id}
          onEdit={onEdit}
          onSettle={handleSettle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

interface DebtCardProps {
  debt: Debt;
  busy: boolean;
  onEdit: (debt: Debt) => void;
  onSettle: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  compact?: boolean;
}

function DebtCard({
  debt,
  busy,
  onEdit,
  onSettle,
  onDelete,
  compact,
}: DebtCardProps) {
  const isSettled = !!debt.settled_at;
  const isOwed = debt.type === "owed_to_me";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white shadow-sm transition",
        compact ? "p-3" : "p-4",
        isSettled ? "border-zinc-100 opacity-75" : "border-zinc-200"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!compact && (
              <h3 className="font-semibold text-zinc-900">{debt.counterpart_name}</h3>
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isOwed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}
            >
              {debtTypeLabel(debt.type)}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isSettled ? "bg-zinc-100 text-zinc-500" : "bg-amber-50 text-amber-700"
              )}
            >
              {debtStatusLabel(debt.settled_at)}
            </span>
          </div>

          <p
            className={cn(
              "mt-1 font-bold",
              compact ? "text-base" : "text-lg",
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
              onClick={() => void onSettle(debt.id)}
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
            onClick={() => void onDelete(debt.id, debt.counterpart_name)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}

function buildGroups(debts: Debt[]) {
  const map = new Map<string, Debt[]>();

  for (const debt of debts) {
    const key = debt.counterpart_name.trim().toLowerCase();
    const list = map.get(key) ?? [];
    list.push(debt);
    map.set(key, list);
  }

  return Array.from(map.values())
    .map((items) => ({
      name: items[0]!.counterpart_name,
      debts: items,
      total: items.reduce((sum, d) => sum + d.amount, 0),
      unsettled: items.filter((d) => !d.settled_at).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}
