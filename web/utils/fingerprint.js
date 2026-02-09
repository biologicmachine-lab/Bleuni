export function fingerprint(device, services, characteristics) {
  return {
    name: device.name || "unknown",
    id: device.id,
    serviceCount: services.length,
    characteristicCount: characteristics.length,
    serviceUUIDs: services.map(s => s.uuid)
  };
}
