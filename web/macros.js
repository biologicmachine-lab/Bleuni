export const MACROS = {
  INIT_UART: [
    { action: "discover" },
    { action: "connect" },
    { action: "services", filter: "6e400001" },
    { action: "characteristics", filter: "6e400003" }
  ],
  HEART_RATE_MONITOR: [
    { action: "discover" },
    { action: "connect" },
    { action: "services", filter: "180d" },
    { action: "characteristics", filter: "2a37" },
    { action: "notify" }
  ],
  BATTERY_CHECK: [
    { action: "discover" },
    { action: "connect" },
    { action: "services", filter: "180f" },
    { action: "characteristics", filter: "2a19" },
    { action: "read" }
  ]
};
