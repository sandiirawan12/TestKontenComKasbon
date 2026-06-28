import { z } from "zod";

export const debtTypeSchema = z.enum(["owed_to_me", "i_owe"]);

export const createDebtSchema = z.object({
  type: debtTypeSchema,
  counterpart_name: z
    .string()
    .trim()
    .min(1, "Nama orang wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  amount: z
    .number({ invalid_type_error: "Jumlah harus angka" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
  note: z
    .string()
    .max(200, "Catatan maksimal 200 karakter")
    .nullable()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
    .nullable()
    .optional(),
});

export const updateDebtSchema = z
  .object({
    type: debtTypeSchema.optional(),
    counterpart_name: z
      .string()
      .trim()
      .min(1, "Nama orang wajib diisi")
      .max(100, "Nama maksimal 100 karakter")
      .optional(),
    amount: z
      .number({ invalid_type_error: "Jumlah harus angka" })
      .int("Jumlah harus bilangan bulat")
      .positive("Jumlah harus lebih dari 0")
      .optional(),
    note: z
      .string()
      .max(200, "Catatan maksimal 200 karakter")
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? undefined : v?.trim() ? v.trim() : null)),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
      .nullable()
      .optional(),
    settled: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diupdate",
  });

export const listQuerySchema = z.object({
  status: z.enum(["all", "unsettled", "settled"]).optional().default("all"),
  type: z.enum(["all", "owed_to_me", "i_owe"]).optional().default("all"),
  search: z.string().optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).optional().default("date_desc"),
});

export type CreateDebtBody = z.infer<typeof createDebtSchema>;
export type UpdateDebtBody = z.infer<typeof updateDebtSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
