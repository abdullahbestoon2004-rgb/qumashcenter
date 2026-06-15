export const toNum = s => parseFloat((s || "0").toString().replace(/,/g, "")) || 0;
export const fmt   = n => Number(n).toLocaleString();
