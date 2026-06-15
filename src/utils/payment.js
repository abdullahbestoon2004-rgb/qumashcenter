import { C } from "../constants/theme";
import { toNum } from "./format";

export const remAmt = (t, p) => Math.max(0, toNum(t) - toNum(p));

export function payStatus(t, p) {
  const paid = toNum(p), total = toNum(t);
  if (paid <= 0)     return { label: "نەدراوە",     color: C.red,    bg: "#fff5f5" };
  if (paid >= total) return { label: "تەواو دراوە", color: C.green,  bg: "#eafaf1" };
  return                    { label: "بەشێک دراوە", color: C.orange, bg: "#fff3e0" };
}
