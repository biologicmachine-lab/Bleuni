import * as BLE from "./ble.js";
import { state } from "./state.js";
import { log, exportLogs, exportTimeline, logFingerprint, logMTU } from "./logger.js";
import { PROFILES } from "./profiles.js";
import { MACROS } from "./macros.js";
import { ROLES } from "./roles.js";

/* DOM elements */
const action = document.getElementById("actionSelect");
const exec = document.getElementById("executeBtn");
const svcSel = document.getElementById("serviceSelect");
const charSel = document.getElementById("charSelect");
const svcFilter = document.getElementById("serviceFilter");
const charFilter = document.getElementById("charFilter");
const writeVal = document.getElementById("writeValue");
const profileSel = document.getElementById("profileSelect");
const exportTxt = document.getElementById("exportTxt");
const exportJson = document.getElementById("exportJson");
const scanBtn = document.getElementById("scanBtn");
const deviceSelect = document.getElementById("deviceSelect");

/* ROLE ENFORCEMENT */
let currentRole = ROLES.ADMIN;
function enforceRole() {
  const writeOpt = document.querySelector('[value="write"]');
  const notifyOpt = document.querySelector('[value="notify"]');
  if (writeOpt) writeOpt.disabled = !currentRole.write;
  if (notifyOpt) notifyOpt.disabled = !currentRole.notify;
}
enforceRole();

/* PROFILE SELECT */
Object.keys(PROFILES).forEach(p => profileSel.innerHTML += `<option value="${p}">${p}</option>`);
profileSel.onchange = () => {
  const profile = PROFILES[profileSel.value] || {};
  svcFilter.value = profile.service || "";
  charFilter.value = profile.characteristic || "";
  log(`Profile loaded: ${profileSel.value}`);
};

/* ACTION SELECT */
action.onchange = () => {
  exec.disabled = false;
  writeVal.style.display = action.value === "write" ? "block" : "none";
};

/* EXECUTE BUTTON */
exec.onclick = async () => {
  try {
    switch (action.value) {
      case "discover": await BLE.discover(); break;
      case "connect": await BLE.connect(); break;
      case "services":
        svcSel.innerHTML = "";
        (await BLE.getServices(svcFilter.value)).forEach(s =>
          svcSel.innerHTML += `<option value="${s.uuid}">${s.uuid}</option>`
        );
        svcSel.disabled = false;
        break;
      case "characteristics":
        state.service = state.services.find(s => s.uuid === svcSel.value);
        charSel.innerHTML = "";
        (await BLE.getCharacteristics(charFilter.value)).forEach(c =>
          charSel.innerHTML += `<option value="${c.uuid}">${c.uuid}</option>`
        );
        charSel.disabled = false;
        break;
      case "read":
        state.characteristic = state.characteristics.find(c => c.uuid === charSel.value);
        await BLE.read();
        break;
      case "write":
        await BLE.write(writeVal.value);
        break;
      case "notify":
        await BLE.notify();
        break;
    }
  } catch (err) {
    log(`Execution error: ${err.message}`);
  }
};

/* MACROS */
export async function runMacro(name) {
  const macro = MACROS[name];
  if (!macro) return log(`Macro not found: ${name}`);
  for (const step of macro) {
    if (step.action === "write") await BLE.write(step.value);
    if (step.action === "read") await BLE.read();
  }
  log(`Macro executed: ${name}`);
}

/* LOG EXPORT */
if (exportTxt) exportTxt.onclick = () => exportLogs("txt");
if (exportJson) exportJson.onclick = () => exportLogs("json");

/* SCAN DEVICES */
scanBtn.onclick = async () => {
  deviceSelect.innerHTML = '<option disabled selected>Select a device</option>';
  const devices = await BLE.scanDevices();
  devices.forEach(device => {
    const opt = document.createElement("option");
    opt.value = device.id;
    opt.text = device.name || "Unnamed";
    deviceSelect.appendChild(opt);
  });
};

/* SELECT DEVICE */
deviceSelect.onchange = () => {
  const selectedId = deviceSelect.value;
  if (state.device && state.device.id === selectedId) {
    log(`Device selected from dropdown: ${state.device.name || "Unnamed"}`);
  }
};

/* INITIAL LOGS */
logFingerprint();
logMTU();
