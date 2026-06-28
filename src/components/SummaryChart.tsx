"use client";

import type { DebtSummary } from "@/types/debt";
import { formatRupiah } from "@/lib/format";

interface SummaryChartProps {
  summary: DebtSummary;
}

export function SummaryChart({ summary }: SummaryChartProps) {
  const total = summary.owedToMe + summary.iOwe;
  if (total === 0) return null;

  const owedPct = Math.round((summary.owedToMe / total) * 100);
  const owePct = 100 - owedPct;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-zinc-600">Perbandingan hutang</p>
      <div className="flex h-4 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${owedPct}%` }}
          title={`Dihutang: ${formatRupiah(summary.owedToMe)}`}
        />
        <div
          className="bg-red-400 transition-all duration-500"
          style={{ width: `${owePct}%` }}
          title={`Hutang: ${formatRupiah(summary.iOwe)}`}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Dihutang {owedPct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          Hutang {owePct}%
        </span>
      </div>
    </div>
  );
}
