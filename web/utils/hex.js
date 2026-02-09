export function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return [...bytes]
    .map(b => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function toAscii(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : ".")
    .join("");
}
