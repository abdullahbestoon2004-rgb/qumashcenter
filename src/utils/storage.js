export const ls = {
  load: (k, fallback) => {
    try {
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : fallback;
    } catch {
      return fallback;
    }
  },
  save: (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};
