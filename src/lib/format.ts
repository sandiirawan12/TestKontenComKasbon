import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return "hari ini";
  }

  if (isYesterday(date)) {
    return "kemarin";
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: localeId });
}

export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return "-";
  return format(parseISO(dateString), "d MMM yyyy", { locale: localeId });
}

export function debtTypeLabel(type: "owed_to_me" | "i_owe"): string {
  return type === "owed_to_me" ? "Dihutang ke saya" : "Saya hutang";
}

export function debtStatusLabel(settledAt: string | null): string {
  return settledAt ? "Lunas" : "Belum lunas";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
