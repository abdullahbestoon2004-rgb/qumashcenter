import { useState, useMemo } from "react";
import { C } from "../../constants/theme";
import { STATUS_MAP } from "../../constants/status";
import { fmt } from "../../utils/format";
import { remAmt } from "../../utils/payment";
import { normPhone } from "../../utils/phone";
import Avatar from "../ui/Avatar";
import Btn from "../ui/Btn";

export default function ProfilesTab({ profiles, orders, onNewProfile, onEditProfile, onDeleteProfile, onViewProfile }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    profiles.filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    ),
    [profiles, search]
  );

  return (
    <div style={{ padding: "30px 20px", maxWidth: 1600, margin: "0 auto" }}>

      {/* Search + add */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: C.muted, pointerEvents: "none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="گەڕان بەپێی ناو یان ژمارە..."
            style={{ width: "100%", padding: "12px 42px 12px 16px", fontSize: 16, border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.card, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = C.accent)}
            onBlur={e  => (e.target.style.borderColor = C.border)}
          />
        </div>
        <Btn onClick={onNewProfile} color={C.accent} solid>+ پرۆفایلی نوێ</Btn>
        <div style={{ color: C.muted, fontSize: 15, whiteSpace: "nowrap" }}>{filtered.length} کڕیار</div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.muted }}>
          <div style={{ fontSize: 46, marginBottom: 10 }}>👤</div>
          <div style={{ fontSize: 17, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>هیچ پرۆفایلێک نەدۆزرایەوە</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 20 }}>
          {filtered.map(p => {
            const pOrders      = orders.filter(o => normPhone(o.phone) === normPhone(p.phone));
            const latestOrder  = pOrders.sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""))[0];
            const latestStatus = latestOrder ? STATUS_MAP[latestOrder.status] : null;
            const debt         = pOrders.reduce((s, o) => s + remAmt(o.totalPrice, o.paidAmount), 0);

            return (
              <div key={p.id} onClick={() => onViewProfile(p)}
                style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "box-shadow .18s", boxShadow: "0 2px 8px rgba(160,120,60,.08)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 22px rgba(160,120,60,.18)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(160,120,60,.08)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <Avatar name={p.name} size={54} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: C.muted, direction: "ltr", textAlign: "right", marginTop: 3 }}>{p.phone}</div>
                  </div>
                  {latestStatus && (
                    <span style={{ background: latestStatus.bg, color: latestStatus.color, border: `1px solid ${latestStatus.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {latestStatus.label}
                    </span>
                  )}
                </div>

                <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                    <span style={{ fontWeight: 700, color: C.text }}>{pOrders.length}</span> داواکاری
                  </div>
                  {debt > 0 && (
                    <div style={{ fontSize: 14, color: C.red, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                      قەرز: <span style={{ fontWeight: 700 }}>{fmt(debt)}</span> د.ع
                    </div>
                  )}
                  {latestOrder && (
                    <div style={{ fontSize: 14, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                      گەیاندن: {latestOrder.deliveryDate || "—"}
                    </div>
                  )}
                </div>

                {p.notes && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#8a6a4a", fontStyle: "italic", fontFamily: "Segoe UI,Tahoma,sans-serif", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                    📝 {p.notes.slice(0, 60)}{p.notes.length > 60 ? "..." : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
