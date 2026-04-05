"use strict";
/**
 * Windows / macOS / Linux: adb reverse → install debug APK → launch MainActivity.
 * Run from repo root: pnpm --filter @focusflow/mobile exec node scripts/run-android-emulator.cjs
 * Or from apps/mobile: node scripts/run-android-emulator.cjs
 *
 * Requires: Android SDK platform-tools (adb), emulator or USB device, and
 * apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk (build with Gradle first).
 *
 * After changing Android splash/icon: edit res/drawable/splashscreen.xml or mipmap icons,
 * then rebuild the APK — native resources are not updated by Metro alone.
 */
const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function adbPath() {
  const home = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (home) {
    return path.join(
      home,
      "platform-tools",
      process.platform === "win32" ? "adb.exe" : "adb",
    );
  }
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA;
    if (local) {
      const p = path.join(local, "Android", "Sdk", "platform-tools", "adb.exe");
      if (fs.existsSync(p)) return p;
    }
  }
  return process.platform === "win32" ? "adb.exe" : "adb";
}

const mobileRoot = path.join(__dirname, "..");
const apk = path.join(
  mobileRoot,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);

const adb = adbPath();

function run(args) {
  const r = spawnSync(adb, args, {
    encoding: "utf8",
    stdio: "inherit",
    windowsHide: true,
  });
  return r.status === 0;
}

if (!fs.existsSync(apk)) {
  console.error(
    "[run-android-emulator] Missing APK:\n  " + apk + "\n" +
      "Build first: cd apps/mobile/android && .\\gradlew assembleDebug (Windows)\n",
  );
  process.exit(1);
}

const devices = spawnSync(adb, ["devices"], { encoding: "utf8", windowsHide: true });
if (!/\bdevice\b/.test(devices.stdout || "") || (devices.stdout || "").split("\n").filter((l) => l.includes("\tdevice")).length === 0) {
  console.error("[run-android-emulator] No Android device/emulator in `adb devices`. Start an AVD first.");
  process.exit(1);
}

if (!run(["reverse", "tcp:8081", "tcp:8081"])) {
  console.error("[run-android-emulator] adb reverse failed.");
  process.exit(1);
}

if (!run(["install", "-r", apk])) {
  console.error("[run-android-emulator] adb install failed.");
  process.exit(1);
}

spawnSync(adb, ["shell", "am", "force-stop", "app.focusflow.mobile"], {
  stdio: "ignore",
  windowsHide: true,
});

if (
  !run([
    "shell",
    "am",
    "start",
    "-n",
    "app.focusflow.mobile/.MainActivity",
  ])
) {
  process.exit(1);
}

console.log("[run-android-emulator] Installed, reversed :8081, launched MainActivity. Start Metro: pnpm dev:mobile");
