import express from "express";
import debtsRouter from "@/server/routes/debts";

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/debts", debtsRouter);

  app.use(
    (
      _err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[Express]", _err);
      res.status(500).json({ error: "Ada yang error di server, coba lagi nanti" });
    }
  );

  return app;
}
