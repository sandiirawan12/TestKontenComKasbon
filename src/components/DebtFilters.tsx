"use client";

import type { ListQuery } from "@/lib/validation";
import { Search } from "lucide-react";

interface DebtFiltersProps {
  filters: ListQuery;
  onChange: (filters: ListQuery) => void;
  groupByPerson?: boolean;
  onGroupByPersonChange?: (value: boolean) => void;
}

export function DebtFilters({
  filters,
  onChange,
  groupByPerson,
  onGroupByPersonChange,
}: DebtFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Cari nama..."
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as ListQuery["status"],
          })
        }
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
      >
        <option value="all">Semua status</option>
        <option value="unsettled">Belum lunas</option>
        <option value="settled">Lunas</option>
      </select>

      <select
        value={filters.type}
        onChange={(e) =>
          onChange({
            ...filters,
            type: e.target.value as ListQuery["type"],
          })
        }
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
      >
        <option value="all">Semua tipe</option>
        <option value="owed_to_me">Dihutang ke saya</option>
        <option value="i_owe">Saya hutang</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) =>
          onChange({
            ...filters,
            sort: e.target.value as ListQuery["sort"],
          })
        }
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
      >
        <option value="date_desc">Terbaru dulu</option>
        <option value="date_asc">Terlama dulu</option>
        <option value="amount_desc">Jumlah terbesar</option>
        <option value="amount_asc">Jumlah terkecil</option>
      </select>

      {onGroupByPersonChange && (
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={groupByPerson ?? false}
            onChange={(e) => onGroupByPersonChange(e.target.checked)}
            className="accent-emerald-600"
          />
          Kelompok per orang
        </label>
      )}
    </div>
  );
}
