import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const testDir = join(process.cwd(), "tests", "e2e");
const testFilePattern = /\.(spec|test)\.[cm]?[jt]sx?$/;

function hasE2eTests(dir) {
  if (!existsSync(dir)) {
    return false;
  }

  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory() && hasE2eTests(entryPath)) {
      return true;
    }

    if (stats.isFile() && testFilePattern.test(entry)) {
      return true;
    }
  }

  return false;
}

if (!hasE2eTests(testDir)) {
  console.log("No e2e tests found; skipping until Task 9 adds them.");
  process.exit(0);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["exec", "--", "playwright", "test"], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);
