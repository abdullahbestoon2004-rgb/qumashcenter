export const STATUS = [
  { key: "pending",   label: "چاوەڕوانکراو", color: "#e67e22", bg: "#fff3e0", border: "#f0a050" },
  { key: "cutting",   label: "بڕین",          color: "#2980b9", bg: "#e8f4fd", border: "#7ab8e8" },
  { key: "sewing",    label: "دوورین",         color: "#8e44ad", bg: "#f5eefb", border: "#c39bd3" },
  { key: "ready",     label: "ئامادەیە",       color: "#27ae60", bg: "#eafaf1", border: "#82e0aa" },
  { key: "delivered", label: "بردراوەتەوە",    color: "#7f8c8d", bg: "#f2f3f4", border: "#bdc3c7" },
];

export const STATUS_MAP = Object.fromEntries(STATUS.map(s => [s.key, s]));
