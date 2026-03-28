import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

rmSync(path.join(rootDir, "dist"), { recursive: true, force: true });

const steps = [
  ["tsc", ["-p", "./tsconfig.json"]],
  ["node", ["./scripts/build-browser-bundle.mjs"]],
];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
