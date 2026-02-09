/**
 * Predefined BLE macros for common operations.
 * Each macro is an array of steps to execute sequentially.
 * 
 * Step format:
 * - { action: "read" } - Reads from the current characteristic
 * - { action: "write", value: string } - Writes string data to the current characteristic
 * 
 * Usage: Call runMacro(name) from app.js to execute a macro by name
 */
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
