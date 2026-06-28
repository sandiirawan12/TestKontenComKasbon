import { format, formatDistanceToNow, isToday, isValid, isYesterday, parse, parseISO } from "date-fns";
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

/** ISO (yyyy-MM-dd) → tampilan DD/MM/YYYY, contoh: 29/6/2026 */
export function formatDateDMY(iso: string): string {
  return format(parseISO(iso), "d/M/yyyy");
}

/** Tampilan DD/MM/YYYY → ISO (yyyy-MM-dd), null jika kosong/tidak valid */
export function parseDMYDateToISO(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parse(trimmed, "d/M/yyyy", new Date());
  if (!isValid(parsed)) return null;

  return format(parsed, "yyyy-MM-dd");
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
