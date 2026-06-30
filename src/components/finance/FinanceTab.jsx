import { useState, useMemo } from "react";
import { C } from "../../constants/theme";
import { STATUS_MAP } from "../../constants/status";
import { toNum, fmt } from "../../utils/format";
import { remAmt } from "../../utils/payment";
import { normPhone, toWAPhone } from "../../utils/phone";
import { useIsMobile } from "../../utils/responsive";
import { todayISO } from "../../utils/date";
import { uuid } from "../../utils/uuid";
import whatsappIcon from "../../assets/images/whatsapp.png";

// ── helpers ───────────────────────────────────────────────────────────
const iso = d => d.toISOString().split("T")[0];
const startOfWeek  = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return iso(d); };
const startOfMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; };
const startOfYear  = () => `${new Date().getFullYear()}-01-01`;

const QUICK = [
  { key: "today", label: "ئەمڕۆ",       from: todayISO,     to: todayISO  },
  { key: "week",  label: "ئەم هەفتەیە",  from: startOfWeek,  to: todayISO  },
  { key: "month", label: "ئەم مانگە",    from: startOfMonth, to: todayISO  },
  { key: "year",  label: "ئەم ساڵە",     from: startOfYear,  to: todayISO  },
  { key: "all",   label: "هەموو",        from: () => "",     to: () => ""  },
];

const CATEGORIES = ["کرێی دووکان", "مووچە", "موادی خامی", "خزمەتگوزاری", "ناردن", "تر"];
const EMPTY_EXPENSE = { description: "", amount: "", currency: "IQD", category: "تر", date: todayISO() };

function buildDebtWAUrl(client) {
  const lines = client.orders
    .map(o => `  • کۆد ${o.code}: ${fmt(remAmt(o.totalPrice, o.paidAmount))} د.ع`)
    .join("\n");
  const text = `سڵاو ${client.name}،\nتکایە پارەی ماوەکەت تەواو بکە:\n${lines}\nکۆ: ${fmt(client.total)} د.ع`;
  return `https://wa.me/${toWAPhone(client.phone)}?text=${encodeURIComponent(text)}`;
}

// ── stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color, sub, isMobile }) {
  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: isMobile ? "12px 10px" : "18px 20px", textAlign: "right" }}>
      <div style={{ fontSize: isMobile ? 11 : 12, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color, fontFamily: "'Courier New',monospace", lineHeight: 1.2 }}>
        {value}{unit ? <span style={{ fontSize: 11, fontWeight: 400 }}> {unit}</span> : null}
      </div>
      {!isMobile && <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{sub}</div>}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────
export default function FinanceTab({ orders, expenses, onSaveExpense, onDeleteExpense }) {
  const isMobile = useIsMobile();

  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [quick,       setQuick]       = useState("all");
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm,     setExpForm]     = useState(EMPTY_EXPENSE);
  const [expErr,      setExpErr]      = useState("");

  function applyQuick(q) {
    setQuick(q.key);
    setFromDate(q.from());
    setToDate(q.to());
  }

  function inDateRange(d) {
    if (!d) return true;
    if (fromDate && d < fromDate) return false;
    if (toDate   && d > toDate)   return false;
    return true;
  }

  const inRange    = useMemo(() => orders.filter(o => inDateRange(o.orderDate || "")),  [orders, fromDate, toDate]);
  const expInRange = useMemo(() => expenses.filter(e => inDateRange(e.date || "")),     [expenses, fromDate, toDate]);

  const grossRevenue  = useMemo(() => inRange.reduce((s, o) => s + toNum(o.paidAmount), 0), [inRange]);
  const outstanding   = useMemo(() => inRange.reduce((s, o) => s + remAmt(o.totalPrice, o.paidAmount), 0), [inRange]);
  const totalValue    = useMemo(() => inRange.reduce((s, o) => s + toNum(o.totalPrice), 0),  [inRange]);
  const totalExpenses = useMemo(() => expInRange.reduce((s, e) => s + toNum(e.amount), 0),   [expInRange]);
  const netProfit     = grossRevenue - totalExpenses;
  const collectRate   = totalValue > 0 ? Math.round((grossRevenue / totalValue) * 100) : 0;
  const rateColor     = collectRate >= 80 ? C.green : collectRate >= 50 ? C.orange : C.red;

  // Group unpaid orders by client
  const debtors = useMemo(() => {
    const map = new Map();
    inRange
      .filter(o => remAmt(o.totalPrice, o.paidAmount) > 0)
      .forEach(o => {
        const key = normPhone(o.phone) || o.name;
        if (!map.has(key)) map.set(key, { name: o.name, phone: o.phone, orders: [], total: 0 });
        const c = map.get(key);
        c.orders.push(o);
        c.total += remAmt(o.totalPrice, o.paidAmount);
      });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [inRange]);

  const sortedOrders = useMemo(() =>
    [...inRange].sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")),
    [inRange]
  );
  const sortedExp = useMemo(() =>
    [...expInRange].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [expInRange]
  );

  function handleSaveExpense() {
    if (!expForm.description.trim())              { setExpErr("وەسف داواکراوە"); return; }
    if (!expForm.amount || toNum(expForm.amount) <= 0) { setExpErr("بڕی پارە داواکراوە"); return; }
    if (!expForm.date)                            { setExpErr("بەروار داواکراوە"); return; }
    onSaveExpense({ ...expForm, id: uuid() });
    setExpForm(EMPTY_EXPENSE);
    setShowExpForm(false);
    setExpErr("");
  }

  const inp = (k, v) => setExpForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: isMobile ? "14px 10px" : "24px 20px", maxWidth: 1200, margin: "0 auto", direction: "rtl" }}>

      {/* ── Date filter ── */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {QUICK.map(q => (
            <button key={q.key} onClick={() => applyQuick(q)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
              border: `1.5px solid ${quick === q.key ? C.accent : C.border}`,
              background: quick === q.key ? C.accent : "transparent",
              color: quick === q.key ? "#fff" : C.muted,
              fontFamily: "Segoe UI,Tahoma,sans-serif", fontWeight: quick === q.key ? 700 : 400,
              transition: "all .15s",
            }}>{q.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", whiteSpace: "nowrap" }}>لە:</label>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setQuick(""); }}
              style={{ padding: "8px 10px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif", whiteSpace: "nowrap" }}>بۆ:</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setQuick(""); }}
              style={{ padding: "8px 10px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: "none" }} />
          </div>
          {(fromDate || toDate) && (
            <button onClick={() => { setFromDate(""); setToDate(""); setQuick("all"); }}
              style={{ padding: "7px 14px", fontSize: 13, border: `1.5px solid ${C.red}`, borderRadius: 8, background: "transparent", color: C.red, cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
              ✕ پاکردنەوە
            </button>
          )}
          <span style={{ marginRight: "auto", fontSize: 13, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{inRange.length} داواکاری</span>
        </div>
      </div>

      {/* ── Summary cards row 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 10 : 14 }}>
        <StatCard isMobile={isMobile} label="کۆی پارەی وەرگیراو" value={fmt(grossRevenue)}        unit="د.ع" color={C.green}                       sub="Gross Revenue"    />
        <StatCard isMobile={isMobile} label="کۆی خەرجییەکان"     value={fmt(totalExpenses)}       unit="د.ع" color={C.red}                         sub="Total Expenses"   />
        <StatCard isMobile={isMobile} label="قازانجی ڕوون"        value={fmt(Math.abs(netProfit))} unit="د.ع" color={netProfit >= 0 ? C.green : C.red} sub={netProfit >= 0 ? "Net Profit" : "Net Loss"} />
      </div>

      {/* ── Summary cards row 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 16, marginBottom: 18 }}>
        <StatCard isMobile={isMobile} label="پارەی ماوە"                value={fmt(outstanding)} unit="د.ع" color={C.orange}  sub="Outstanding"      />
        <StatCard isMobile={isMobile} label="کۆی نرخی داواکارییەکان"   value={fmt(totalValue)}  unit="د.ع" color={C.blue}    sub="Total Order Value" />
        <StatCard isMobile={isMobile} label="ژمارەی داواکاری"            value={inRange.length}   unit=""    color={C.accent}  sub="Order Count"      />
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
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            <span style={{ color: C.green,  fontWeight: 600 }}>وەرگیراو: {fmt(grossRevenue)} د.ع</span>
            <span style={{ color: outstanding > 0 ? C.red : C.green, fontWeight: 600 }}>ماوە: {fmt(outstanding)} د.ع</span>
          </div>
        </div>
      )}

      {/* ── Unpaid clients ── */}
      <div style={{ background: C.card, border: `2px solid ${C.red}22`, borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff8f8" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.red, fontFamily: "Segoe UI,Tahoma,sans-serif" }}> قەرزەکان</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
              {debtors.length > 0
                ? `${debtors.length} کڕیار — کۆی قەرز: ${fmt(outstanding)} د.ع`
                : "هیچ قەرزێک نییە لەم ماوەیەدا"}
            </div>
          </div>
          {debtors.length > 0 && (
            <div style={{ background: C.red, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 14, fontWeight: 700, fontFamily: "'Courier New',monospace" }}>
              {debtors.length}
            </div>
          )}
        </div>

        {debtors.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 15, color: C.green, fontWeight: 600, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>هەموو پارەکان وەرگیراوە</div>
          </div>
        ) : (
          <div>
            {debtors.map((client, ci) => (
              <div key={client.phone || client.name} style={{ borderBottom: ci < debtors.length - 1 ? `1px solid ${C.border}` : "none" }}>
                {/* Client header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: ci % 2 === 0 ? C.card : C.strip }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {/* Red debt indicator */}
                    <div style={{ width: 4, height: 40, background: C.red, borderRadius: 4, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{client.name}</div>
                      <div style={{ fontSize: 13, color: C.muted, direction: "ltr", marginTop: 2 }}>{client.phone || "—"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: C.red, fontFamily: "'Courier New',monospace" }}>{fmt(client.total)} <span style={{ fontSize: 11 }}>د.ع</span></div>
                      <div style={{ fontSize: 12, color: C.muted, textAlign: "right", marginTop: 2 }}>{client.orders.length} داواکاری</div>
                    </div>
                    {client.phone && (
                      <a href={buildDebtWAUrl(client)} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#e8f8ef", border: "1.5px solid #82e0aa", textDecoration: "none", flexShrink: 0 }}
                        title="ئاگادارکردنەوە بە واتساپ">
                        <img src={whatsappIcon} alt="whatsapp" style={{ width: 18, height: 18, objectFit: "contain" }} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Individual orders for this client */}
                {client.orders.map(o => {
                  const r = remAmt(o.totalPrice, o.paidAmount);
                  const s = STATUS_MAP[o.status];
                  return (
                    <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px 8px 32px", background: "#fff8f8", borderTop: `1px dashed ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: C.header, color: C.headerText, borderRadius: 5, padding: "2px 10px", fontFamily: "'Courier New',monospace", fontSize: 12, fontWeight: 700 }}>{o.code}</span>
                        <span style={{ fontSize: 13, color: C.muted }}>{o.orderDate || "—"}</span>
                        {s && <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: C.muted }}>نرخ: <strong style={{ color: C.text, fontFamily: "'Courier New',monospace" }}>{fmt(o.totalPrice)}</strong></span>
                        <span style={{ fontSize: 12, color: C.muted }}>دراوە: <strong style={{ color: C.green, fontFamily: "'Courier New',monospace" }}>{fmt(o.paidAmount)}</strong></span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.red, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>{fmt(r)} <span style={{ fontSize: 10 }}>د.ع</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Expenses section ── */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: showExpForm ? `1px solid ${C.border}` : "none" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>خەرجییەکان</div>
            {expInRange.length > 0 && <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginTop: 2, fontFamily: "'Courier New',monospace" }}>کۆ: {fmt(totalExpenses)} د.ع</div>}
          </div>
          <button onClick={() => { setShowExpForm(v => !v); setExpErr(""); }} style={{
            padding: "8px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer",
            border: `1.5px solid ${showExpForm ? C.muted : C.accent}`,
            background: showExpForm ? "transparent" : C.accent,
            color: showExpForm ? C.muted : "#fff",
            fontFamily: "Segoe UI,Tahoma,sans-serif", transition: "all .15s",
          }}>
            {showExpForm ? "هەڵوەشاندن" : "+ زیادکردنی خەرجی"}
          </button>
        </div>

        {showExpForm && (
          <div style={{ padding: "16px 18px", background: C.strip, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>وەسف</div>
                <input value={expForm.description} onChange={e => inp("description", e.target.value)} placeholder="کرێی مانگی..."
                  style={{ width: "100%", padding: "9px 12px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "Segoe UI,Tahoma,sans-serif" }}
                  onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>بڕی پارە</div>
                <input type="number" value={expForm.amount} onChange={e => inp("amount", e.target.value)} placeholder="50000"
                  style={{ width: "100%", padding: "9px 12px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "'Courier New',monospace" }}
                  onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>جۆر</div>
                <select value={expForm.category} onChange={e => inp("category", e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>بەروار</div>
                <input type="date" value={expForm.date} onChange={e => inp("date", e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            {expErr && <div style={{ color: C.red, fontSize: 13, marginBottom: 8, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{expErr}</div>}
            <button onClick={handleSaveExpense} style={{ padding: "9px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", background: C.header, color: C.headerText, border: "none", borderRadius: 9, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
              پاشەکەوتکردن
            </button>
          </div>
        )}

        {sortedExp.length === 0 ? (
          <div style={{ padding: "30px 18px", textAlign: "center", color: C.muted, fontSize: 14, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            {fromDate || toDate ? "هیچ خەرجییەک لەم ماوەیەدا نەدۆزرایەوە" : "هیچ خەرجییەک تۆمار نەکراوە"}
          </div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "Segoe UI,Tahoma,sans-serif", direction: "rtl" }}>
              <thead>
                <tr style={{ background: C.strip }}>
                  {["وەسف", "جۆر", "بڕی پارە", "بەروار", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", color: C.muted, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap", fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedExp.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? C.card : C.strip, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: C.text }}>{e.description}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: C.strip, border: `1px solid ${C.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{e.category}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: C.red, fontWeight: 700, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>
                      {fmt(e.amount)} <span style={{ fontSize: 11 }}>{e.currency === "USD" ? "$" : "د.ع"}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: C.muted, whiteSpace: "nowrap", fontSize: 13 }}>{e.date || "—"}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button onClick={() => onDeleteExpense(e.id)} style={{ background: "none", border: "none", color: C.red, fontSize: 16, cursor: "pointer", padding: "2px 6px", borderRadius: 6 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: C.strip, borderTop: `2px solid ${C.border}` }}>
                  <td colSpan={2} style={{ padding: "11px 14px", fontWeight: 700, color: C.text }}>کۆی خەرجییەکان</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: C.red, fontFamily: "'Courier New',monospace" }}>{fmt(totalExpenses)} د.ع</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Orders table ── */}
      {sortedOrders.length > 0 && (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>داواکارییەکان</div>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 13 : 14, fontFamily: "Segoe UI,Tahoma,sans-serif", direction: "rtl" }}>
              <thead>
                <tr style={{ background: C.header }}>
                  {["کۆد", "ناو", "نرخی گشتی", "دراوە", "ماوەکە", "حاڵەت", "بەروار"].map(h => (
                    <th key={h} style={{ padding: "11px 12px", color: C.headerText, fontWeight: 700, textAlign: "right", whiteSpace: "nowrap", fontSize: isMobile ? 12 : 14 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((o, i) => {
                  const r   = remAmt(o.totalPrice, o.paidAmount);
                  const s   = STATUS_MAP[o.status];
                  const cur = o.currency === "USD" ? "$" : "د.ع";
                  return (
                    <tr key={o.id} style={{ background: i % 2 === 0 ? C.card : C.strip, borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: C.header, color: C.headerText, borderRadius: 6, padding: "2px 10px", fontFamily: "'Courier New',monospace", fontSize: 13, fontWeight: 700 }}>{o.code}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{o.name}</td>
                      <td style={{ padding: "10px 12px", color: C.text, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(o.totalPrice)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 12px", color: C.green, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(o.paidAmount)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 12px", color: r > 0 ? C.red : C.green, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>{fmt(r)} <span style={{ fontSize: 11 }}>{cur}</span></td>
                      <td style={{ padding: "10px 12px" }}>
                        {s && <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>}
                      </td>
                      <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap", fontSize: 13 }}>{o.orderDate || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.strip, borderTop: `2.5px solid ${C.border}` }}>
                  <td colSpan={2} style={{ padding: "12px 12px", fontWeight: 700, color: C.text }}>کۆی گشتی</td>
                  <td style={{ padding: "12px 12px", fontWeight: 700, color: C.blue,  fontFamily: "'Courier New',monospace" }}>{fmt(totalValue)} د.ع</td>
                  <td style={{ padding: "12px 12px", fontWeight: 700, color: C.green, fontFamily: "'Courier New',monospace" }}>{fmt(grossRevenue)} د.ع</td>
                  <td style={{ padding: "12px 12px", fontWeight: 700, color: outstanding > 0 ? C.red : C.green, fontFamily: "'Courier New',monospace" }}>{fmt(outstanding)} د.ع</td>
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
