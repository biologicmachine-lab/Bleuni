export const MACROS = {
  READ_BATTERY: [
    { action: "read" }
  ],
  WRITE_HELLO: [
    { action: "write", value: "Hello" }
  ],
  HEARTBEAT: [
    { action: "write", value: "PING" },
    { action: "read" }
  ]
};
