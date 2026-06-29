import { EMPTY_M } from "./measurements";
import { todayISO } from "../utils/date";

export const EMPTY_FORM = {
  code:         "",
  name:         "",
  phone:        "",
  totalPrice:   "",
  paidAmount:   "0",
  currency:     "IQD",
  paymentLog:   [],
  style:        "",
  fabric:       "",
  fabricColor:  "",
  fabricPhoto:  "",
  status:       "pending",
  notes:        "",
  orderDate:    todayISO(),
  deliveryDate: "",
  measurements: { ...EMPTY_M },
};
