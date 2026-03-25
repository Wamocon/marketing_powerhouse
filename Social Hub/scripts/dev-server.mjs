import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const pythonExe = path.join(repoRoot, ".venv", "Scripts", "python.exe");
const host = "127.0.0.1";
const candidatePorts = Array.from({ length: 11 }, (_, index) => 8000 + index);

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function pickPort() {
  for (const port of candidatePorts) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error(`No free port found in ${candidatePorts.join(", ")}`);
}

async function main() {
  const port = await pickPort();

  console.log(`Starting SocialHub dev server on http://${host}:${port}`);

  const child = spawn(
    pythonExe,
    ["-m", "uvicorn", "app.main:app", "--host", host, "--port", String(port), "--reload"],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("Failed to start SocialHub dev server.");
  console.error(error.message);
  process.exit(1);
});