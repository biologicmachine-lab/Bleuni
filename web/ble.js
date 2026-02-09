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
  if (!state.service) return [];
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

function selectCharacteristicFromUI() {
  const charSel = document.getElementById("charSelect");
  if (charSel && charSel.value) {
    state.characteristic = state.characteristics.find(c => c.uuid === charSel.value);
  }
}

export async function write(data) {
  // Select the characteristic from charSel before writing
  selectCharacteristicFromUI();
  
  if (!state.characteristic) return log("No characteristic selected");
  try {
    await state.characteristic.writeValue(new TextEncoder().encode(data));
    log(`Written: ${data}`);
  } catch (err) {
    log(`Write error: ${err.message}`);
  }
}

export async function notify() {
  // Select the characteristic from charSel before starting notifications
  selectCharacteristicFromUI();
  
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
    const options = {};
    
    if (nameFilter || serviceUUIDs.length > 0) {
      // Use filters when we have specific criteria
      options.filters = [];
      if (nameFilter) {
        options.filters.push({ namePrefix: nameFilter });
      }
      if (serviceUUIDs.length > 0) {
        options.optionalServices = serviceUUIDs;
      }
    } else {
      // Use acceptAllDevices only when no filters are specified
      options.acceptAllDevices = true;
      options.optionalServices = serviceUUIDs;
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
  try {
    state.server = await state.device.gatt.connect();
    log("Reconnected automatically");
  } catch {
    log("Reconnect failed");
  }
}
