export const timeline = {
  events: [],
  record(type, buffer) {
    this.events.push({
      time: performance.now(),
      type,
      size: buffer.byteLength
    });
  },
  export() {
    return this.events;
  }
};
