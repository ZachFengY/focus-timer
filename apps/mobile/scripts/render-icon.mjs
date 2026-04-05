/**
 * Writes assets/icon.png — same arc/dot design as adaptive-icon.png
 * but on a SOLID #0B0B0E background (no transparency).
 * iOS App Store requires fully opaque 1024×1024 icons.
 *
 * Run: pnpm --filter @focusflow/mobile exec node scripts/render-icon.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1024;
const mobileRoot = path.join(__dirname, "..");
const outPath = path.join(mobileRoot, "assets", "icon.png");

const BG = { r: 0x0b, g: 0x0b, b: 0x0e };

const cx = W / 2;
const cy = W / 2;
const outerR = W * 0.4;
const innerR = W * 0.25;
const strokeW = W * 0.09;
const innerStrokeW = strokeW * 0.28;
const dotR = strokeW * 0.55;

const colors = ["#6366F1", "#818CF8", "#C7D2FE", "#A5B4FC", "#6366F1"];

function mixHex(a, b, f) {
  const pa = a.slice(1).match(/.{2}/g).map((x) => parseInt(x, 16));
  const pb = b.slice(1).match(/.{2}/g).map((x) => parseInt(x, 16));
  return [
    Math.round(pa[0] + (pb[0] - pa[0]) * f),
    Math.round(pa[1] + (pb[1] - pa[1]) * f),
    Math.round(pa[2] + (pb[2] - pa[2]) * f),
  ];
}

function toDeg(theta) {
  let deg = (theta * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

function angleOnArcDeg(deg) {
  if (deg >= 60) return true;
  return deg === 0;
}

function arcColor(deg) {
  const u = deg >= 60 ? (deg - 60) / 300 : 1;
  const idx = Math.min(colors.length - 2, Math.floor(u * (colors.length - 1)));
  const f = u * (colors.length - 1) - idx;
  return mixHex(colors[idx], colors[idx + 1], f);
}

function blend(png, x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= W || a <= 0) return;
  const i = (y * W + x) * 4;
  const aa = a / 255;
  const oa = png.data[i + 3] / 255;
  const na = aa + oa * (1 - aa);
  if (na <= 0) return;
  png.data[i] = Math.round((r * aa + png.data[i] * oa * (1 - aa)) / na);
  png.data[i + 1] = Math.round((g * aa + png.data[i + 1] * oa * (1 - aa)) / na);
  png.data[i + 2] = Math.round((b * aa + png.data[i + 2] * oa * (1 - aa)) / na);
  png.data[i + 3] = Math.round(na * 255);
}

const png = new PNG({ width: W, height: W });

for (let i = 0; i < W * W; i++) {
  png.data[i * 4] = BG.r;
  png.data[i * 4 + 1] = BG.g;
  png.data[i * 4 + 2] = BG.b;
  png.data[i * 4 + 3] = 255;
}

for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const rho = Math.hypot(dx, dy);
    const theta = Math.atan2(dy, dx);
    const deg = toDeg(theta);

    // Inner faint ring
    {
      const d = Math.abs(rho - innerR);
      if (d <= innerStrokeW / 2) {
        const edge = innerStrokeW / 2 - d;
        const a = 0.18 * Math.min(1, edge * 2) * 255;
        blend(png, x, y, 99, 102, 241, a);
      }
    }

    // Main arc stroke
    if (angleOnArcDeg(deg)) {
      const d = Math.abs(rho - outerR);
      if (d <= strokeW / 2) {
        const [r, g, b] = arcColor(deg);
        const edge = strokeW / 2 - d;
        const a = Math.min(1, edge * 2) * 255;
        blend(png, x, y, r, g, b, a);
      }
    }

    // Dot (at 60°)
    const dotRad = (60 * Math.PI) / 180;
    const dotX = cx + outerR * Math.cos(dotRad);
    const dotY = cy + outerR * Math.sin(dotRad);
    const dist = Math.hypot(x - dotX, y - dotY);
    if (dist <= dotR * 2) {
      const glow = 0.35 * (1 - dist / (dotR * 2));
      blend(png, x, y, 199, 210, 254, glow * 255);
    }
    if (dist <= dotR) {
      blend(png, x, y, 255, 255, 255, 255);
    }
  }
}

fs.writeFileSync(outPath, PNG.sync.write(png));
console.log("Wrote", outPath);
