import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tlsFix = path.join(__dirname, "tls-fix.cjs");
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, ["--require", tlsFix, nextBin, "dev"], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
