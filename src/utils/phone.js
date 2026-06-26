export const normPhone  = p => (p || "").replace(/[\s\-]/g, "");
export const validPhone = p => /^07\d{9}$/.test(normPhone(p));

// Converts Iraqi local format (07XXXXXXXXX) → WhatsApp international (9647XXXXXXXXX)
export const toWAPhone = p => {
  const n = normPhone(p);
  if (/^07\d{9}$/.test(n)) return "964" + n.slice(1);
  return n;
};
