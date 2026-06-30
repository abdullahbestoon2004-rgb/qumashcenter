import { useMemo } from "react";
import { C } from "../../constants/theme";
import { normPhone } from "../../utils/phone";
import { fmt } from "../../utils/format";
import ordersIcon from "../../assets/images/orders.png";

export default function CustomerHistory({ phone, orders, currentId }) {
  const prev = useMemo(() =>
    orders.filter(o => normPhone(o.phone) === normPhone(phone) && o.id !== currentId),
    [phone, orders, currentId]
  );

  if (!phone || prev.length === 0) return null;

  return (
    <div style={{ background: "#f0e8d8", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: "Segoe UI,Tahoma,sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
        <img src={ordersIcon} alt="orders" style={{ width: 16, height: 16, objectFit: "contain" }} />
        <span>{prev.length} داواکاری پێشوو بۆ ئەم کڕیارە</span>
      </div>
      {prev.slice(0, 3).map(o => (
        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6a4a2a", fontFamily: "Segoe UI,Tahoma,sans-serif", padding: "4px 0" }}>
          <span>کۆد: {o.code} — {o.name}</span>
          <span>{o.deliveryDate || "—"}</span>
          <span>{fmt(o.totalPrice)} د.ع</span>
        </div>
      ))}
    </div>
  );
}
