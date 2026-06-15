import { C } from "../constants/theme";

export const todayISO      = () => new Date().toISOString().split("T")[0];
export const daysLeft      = d => !d ? null : Math.ceil((new Date(d) - new Date(todayISO())) / 86400000);
export const deadlineColor = days => days === null ? C.muted : days < 0 ? C.red : days <= 3 ? C.orange : C.green;
