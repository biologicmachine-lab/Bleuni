export function reportMTUSupport() {
  return {
    supported: false,
    reason: "Web Bluetooth API does not expose MTU negotiation"
  };
}
