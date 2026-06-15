export const AVATAR_COLORS = [
  ["#e8f4fd", "#185fa5"],
  ["#eafaf1", "#0f6e56"],
  ["#f5eefb", "#534ab7"],
  ["#fff3e0", "#854f0b"],
  ["#fdf3e3", "#8b5a2b"],
];

export const initials    = name => (name || "").trim().slice(0, 2);
export const avatarColor = name => AVATAR_COLORS[(name || "").charCodeAt(0) % AVATAR_COLORS.length];
