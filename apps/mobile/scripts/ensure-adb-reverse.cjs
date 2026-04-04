"use strict";
/**
 * Android emulator: forward emulator localhost:8081 → host Metro (same port).
 * Without this, the app cannot reach the packager and shows "Unable to load script".
 * No-op if adb is missing or no device is connected.
 */
const { spawnSync } = require("child_process");
const path = require("path");

function adbPath() {
  const home = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (home) {
    return path.join(home, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb");
  }
  return process.platform === "win32" ? "adb.exe" : "adb";
}

const adb = adbPath();
const ok = spawnSync(adb, ["reverse", "tcp:8081", "tcp:8081"], {
  encoding: "utf8",
  windowsHide: true,
}).status;

if (ok === 0) {
  process.stderr.write("[adb] reverse tcp:8081 → host Metro (Android emulator / USB device)\n");
}
