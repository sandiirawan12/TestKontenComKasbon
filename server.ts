import { createServer } from "http";
import next from "next";
import { createExpressApp } from "@/server/app";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const expressApp = createExpressApp();
  const server = createServer((req, res) => {
    const url = req.url ?? "";

    if (url.startsWith("/api/")) {
      expressApp(req, res);
      return;
    }

    handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Kasbon jalan di http://${hostname}:${port}`);
  });
});
