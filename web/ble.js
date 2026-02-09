import { state } from "./state.js";
import { log } from "./logger.js";

/* =========================
   DISCOVER / CONNECT / SERVICES
========================= */
export async function discover() {
  try {
    state.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    });
    log(`Device selected: ${state.device.name || "Unnamed"}`);
    state.device.addEventListener("gattserverdisconnected", reconnect);
  } catch (err) {
    log(`Discover error: ${err.message}`);
  }
}

export async function connect() {
  if (!state.device) return log("No device selected");
  try {
    state.server = await state.device.gatt.connect();
    log("Connected to GATT server");
  } catch (err) {
    log(`Connect error: ${err.message}`);
  }
}

export async function getServices(filter) {
  if (!state.server) {
    log("Not connected");
    return [];
  }
  state.services = await state.server.getPrimaryServices();
  return state.services.filter(s => !filter || s.uuid.includes(filter));
}

export async function getCharacteristics(filter) {
  if (!state.service) return [];
  state.characteristics = await state.service.getCharacteristics();
  return state.characteristics.filter(c => !filter || c.uuid.includes(filter));
}

export async function read() {
  if (!state.characteristic) return log("No characteristic selected");
  const val = await state.characteristic.readValue();
  log(`Read: ${new TextDecoder().decode(val)}`);
}

export async function write(data) {
  if (!state.characteristic) return log("No characteristic selected");
  await state.characteristic.writeValue(new TextEncoder().encode(data));
  log(`Written: ${data}`);
}

export async function notify() {
  if (!state.characteristic) return log("No characteristic selected");
  await state.characteristic.startNotifications();
  state.characteristic.addEventListener("characteristicvaluechanged", e => {
    log(`Notify: ${new TextDecoder().decode(e.target.value)}`);
  });
}

/* =========================
   DEVICE SCANNING
========================= */
export async function scanDevices({ nameFilter = "", serviceUUIDs = [] } = {}) {
  log("Scanning for BLE devices...");
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: serviceUUIDs,
      filters: nameFilter ? [{ namePrefix: nameFilter }] : []
    });

    state.device = device;
    log(`Device found: ${device.name || "Unnamed"} (${device.id})`);
    device.addEventListener("gattserverdisconnected", reconnect);

    return [device];
  } catch (err) {
    log(`Scan error: ${err.message}`);
    return [];
  }
}

/* =========================
   RECONNECT
========================= */
async function reconnect() {
  try {
    state.server = await state.device.gatt.connect();
    log("Reconnected automatically");
  } catch {
    log("Reconnect failed");
  }
}
