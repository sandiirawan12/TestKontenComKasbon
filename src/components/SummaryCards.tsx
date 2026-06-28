import { formatRupiah, cn } from "@/lib/format";
import type { DebtSummary } from "@/types/debt";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

interface SummaryCardsProps {
  summary: DebtSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const netPositive = summary.net >= 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          Total dihutang ke saya
        </div>
        <p className="text-xl font-bold text-emerald-600 sm:text-2xl">
          {formatRupiah(summary.owedToMe)}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
          <ArrowUpRight className="h-4 w-4 text-red-500" />
          Total saya hutang
        </div>
        <p className="text-xl font-bold text-red-600 sm:text-2xl">
          {formatRupiah(summary.iOwe)}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
          <Scale className="h-4 w-4 text-zinc-400" />
          Net
        </div>
        <p
          className={cn(
            "text-xl font-bold sm:text-2xl",
            netPositive ? "text-emerald-600" : "text-red-600"
          )}
        >
          {netPositive ? "+" : ""}
          {formatRupiah(summary.net)}
        </p>
      </div>
    </div>
  );
}
