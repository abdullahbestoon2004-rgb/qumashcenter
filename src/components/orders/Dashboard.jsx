import { useMemo } from "react";
import { C } from "../../constants/theme";
import { STATUS } from "../../constants/status";

export default function Dashboard({ orders, activeFilter, onFilter }) {
  const counts = useMemo(() => {
    const c = { all: orders.length };
    STATUS.forEach(s => { c[s.key] = orders.filter(o => o.status === s.key).length; });
    return c;
  }, [orders]);

  const tabs = [{ key: "all", label: "گشتی", color: C.muted }, ...STATUS.map(s => ({ key: s.key, label: s.label, color: s.color }))];

  return (
    <div style={{ background: "#ede3cf", borderBottom: `1.5px solid ${C.border}`, padding: "12px 12px", direction: "rtl" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {tabs.map(t => {
          const active = activeFilter === t.key;
          return (
            <button key={t.key} onClick={() => onFilter(t.key)} style={{
              flex: "0 0 auto", background: active ? t.color : C.card, color: active ? "#fff" : t.color,
              border: `1.5px solid ${active ? t.color : C.border}`, borderRadius: 12,
              padding: "8px 16px", cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif", transition: "all .15s",
              minWidth: 68,
            }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{counts[t.key] ?? 0}</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{t.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
