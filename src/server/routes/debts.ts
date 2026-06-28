import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  createAuthedSupabase,
  listDebts,
  getSummaryDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  computeSummary,
} from "@/lib/services/debts";
import {
  createDebtSchema,
  updateDebtSchema,
  listQuerySchema,
} from "@/lib/validation";
import {
  requireAuth,
  handleApiError,
  type AuthedRequest,
} from "@/server/middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message ?? "Query tidak valid",
      });
      return;
    }

    const supabase = createAuthedSupabase(req.accessToken!);
    const [debts, summarySource] = await Promise.all([
      listDebts(supabase, req.userId!, parsed.data),
      getSummaryDebts(supabase, req.userId!),
    ]);
    const summary = computeSummary(summarySource);

    res.json({ data: { debts, summary } });
  } catch (error) {
    handleApiError(res, error);
  }
});

router.post("/", async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = createDebtSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message ?? "Data tidak valid",
      });
      return;
    }

    const supabase = createAuthedSupabase(req.accessToken!);
    const debt = await createDebt(supabase, req.userId!, parsed.data);

    res.status(201).json({ data: debt });
  } catch (error) {
    handleApiError(res, error);
  }
});

router.patch("/:id", async (req: AuthedRequest, res: Response) => {
  try {
    const idParsed = z.string().uuid("ID tidak valid").safeParse(req.params.id);
    if (!idParsed.success) {
      res.status(400).json({ error: "ID tidak valid" });
      return;
    }

    const parsed = updateDebtSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message ?? "Data tidak valid",
      });
      return;
    }

    const supabase = createAuthedSupabase(req.accessToken!);
    const debt = await updateDebt(
      supabase,
      req.userId!,
      idParsed.data,
      parsed.data
    );

    res.json({ data: debt });
  } catch (error) {
    handleApiError(res, error);
  }
});

router.delete("/:id", async (req: AuthedRequest, res: Response) => {
  try {
    const idParsed = z.string().uuid("ID tidak valid").safeParse(req.params.id);
    if (!idParsed.success) {
      res.status(400).json({ error: "ID tidak valid" });
      return;
    }

    const supabase = createAuthedSupabase(req.accessToken!);
    await deleteDebt(supabase, req.userId!, idParsed.data);

    res.json({ data: { success: true } });
  } catch (error) {
    handleApiError(res, error);
  }
});

export default router;
