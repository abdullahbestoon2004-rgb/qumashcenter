import { useMemo } from "react";
import { C } from "../../constants/theme";
import { MEASUREMENTS } from "../../constants/measurements";
import { STATUS_MAP, STATUS } from "../../constants/status";
import { fmt, toNum } from "../../utils/format";
import { remAmt, payStatus } from "../../utils/payment";
import { normPhone } from "../../utils/phone";
import Avatar from "../ui/Avatar";
import Btn from "../ui/Btn";
import noteIcon from "../../assets/images/note.png";

export default function ProfileDetail({ profile, orders, onClose, onEdit, onDelete, onNewOrder }) {
  const profileOrders = useMemo(() =>
    orders
      .filter(o => normPhone(o.phone) === normPhone(profile.phone))
      .sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")),
    [orders, profile.phone]
  );
  const totalSpent = profileOrders.reduce((s, o) => s + toNum(o.totalPrice), 0);
  const totalDebt  = profileOrders.reduce((s, o) => s + remAmt(o.totalPrice, o.paidAmount), 0);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 680, border: `2px solid ${C.border}`, direction: "rtl", boxShadow: "0 16px 48px rgba(0,0,0,.22)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={profile.name} size={64} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{profile.name}</div>
                <div style={{ fontSize: 15, color: C.muted, direction: "ltr", textAlign: "right", marginTop: 4 }}>{profile.phone}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Btn onClick={() => onEdit(profile)} color={C.header} small>دەستکاری</Btn>
              <Btn onClick={() => onDelete(profile.id)} color={C.red} small>سڕینەوە</Btn>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted, marginRight: 4 }}>✕</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 18 }}>
            {[
              { label: "کۆی داواکاری",   val: profileOrders.length,       color: C.text  },
              { label: "کۆی پارە",   val: `${fmt(totalSpent)} د.ع`,   color: C.green },
              { label: "ماوەی قەرز", val: `${fmt(totalDebt)} د.ع`,    color: totalDebt > 0 ? C.red : C.green },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: C.strip, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{val}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 28px 24px" }}>

          {/* Measurements */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 10, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>📐 قەبارەکانی ئەو</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {MEASUREMENTS.map(({ key, label }) => (
                <div key={key} style={{ background: C.strip, borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: C.text, marginTop: 3, fontFamily: "'Courier New',monospace" }}>{profile.measurements[key] || "—"}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <Btn onClick={() => onNewOrder(profile)} color={C.purple} small>+ داواکاری نوێ بۆ ئەم کڕیارە</Btn>
            </div>
          </div>

          {profile.notes && (
            <div style={{ background: "#fdf3e3", border: "1px solid #e8d5b0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 15, color: "#6a4a2a", fontFamily: "Segoe UI,Tahoma,sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <img src={noteIcon} alt="notes" style={{ width: 16, height: 16, objectFit: "contain" }} />
              <span>{profile.notes}</span>
            </div>
          )}

          {/* Order history */}
          <div>
            <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 10, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>داواکارییە پێشووەکان</div>
            {profileOrders.length === 0 ? (
              <div style={{ fontSize: 15, color: C.muted, textAlign: "center", padding: "20px 0", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>هیچ داواکارییەک نییە</div>
            ) : profileOrders.map(o => {
              const ps = payStatus(o.totalPrice, o.paidAmount);
              const s  = STATUS_MAP[o.status] || STATUS[0];
              return (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ background: C.header, color: C.headerText, borderRadius: 5, padding: "3px 12px", fontFamily: "'Courier New',monospace", fontSize: 14, fontWeight: 700 }}>{o.code}</span>
                      <span style={{ fontSize: 15, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{o.fabric || o.style || "—"}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{o.orderDate} → {o.deliveryDate || "—"}</div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{fmt(o.totalPrice)} د.ع</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
                      <span style={{ background: ps.bg, color: ps.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{ps.label}</span>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
