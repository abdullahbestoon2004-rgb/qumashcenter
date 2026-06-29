import { C } from "../../constants/theme";
import { MEASUREMENTS } from "../../constants/measurements";
import { STATUS_MAP, STATUS } from "../../constants/status";
import { daysLeft, deadlineColor } from "../../utils/date";
import { fmt } from "../../utils/format";
import { remAmt, payStatus } from "../../utils/payment";
import { normPhone, toWAPhone } from "../../utils/phone";
import Btn from "../ui/Btn";
import phoneIcon from "../../assets/images/phone.png";
import whatsappIcon from "../../assets/images/whatsapp.png";
import noteIcon from "../../assets/images/note.png";

function buildNotifyUrl(order) {
  const cur = order.currency === "USD" ? "$" : "د.ع";
  const r   = remAmt(order.totalPrice, order.paidAmount);
  const lines = [
    `سڵاو ${order.name}، `,
    `داواکارییەکەت ئامادەیە!`,
    ` کۆد: ${order.code}`,
    ` نرخی گشتی: ${fmt(order.totalPrice)} ${cur}`,
    ` پارەی دراو : ${fmt(order.paidAmount)} ${cur}`,
    r > 0 ? ` ماوە: ${fmt(r)} ${cur}` : ``,
    ``,
  ].filter(l => l !== undefined);
  return `https://wa.me/${toWAPhone(order.phone)}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function OrderCard({ order, onEdit, onDelete, onAddPayment }) {
  const days = daysLeft(order.deliveryDate);
  const dc   = deadlineColor(days);
  const ps   = payStatus(order.totalPrice, order.paidAmount);
  const r    = remAmt(order.totalPrice, order.paidAmount);
  const s    = STATUS_MAP[order.status] || STATUS[0];
  const cur  = order.currency === "USD" ? "$" : "د.ع";

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
        <a href={`https://wa.me/${toWAPhone(order.phone)}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
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

      {order.status === "ready" && order.phone && (
        <a href={buildNotifyUrl(order)} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#e8f8ef", border: "1.5px solid #82e0aa", borderRadius: 9, padding: "8px 14px", marginBottom: 10, textDecoration: "none", cursor: "pointer" }}>
          <img src={whatsappIcon} alt="whatsapp" style={{ width: 18, height: 18, objectFit: "contain" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a7a40", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>ئاگادارکردنەوەی کڕیار</span>
          <span style={{ fontSize: 12, color: "#27ae60", marginRight: "auto" }}>واتساپ →</span>
        </a>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted }}>شێواز</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{order.style || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted }}>قوماش</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            {order.fabricColor && (
              <span title={order.fabricColor} style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: /^#[0-9A-Fa-f]{6}$/.test(order.fabricColor) ? order.fabricColor : C.border, border: `1.5px solid ${C.border}`, flexShrink: 0 }} />
            )}
            {order.fabric || "—"}
            {order.fabricColor && <span style={{ fontSize: 11, color: C.muted }}>{order.fabricColor}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted }}>گشتی</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.accent }}>{fmt(order.totalPrice)} <span style={{ fontSize: 12 }}>{cur}</span></div>
        </div>
      </div>

      {order.fabricPhoto && (
        <div style={{ marginBottom: 10 }}>
          <img
            src={order.fabricPhoto}
            alt="fabric"
            style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: `1.5px solid ${C.border}`, cursor: "pointer" }}
            onClick={() => window.open(order.fabricPhoto, "_blank")}
          />
        </div>
      )}

      <div style={{ background: ps.bg, borderRadius: 8, padding: "7px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>دراوە: <strong style={{ color: C.green }}>{fmt(order.paidAmount)} {cur}</strong></span>
          <span style={{ fontSize: 13, color: C.muted }}>ماوەکە: <strong style={{ color: r > 0 ? C.red : C.green }}>{fmt(r)} {cur}</strong></span>
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
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Btn onClick={() => onEdit(order)} color={C.header} small>دەستکاری</Btn>
          {r > 0 && <Btn onClick={() => onAddPayment(order)} color={C.green} small>+ پارەدان</Btn>}
          <Btn onClick={() => onDelete(order.id)} color={C.red} small>سڕینەوە</Btn>
        </div>
        <div style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, borderRadius: 20, padding: "5px 16px", fontSize: 13, fontWeight: 700, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
          {s.label}
        </div>
      </div>
    </div>
  );
}
