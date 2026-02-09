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
  try {
    state.services = await state.server.getPrimaryServices();
    return state.services.filter(s => !filter || s.uuid.includes(filter));
  } catch (err) {
    log(`Get services error: ${err.message}`);
    return [];
  }
}

export async function getCharacteristics(filter) {
  if (!state.service) {
    log("No service selected");
    return [];
  }
  try {
    state.characteristics = await state.service.getCharacteristics();
    return state.characteristics.filter(c => !filter || c.uuid.includes(filter));
  } catch (err) {
    log(`Get characteristics error: ${err.message}`);
    return [];
  }
}

export async function read() {
  if (!state.characteristic) return log("No characteristic selected");
  try {
    const val = await state.characteristic.readValue();
    log(`Read: ${new TextDecoder().decode(val)}`);
  } catch (err) {
    log(`Read error: ${err.message}`);
  }
}

export async function write(data) {
  if (!state.characteristic) return log("No characteristic selected");
  try {
    await state.characteristic.writeValue(new TextEncoder().encode(data));
    log(`Written: ${data}`);
  } catch (err) {
    log(`Write error: ${err.message}`);
  }
}

export async function notify() {
  if (!state.characteristic) return log("No characteristic selected");
  try {
    await state.characteristic.startNotifications();
    state.characteristic.addEventListener("characteristicvaluechanged", e => {
      log(`Notify: ${new TextDecoder().decode(e.target.value)}`);
    });
    log("Notifications started");
  } catch (err) {
    log(`Notify error: ${err.message}`);
  }
}

/* =========================
   DEVICE SCANNING
========================= */
export async function scanDevices({ nameFilter = "", serviceUUIDs = [] } = {}) {
  log("Scanning for BLE devices...");
  try {
    const options = {
      optionalServices: serviceUUIDs
    };

    // acceptAllDevices and filters are mutually exclusive
    if (nameFilter || serviceUUIDs.length > 0) {
      options.filters = [];
      if (nameFilter) options.filters.push({ namePrefix: nameFilter });
      if (serviceUUIDs.length > 0) {
        serviceUUIDs.forEach(uuid => options.filters.push({ services: [uuid] }));
      }
    } else {
      options.acceptAllDevices = true;
    }

    const device = await navigator.bluetooth.requestDevice(options);

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
  log("Device disconnected, attempting to reconnect...");
  try {
    state.server = await state.device.gatt.connect();
    log("Reconnected automatically");
  } catch (err) {
    log(`Reconnect failed: ${err.message}`);
  }
}
