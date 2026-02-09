export const ROLES = {
  ADMIN: {
    read: true,
    write: true,
    notify: true
  },
  OBSERVER: {
    read: true,
    write: false,
    notify: true
  },
  RESTRICTED: {
    read: true,
    write: false,
    notify: false
  }
};
