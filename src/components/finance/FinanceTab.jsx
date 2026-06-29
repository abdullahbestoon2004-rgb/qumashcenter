import { useState, useMemo } from "react";
import { C } from "../../constants/theme";
import { STATUS_MAP } from "../../constants/status";
import { toNum, fmt } from "../../utils/format";
import { remAmt } from "../../utils/payment";
import { useIsMobile } from "../../utils/responsive";
import { todayISO } from "../../utils/date";

// ── date helpers ──────────────────────────────────────────────────────
const iso = d => d.toISOString().split("T")[0];
const startOfWeek  = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return iso(d); };
const startOfMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; };
const startOfYear  = () => `${new Date().getFullYear()}-01-01`;

const QUICK = [
  { key: "today", label: "ئەمڕۆ",      from: todayISO,    to: todayISO   },
  { key: "week",  label: "ئەم هەفتەیە", from: startOfWeek, to: todayISO   },
  { key: "month", label: "ئەم مانگە",   from: startOfMonth, to: todayISO  },
  { key: "year",  label: "ئەم ساڵە",    from: startOfYear,  to: todayISO  },
  { key: "all",   label: "هەموو",       from: () => "",    to: () => ""   },
];

// ── stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color, icon, sub, isMobile }) {
  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: isMobile ? "14px 12px" : "18px 20px", textAlign: "right" }}>
      <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: isMobile ? 11 : 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color, fontFamily: "'Courier New',monospace", lineHeight: 1.2 }}>
        {value}{unit ? <span style={{ fontSize: 12, fontWeight: 400 }}> {unit}</span> : null}
      </div>
      {!isMobile && <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{sub}</div>}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────
export default function FinanceTab({ orders }) {
  const isMobile = useIsMobile();

  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [quick,    setQuick]    = useState("all");

  function applyQuick(q) {
    setQuick(q.key);
    setFromDate(q.from());
    setToDate(q.to());
  }

  const inRange = useMemo(() =>
    orders.filter(o => {
      const d = o.orderDate || "";
      if (fromDate && d < fromDate) return false;
      if (toDate   && d > toDate)   return false;
      return true;
    }),
    [orders, fromDate, toDate]
  );

  const grossRevenue = useMemo(() => inRange.reduce((s, o) => s + toNum(o.paidAmount),  0), [inRange]);
  const outstanding  = useMemo(() => inRange.reduce((s, o) => s + remAmt(o.totalPrice, o.paidAmount), 0), [inRange]);
  const totalValue   = useMemo(() => inRange.reduce((s, o) => s + toNum(o.totalPrice),  0), [inRange]);
  const collectRate  = totalValue > 0 ? Math.round((grossRevenue / totalValue) * 100) : 0;

  const sorted = useMemo(() =>
    [...inRange].sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")),
    [inRange]
  );

  const rateColor = collectRate >= 80 ? C.green : collectRate >= 50 ? C.orange : C.red;

  return (
    <div style={{ padding: isMobile ? "14px 10px" : "24px 20px", maxWidth: 1200, margin: "0 auto", direction: "rtl" }}>

      {/* ── Date filter ── */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
        {/* Quick chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {QUICK.map(q => (
            <button key={q.key} onClick={() => applyQuick(q)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
              border: `1.5px solid ${quick === q.key ? C.accent : C.border}`,
              background: quick === q.key ? C.accent : "transparent",
              color: quick === q.key ? "#fff" : C.muted,
              fontFamily: "Segoe UI,Tahoma,sans-serif", fontWeight: quick === q.key ? 700 : 400,
              transition: "all .15s",
            }}>
              {q.label}
            </button>
          ))}
        </div>

        {/* From / To pickers */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", whiteSpace: "nowrap" }}>لە:</label>
            <input type="date" value={fromDate}
              onChange={e => { setFromDate(e.target.value); setQuick(""); }}
              style={{ padding: "8px 10px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", whiteSpace: "nowrap" }}>بۆ:</label>
            <input type="date" value={toDate}
              onChange={e => { setToDate(e.target.value); setQuick(""); }}
              style={{ padding: "8px 10px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: "none" }}
            />
          </div>
          {(fromDate || toDate) && (
            <button onClick={() => { setFromDate(""); setToDate(""); setQuick("all"); }}
              style={{ padding: "7px 14px", fontSize: 13, border: `1.5px solid ${C.red}`, borderRadius: 8, background: "transparent", color: C.red, cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
              ✕ پاکردنەوە
            </button>
          )}
          <span style={{ marginRight: "auto", fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            {inRange.length} داواکاری
          </span>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 16, marginBottom: 18 }}>
        <StatCard isMobile={isMobile} icon="💰" label="کۆی پارەی وەرگیراو"     value={fmt(grossRevenue)} unit="د.ع" color={C.green}  sub="Gross Revenue"      />
        <StatCard isMobile={isMobile} icon="⏳" label="پارەی ماوە"              value={fmt(outstanding)}  unit="د.ع" color={C.red}    sub="Outstanding"        />
        <StatCard isMobile={isMobile} icon="📋" label="کۆی نرخی داواکارییەکان" value={fmt(totalValue)}   unit="د.ع" color={C.blue}   sub="Total Order Value"  />
        <StatCard isMobile={isMobile} icon="📦" label="ژمارەی داواکاری"         value={inRange.length}    unit=""    color={C.accent} sub="Order Count"        />
      </div>

      {/* ── Collection rate bar ── */}
      {totalValue > 0 && (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>ڕێژەی کۆکردنەوە</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: rateColor }}>{collectRate}%</span>
          </div>
          <div style={{ height: 12, background: C.strip, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${collectRate}%`, background: rateColor, borderRadius: 99, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            <span style={{ color: C.green, fontWeight: 600 }}>وەرگیراو: {fmt(grossRevenue)} د.ع</span>
            <span style={{ color: outstanding > 0 ? C.red : C.green, fontWeight: 600 }}>ماوە: {fmt(outstanding)} د.ع</span>
          </div>
        </div>
      )}

      {/* ── Orders table ── */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>هیچ داواکارییەک نەدۆزرایەوە</div>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 13 : 14, fontFamily: "Segoe UI,Tahoma,sans-serif", direction: "rtl" }}>
              <thead>
                <tr style={{ background: C.header }}>
                  {["کۆد", "ناو", "نرخی گشتی", "دراوە", "ماوەکە", "حاڵەت", "بەروار"].map(h => (
                    <th key={h} style={{ padding: isMobile ? "10px 10px" : "12px 16px", color: C.headerText, fontWeight: 700, textAlign: "right", whiteSpace: "nowrap", fontSize: isMobile ? 12 : 14 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((o, i) => {
                  const r   = remAmt(o.totalPrice, o.paidAmount);
                  const s   = STATUS_MAP[o.status];
                  const cur = o.currency === "USD" ? "$" : "د.ع";
                  return (
                    <tr key={o.id} style={{ background: i % 2 === 0 ? C.card : C.strip, borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 10px" }}>
                        <span style={{ background: C.header, color: C.headerText, borderRadius: 6, padding: "2px 10px", fontFamily: "'Courier New',monospace", fontSize: 13, fontWeight: 700 }}>{o.code}</span>
                      </td>
                      <td style={{ padding: "10px 10px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{o.name}</td>
                      <td style={{ padding: "10px 10px", color: C.text, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(o.totalPrice)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 10px", color: C.green, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(o.paidAmount)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 10px", color: r > 0 ? C.red : C.green, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(r)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 10px" }}>
                        {s && <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>}
                      </td>
                      <td style={{ padding: "10px 10px", color: C.muted, whiteSpace: "nowrap", fontSize: 13 }}>{o.orderDate || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.strip, borderTop: `2.5px solid ${C.border}` }}>
                  <td colSpan={2} style={{ padding: "12px 10px", fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>کۆی گشتی</td>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: C.blue, fontFamily: "'Courier New',monospace" }}>{fmt(totalValue)} د.ع</td>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: C.green, fontFamily: "'Courier New',monospace" }}>{fmt(grossRevenue)} د.ع</td>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: outstanding > 0 ? C.red : C.green, fontFamily: "'Courier New',monospace" }}>{fmt(outstanding)} د.ع</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
