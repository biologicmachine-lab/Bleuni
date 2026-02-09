/* =========================
   IMPORTS (TOP LEVEL)
========================= */
import { fingerprint } from "./utils/fingerprint.js";
import { reportMTUSupport } from "./utils/mtu.js";
import { timeline } from "./utils/timeline.js";
import { state } from "./state.js";

/* =========================
   LOG STORAGE
========================= */
const logs = [];

/* =========================
   LOG FUNCTION
========================= */
export function log(msg) {
  const time = new Date().toISOString();
  logs.push({ time, msg });

  const logEl = document.getElementById("log");
  if (logEl) logEl.innerHTML += `[${time}] ${msg}<br>`;
  if (logEl) logEl.scrollTop = logEl.scrollHeight; // auto-scroll
}

/* =========================
   EXPORT LOGS
========================= */
export function exportLogs(type = "txt") {
  const content = type === "json"
    ? JSON.stringify(logs, null, 2)
    : logs.map(l => `[${l.time}] ${l.msg}`).join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ble-log.${type}`;
  a.click();
}

/* =========================
   TIMELINE EXPORT
========================= */
export function exportTimeline() {
  const events = timeline.export();
  if (!events.length) {
    log("Timeline empty — nothing to export");
    return;
  }

  const blob = new Blob(
    [JSON.stringify(events, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ble-timeline.json";
  a.click();
}

/* =========================
   FINGERPRINT LOGGING
========================= */
export function logFingerprint() {
  if (!state.device || !state.services || !state.characteristics) {
    log("Cannot fingerprint — device or services not initialized");
    return;
  }

  const fp = fingerprint(state.device, state.services, state.characteristics);
  log(`Fingerprint: ${JSON.stringify(fp)}`);
}

/* =========================
   MTU LOGGING
========================= */
export function logMTU() {
  const mtu = reportMTUSupport();
  log(`MTU: ${mtu.supported ? "Negotiable" : "Fixed"} — ${mtu.reason}`);
}

/* =========================
   AUTO-LOG ON LOAD (Optional)
========================= */
if (state.device) logFingerprint();
logMTU();

// Example test message after all functions exist
log("Logger initialized successfully");
