import { EMPTY_M } from "./measurements";
import { todayISO } from "../utils/date";

export const EMPTY_FORM = {
  code:         "",
  name:         "",
  phone:        "",
  totalPrice:   "",
  paidAmount:   "0",
  style:        "",
  fabric:       "",
  status:       "pending",
  notes:        "",
  orderDate:    todayISO(),
  deliveryDate: "",
  measurements: { ...EMPTY_M },
};
