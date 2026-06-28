"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Debt, DebtType } from "@/types/debt";
import { createDebtSchema } from "@/lib/validation";
import { createDebtApi, updateDebtApi } from "@/hooks/useDebts";

interface DebtFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDebt?: Debt | null;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

export function DebtFormModal({
  open,
  onClose,
  onSuccess,
  editDebt,
}: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>("owed_to_me");
  const [counterpartName, setCounterpartName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editDebt) {
      setType(editDebt.type);
      setCounterpartName(editDebt.counterpart_name);
      setAmount(String(editDebt.amount));
      setDueDate(editDebt.due_date ?? todayISO());
      setNote(editDebt.note ?? "");
    } else {
      setType("owed_to_me");
      setCounterpartName("");
      setAmount("");
      setDueDate(todayISO());
      setNote("");
    }
    setError(null);
  }, [editDebt, open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      type,
      counterpart_name: counterpartName,
      amount: Number(amount),
      due_date: dueDate || null,
      note: note || null,
    };

    const parsed = createDebtSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Data tidak valid");
      setLoading(false);
      return;
    }

    const result = editDebt
      ? await updateDebtApi(editDebt.id, parsed.data)
      : await createDebtApi(parsed.data);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            {editDebt ? "Edit catatan" : "Catat baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-700">Tipe</legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={type === "owed_to_me"}
                  onChange={() => setType("owed_to_me")}
                  className="accent-emerald-600"
                />
                Saya dihutang
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={type === "i_owe"}
                  onChange={() => setType("i_owe")}
                  className="accent-emerald-600"
                />
                Saya hutang
              </label>
            </div>
          </fieldset>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Nama orang *
            </label>
            <input
              required
              value={counterpartName}
              onChange={(e) => setCounterpartName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Misal: Budi"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Jumlah (Rp) *
            </label>
            <input
              required
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Tanggal
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Catatan (opsional)
            </label>
            <textarea
              maxLength={200}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Buat makan siang, dll"
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{note.length}/200</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Simpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
