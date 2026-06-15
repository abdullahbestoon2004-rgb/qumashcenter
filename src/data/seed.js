import { uuid } from "../utils/uuid";

export const SEED_ORDERS = [
  {
    id: uuid(), code: "144", name: "ئارام کریم", phone: "07501234567",
    totalPrice: "35000", paidAmount: "35000", style: "کلاسیک", fabric: "وول ئیتالی",
    status: "ready", notes: "", orderDate: "2026-06-01", deliveryDate: "2026-06-15",
    measurements: { sharwal: "98", nawqad: "82", sang: "104", shan: "46", qol: "62", machak: "28", damaqach: "20" },
  },
  {
    id: uuid(), code: "145", name: "سەردار عومەر", phone: "07709876543",
    totalPrice: "42000", paidAmount: "20000", style: "سلیم فیت", fabric: "کاشمیر",
    status: "sewing", notes: "یاخەی تایبەت", orderDate: "2026-06-05", deliveryDate: "2026-06-20",
    measurements: { sharwal: "100", nawqad: "86", sang: "108", shan: "48", qol: "64", machak: "30", damaqach: "22" },
  },
  {
    id: uuid(), code: "146", name: "ئارام کریم", phone: "07501234567",
    totalPrice: "28000", paidAmount: "0", style: "کلاسیک", fabric: "لینەن",
    status: "pending", notes: "زوو پێویستە", orderDate: "2026-06-10", deliveryDate: "2026-06-12",
    measurements: { sharwal: "98", nawqad: "82", sang: "104", shan: "46", qol: "62", machak: "28", damaqach: "20" },
  },
];

export const SEED_PROFILES = [
  {
    id: uuid(), name: "ئارام کریم", phone: "07501234567",
    measurements: { sharwal: "98", nawqad: "82", sang: "104", shan: "46", qol: "62", machak: "28", damaqach: "20" },
    notes: "کڕیاری هەمیشەیی. جلی کلاسیک حەزی لێیە.", createdAt: "2026-06-01",
  },
  {
    id: uuid(), name: "سەردار عومەر", phone: "07709876543",
    measurements: { sharwal: "100", nawqad: "86", sang: "108", shan: "48", qol: "64", machak: "30", damaqach: "22" },
    notes: "", createdAt: "2026-06-05",
  },
];
