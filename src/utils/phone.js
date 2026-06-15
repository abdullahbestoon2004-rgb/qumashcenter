export const normPhone  = p => (p || "").replace(/[\s\-]/g, "");
export const validPhone = p => /^07\d{9}$/.test(normPhone(p));
