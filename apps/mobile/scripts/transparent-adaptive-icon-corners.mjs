/**
 * Makes outer white canvas transparent on adaptive-icon.png (PNG alpha).
 * Flood-fills from the four corners through "light neutral" pixels only, so
 * the dark squircle + arc block the fill and the center white dot stays.
 *
 * Run: pnpm --filter @focusflow/mobile exec node scripts/transparent-adaptive-icon-corners.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.join(__dirname, "..");
const iconPath = path.join(mobileRoot, "assets", "adaptive-icon.png");

/** Pixels that look like white/gray background (not tinted arc); blocks dark squircle */
function isLightNeutralBackground(r, g, b, a) {
  if (a < 8) return false;
  const m = Math.min(r, g, b);
  if (m < 195) return false;
  return Math.max(r, g, b) - m < 35;
}

function run() {
  const buf = fs.readFileSync(iconPath);
  const png = PNG.sync.read(buf);
  const { width: W, height: H, data } = png;
  const visited = new Uint8Array(W * H);
  const q = [];

  function push(x, y) {
    const k = y * W + x;
    if (visited[k]) return;
    const i = k * 4;
    if (!isLightNeutralBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    visited[k] = 1;
    q.push(x, y);
  }

  for (const [x, y] of [
    [0, 0],
    [W - 1, 0],
    [0, H - 1],
    [W - 1, H - 1],
  ]) {
    push(x, y);
  }

  for (let qi = 0; qi < q.length; qi += 2) {
    const x = q[qi];
    const y = q[qi + 1];
    const i = (y * W + x) * 4;
    data[i + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }

  fs.writeFileSync(iconPath, PNG.sync.write(png));
  console.log("Wrote transparent corners:", iconPath);
}

run();
