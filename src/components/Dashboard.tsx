"use client";

import { useState } from "react";
import { Plus, Wallet, Loader2, AlertCircle } from "lucide-react";
import type { Debt } from "@/types/debt";
import type { ListQuery } from "@/lib/validation";
import { useDebts } from "@/hooks/useDebts";
import { SummaryCards } from "@/components/SummaryCards";
import { DebtFilters } from "@/components/DebtFilters";
import { DebtList } from "@/components/DebtList";
import { DebtFormModal } from "@/components/DebtFormModal";
import { LogoutButton } from "@/components/LogoutButton";
import { SummaryChart } from "@/components/SummaryChart";

const defaultFilters: ListQuery = {
  status: "all",
  type: "all",
  sort: "date_desc",
};

export function Dashboard() {
  const [filters, setFilters] = useState<ListQuery>(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);

  const { debts, summary, loading, error, refetch } = useDebts(filters);

  function handleEdit(debt: Debt) {
    setEditDebt(debt);
    setModalOpen(true);
  }

  function handleNew() {
    setEditDebt(null);
    setModalOpen(true);
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Kasbon</h1>
            <p className="text-xs text-zinc-500">Track hutang piutang kamu</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <section className="mb-6 space-y-4">
        <SummaryCards summary={summary} />
        <SummaryChart summary={summary} />
      </section>

      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-800">Semua catatan</h2>
        <button
          onClick={handleNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Catat baru
        </button>
      </section>

      <div className="mb-4">
        <DebtFilters filters={filters} onChange={setFilters} />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Lagi muat data...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={() => void refetch()}
            className="ml-auto font-medium underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <DebtList debts={debts} onEdit={handleEdit} onRefresh={refetch} />
      )}

      <DebtFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        editDebt={editDebt}
      />
    </div>
  );
}
