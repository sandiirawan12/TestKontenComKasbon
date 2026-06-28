"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Calendar, X } from "lucide-react";
import type { Debt, DebtType } from "@/types/debt";
import { createDebtSchema } from "@/lib/validation";
import { saveDebt } from "@/hooks/useDebts";
import { formatDateDMY, parseDMYDateToISO } from "@/lib/format";

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
  const [dueDateDisplay, setDueDateDisplay] = useState(formatDateDMY(todayISO()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);

  function getDueDateISO(): string {
    return parseDMYDateToISO(dueDateDisplay) ?? todayISO();
  }

  function openDatePicker() {
    const picker = datePickerRef.current;
    if (!picker) return;

    picker.value = getDueDateISO();
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  }

  useEffect(() => {
    if (editDebt) {
      setType(editDebt.type);
      setCounterpartName(editDebt.counterpart_name);
      setAmount(String(editDebt.amount));
      const iso = editDebt.due_date ?? todayISO();
      setDueDateDisplay(formatDateDMY(iso));
      setNote(editDebt.note ?? "");
    } else {
      setType("owed_to_me");
      setCounterpartName("");
      setAmount("");
      const iso = todayISO();
      setDueDateDisplay(formatDateDMY(iso));
      setNote("");
    }
    setError(null);
  }, [editDebt, open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let resolvedDueDate: string | null = null;
    if (dueDateDisplay.trim()) {
      const iso = parseDMYDateToISO(dueDateDisplay);
      if (!iso) {
        setError("Format tanggal tidak valid (contoh: 29/6/2026)");
        setLoading(false);
        return;
      }
      resolvedDueDate = iso;
    }

    const payload = {
      type,
      counterpart_name: counterpartName,
      amount: Number(amount),
      due_date: resolvedDueDate,
      note: note || null,
    };

    const parsed = createDebtSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Data tidak valid");
      setLoading(false);
      return;
    }

    const err = await saveDebt(parsed.data, editDebt?.id);
    setLoading(false);

    if (err) {
      setError(err);
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
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={dueDateDisplay}
                onChange={(e) => setDueDateDisplay(e.target.value)}
                onBlur={() => {
                  if (!dueDateDisplay.trim()) return;
                  const iso = parseDMYDateToISO(dueDateDisplay);
                  if (iso) setDueDateDisplay(formatDateDMY(iso));
                }}
                placeholder="29/6/2026"
                className="w-full rounded-xl border border-zinc-200 py-2 pl-3 pr-11 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={openDatePicker}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Pilih tanggal"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <input
                ref={datePickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                onChange={(e) => {
                  if (e.target.value) {
                    setDueDateDisplay(formatDateDMY(e.target.value));
                  }
                }}
              />
            </div>
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
