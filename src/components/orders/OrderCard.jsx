import { C } from "../../constants/theme";
import { MEASUREMENTS } from "../../constants/measurements";
import { STATUS_MAP, STATUS } from "../../constants/status";
import { daysLeft, deadlineColor } from "../../utils/date";
import { fmt } from "../../utils/format";
import { remAmt, payStatus } from "../../utils/payment";
import { normPhone } from "../../utils/phone";
import Btn from "../ui/Btn";
import phoneIcon from "../../assets/images/phone.png";
import whatsappIcon from "../../assets/images/whatsapp.png";
import noteIcon from "../../assets/images/note.png";

export default function OrderCard({ order, onEdit, onDelete }) {
  const days = daysLeft(order.deliveryDate);
  const dc   = deadlineColor(days);
  const ps   = payStatus(order.totalPrice, order.paidAmount);
  const r    = remAmt(order.totalPrice, order.paidAmount);
  const s    = STATUS_MAP[order.status] || STATUS[0];

  return (
    <div
      style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "18px 20px 16px", direction: "rtl", boxShadow: "0 2px 8px rgba(160,120,60,.08)", transition: "box-shadow .18s" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 22px rgba(160,120,60,.18)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(160,120,60,.08)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ background: C.header, color: C.headerText, borderRadius: 8, padding: "4px 16px", fontFamily: "'Courier New',monospace", fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{order.code}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{order.name}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 14, color: C.muted, direction: "ltr" }}>{order.phone}</span>
        <a href={`tel:${order.phone}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <img src={phoneIcon} alt="phone" style={{ width: 18, height: 18, objectFit: "contain" }} />
        </a>
        <a href={`https://wa.me/${normPhone(order.phone)}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <img src={whatsappIcon} alt="whatsapp" style={{ width: 18, height: 18, objectFit: "contain" }} />
        </a>
      </div>

      <div style={{ borderTop: `1px dashed ${C.border}`, margin: "6px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.muted }}>داواکاری: {order.orderDate || "—"}</div>
        <div style={{ fontSize: 13, color: C.muted }}>گەیاندن: {order.deliveryDate || "—"}</div>
        {days !== null && (
          <div style={{ fontSize: 13, fontWeight: 700, color: dc }}>
            {days < 0 ? `دواکەوتووە ${Math.abs(days)} رۆژ` : days === 0 ? "ئەمڕۆ!" : `${days} رۆژ ماوە`}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {[["شێواز", order.style], ["قوماش", order.fabric]].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{v || "—"}</div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 12, color: C.muted }}>گشتی</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.accent }}>{fmt(order.totalPrice)} <span style={{ fontSize: 12 }}>د.ع</span></div>
        </div>
      </div>

      <div style={{ background: ps.bg, borderRadius: 8, padding: "7px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>دراوە: <strong style={{ color: C.green }}>{fmt(order.paidAmount)}</strong></span>
          <span style={{ fontSize: 13, color: C.muted }}>ماوەکە: <strong style={{ color: r > 0 ? C.red : C.green }}>{fmt(r)}</strong></span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: ps.color }}>{ps.label}</span>
      </div>

      <div style={{ background: C.strip, borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {MEASUREMENTS.map(({ key, label }) => (
          <div key={key} style={{ textAlign: "center", minWidth: 36 }}>
            <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{order.measurements[key] || "—"}</div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div style={{ fontSize: 13, color: "#6a4a2a", background: "#fdf3e3", borderRadius: 8, padding: "6px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <img src={noteIcon} alt="notes" style={{ width: 14, height: 14, objectFit: "contain" }} />
          <span>{order.notes}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn onClick={() => onEdit(order)} color={C.header} small>دەستکاری</Btn>
          <Btn onClick={() => onDelete(order.id)} color={C.red} small>سڕینەوە</Btn>
        </div>
        <div style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, borderRadius: 20, padding: "5px 16px", fontSize: 13, fontWeight: 700, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
          {s.label}
        </div>
      </div>
    </div>
  );
}
