import { useState } from "react";
import { C } from "../../constants/theme";
import { fmt, toNum } from "../../utils/format";
import { remAmt } from "../../utils/payment";
import { todayISO } from "../../utils/date";
import { uuid } from "../../utils/uuid";
import Lbl from "../ui/Lbl";
import Inp from "../ui/Inp";
import Btn from "../ui/Btn";

export default function PaymentModal({ order, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [note,   setNote]   = useState("");
  const [err,    setErr]    = useState("");

  const cur       = order.currency === "USD" ? "$" : "د.ع";
  const remaining = remAmt(order.totalPrice, order.paidAmount);

  function handleSave() {
    const n = toNum(amount);
    if (!n || n <= 0)    { setErr("بڕی پارە داواکراوە");                return; }
    if (n > remaining)   { setErr("پارەکە زیاتر لە ماوەی قەرزەکەیە"); return; }
    const entry   = { id: uuid(), amount: n, date: todayISO(), note: note.trim() };
    const newPaid = String(toNum(order.paidAmount) + n);
    onSave({ ...order, paidAmount: newPaid, paymentLog: [...(order.paymentLog || []), entry] });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 380, border: `2px solid ${C.border}`, padding: "24px 24px 20px", direction: "rtl", boxShadow: "0 16px 48px rgba(0,0,0,.22)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: C.text, fontSize: 18, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>زیادکردنی پارەدان</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        </div>

        <div style={{ background: C.strip, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            {order.name} · <span style={{ fontFamily: "'Courier New',monospace" }}>{order.code}</span>
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            ماوەی قەرز: <strong style={{ color: C.red }}>{fmt(remaining)} {cur}</strong>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Lbl>بڕی پارەدان ({cur})</Lbl>
          <Inp value={amount} hasErr={!!err} placeholder="10,000" autoFocus
            onChange={e => { setAmount(e.target.value); setErr(""); }} />
          {err && <div style={{ color: C.red, fontSize: 13, marginTop: 4, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{err}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <Lbl>تێبینی (ئارەزوومەندانە)</Lbl>
          <Inp value={note} placeholder="قیستی یەکەم..." onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleSave} color={C.green} solid>تۆمارکردن</Btn>
          <Btn onClick={onClose} color={C.muted}>هەڵوەشاندن</Btn>
        </div>
      </div>
    </div>
  );
}
