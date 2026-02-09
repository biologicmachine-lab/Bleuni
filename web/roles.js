export const ROLES = {
  ADMIN: {
    write: true,
    notify: true
  },
  OBSERVER: {
    write: false,
    notify: true
  },
  RESTRICTED: {
    write: false,
    notify: false
  }
};
