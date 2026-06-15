import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C } from "../../constants/theme";
import { MEASUREMENTS, EMPTY_M } from "../../constants/measurements";
import { STATUS } from "../../constants/status";
import { EMPTY_FORM } from "../../constants/forms";
import { uuid } from "../../utils/uuid";
import { toNum, fmt } from "../../utils/format";
import { remAmt } from "../../utils/payment";
import { normPhone, validPhone } from "../../utils/phone";
import Lbl from "../ui/Lbl";
import FieldErr from "../ui/FieldErr";
import Inp from "../ui/Inp";
import Btn from "../ui/Btn";
import CustomerHistory from "./CustomerHistory";

export default function OrderModal({ order, allOrders, profiles, onClose, onSave }) {
  const isEdit = !!order;
  const [form, setForm] = useState(() =>
    order ? { ...order, measurements: { ...order.measurements } }
          : { ...EMPTY_FORM, measurements: { ...EMPTY_M } }
  );
  const [errors, setErrors] = useState({});
  const mRefs    = useRef([]);
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const sf = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const sm = useCallback((k, v) => setForm(f => ({ ...f, measurements: { ...f.measurements, [k]: v } })), []);
  const ce = useCallback(k => setErrors(e => ({ ...e, [k]: "" })), []);

  const prevOrder = useMemo(() =>
    allOrders
      .filter(o => normPhone(o.phone) === normPhone(form.phone) && o.id !== form.id)
      .sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""))[0] || null,
    [form.phone, allOrders, form.id]
  );

  const profileMatch = useMemo(() =>
    profiles.find(p => normPhone(p.phone) === normPhone(form.phone)),
    [form.phone, profiles]
  );

  const remaining = remAmt(form.totalPrice, form.paidAmount);

  function handleMKD(e, idx) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    idx < MEASUREMENTS.length - 1 ? mRefs.current[idx + 1]?.focus() : handleSave();
  }

  function validate() {
    const e = {};
    const codes = allOrders.filter(o => o.id !== form.id).map(o => o.code.trim());
    if (!form.code.trim())                                    e.code        = "کۆد داواکراوە";
    else if (codes.includes(form.code.trim()))                e.code        = "ئەم کۆدە پێشتر بەکارهاتووە";
    if (!form.name.trim())                                    e.name        = "ناو داواکراوە";
    if (!normPhone(form.phone))                               e.phone       = "ژمارەی مۆبایل داواکراوە";
    else if (!validPhone(form.phone))                         e.phone       = "ژمارە دروست نییە — 07XXXXXXXXX";
    if (!form.totalPrice.trim())                              e.totalPrice  = "نرخی گشتی داواکراوە";
    if (toNum(form.paidAmount) > toNum(form.totalPrice))      e.paidAmount  = "دراوە زیاتر لە نرخی گشتی نابێت";
    if (form.deliveryDate && form.orderDate && form.deliveryDate < form.orderDate)
      e.deliveryDate = "بەرواری گەیاندن نابێت پێش بەرواری داواکاری بێت";
    MEASUREMENTS.forEach(({ key, label }) => {
      if (!form.measurements[key]?.toString().trim()) e[key] = `${label} داواکراوە`;
    });
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      document.getElementById("mf-" + Object.keys(e)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSave({ ...form, id: form.id || uuid() });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 680, border: `2px solid ${C.border}`, padding: "28px 28px 24px", direction: "rtl", boxShadow: "0 16px 48px rgba(0,0,0,.22)", maxHeight: "92vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: C.text, fontSize: 21, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{isEdit ? "دەستکاری داواکاری" : "داواکاری نوێ"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        </div>

        <CustomerHistory phone={form.phone} orders={allOrders} currentId={form.id} />

        {profileMatch && (
          <div style={{ background: "#f0e8f8", border: "1px solid #c39bd3", borderRadius: 10, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, color: C.purple, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
              👤 پرۆفایلی <strong>{profileMatch.name}</strong> دۆزرایەوە
            </div>
            <Btn onClick={() => setForm(f => ({ ...f, name: profileMatch.name, measurements: { ...profileMatch.measurements } }))} color={C.purple} small>بارکردنی قەبارەکان</Btn>
          </div>
        )}

        {/* Code + Name */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: "0 0 120px" }} id="mf-code">
            <Lbl>کۆد</Lbl>
            <Inp ref={firstRef} value={form.code} hasErr={!!errors.code} placeholder="147"
              onChange={e => { sf("code", e.target.value); ce("code"); }} />
            <FieldErr msg={errors.code} />
          </div>
          <div style={{ flex: 1 }} id="mf-name">
            <Lbl>ناو</Lbl>
            <Inp value={form.name} hasErr={!!errors.name} placeholder="ناوی کڕیار"
              onChange={e => { sf("name", e.target.value); ce("name"); }} />
            <FieldErr msg={errors.name} />
          </div>
        </div>

        <div style={{ marginBottom: 10 }} id="mf-phone">
          <Lbl>ژمارەی مۆبایل</Lbl>
          <Inp value={form.phone} hasErr={!!errors.phone} placeholder="07XXXXXXXXX" dir="ltr" style={{ textAlign: "right" }}
            onChange={e => { sf("phone", e.target.value); ce("phone"); }} />
          <FieldErr msg={errors.phone} />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Lbl>بەرواری داواکاری</Lbl>
            <Inp type="date" value={form.orderDate} onChange={e => sf("orderDate", e.target.value)} />
          </div>
          <div style={{ flex: 1 }} id="mf-deliveryDate">
            <Lbl>بەرواری گەیاندن</Lbl>
            <Inp type="date" value={form.deliveryDate} hasErr={!!errors.deliveryDate}
              onChange={e => { sf("deliveryDate", e.target.value); ce("deliveryDate"); }} />
            <FieldErr msg={errors.deliveryDate} />
          </div>
        </div>

        {/* Payment */}
        <div style={{ background: C.strip, borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 12, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>💰 پارەدان (د.ع)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 100 }} id="mf-totalPrice">
              <Lbl>نرخی گشتی</Lbl>
              <Inp value={form.totalPrice} hasErr={!!errors.totalPrice} placeholder="35000"
                onChange={e => { sf("totalPrice", e.target.value); ce("totalPrice"); }} />
              <FieldErr msg={errors.totalPrice} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }} id="mf-paidAmount">
              <Lbl>دراوە</Lbl>
              <Inp value={form.paidAmount} hasErr={!!errors.paidAmount} placeholder="0"
                onChange={e => { sf("paidAmount", e.target.value); ce("paidAmount"); }} />
              <FieldErr msg={errors.paidAmount} />
            </div>
            <div style={{ flex: "0 0 auto" }}>
              <Lbl>ماوەکە</Lbl>
              <div style={{ padding: "10px 14px", fontSize: 17, fontWeight: 700, color: remaining > 0 ? C.red : C.green, background: C.card, borderRadius: 8, border: `1.5px solid ${C.border}`, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace" }}>
                {fmt(remaining)} د.ع
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Lbl>شێوازی دوورین</Lbl>
            <Inp value={form.style} placeholder="کلاسیک / سلیم..." onChange={e => sf("style", e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <Lbl>جۆری قوماش</Lbl>
            <Inp value={form.fabric} placeholder="وول، کاشمیر..." onChange={e => sf("fabric", e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Lbl>تێبینی</Lbl>
          <textarea value={form.notes} onChange={e => sf("notes", e.target.value)}
            placeholder="یاخەی تایبەت، گرێدانی زیادە..."
            style={{ width: "100%", padding: "10px 14px", fontSize: 15, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif", boxSizing: "border-box", outline: "none", resize: "vertical", minHeight: 60 }} />
        </div>

        {/* Status */}
        <div style={{ marginBottom: 14 }}>
          <Lbl>حاڵەت</Lbl>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS.map(s => (
              <button key={s.key} onClick={() => sf("status", s.key)} style={{
                flex: 1, minWidth: 90, padding: "10px 6px", fontSize: 14,
                border: `2px solid ${form.status === s.key ? s.color : C.border}`,
                borderRadius: 8, cursor: "pointer",
                background: form.status === s.key ? s.bg : C.card,
                color: form.status === s.key ? s.color : C.muted,
                fontWeight: form.status === s.key ? 700 : 400,
                fontFamily: "Segoe UI,Tahoma,sans-serif", transition: "all .15s",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Measurements */}
        <div style={{ background: C.strip, borderRadius: 12, padding: "16px 18px 12px", border: `1px solid ${C.border}`, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>📐 قەبارەکان (سم)</div>
            {prevOrder && (
              <Btn onClick={() => setForm(f => ({ ...f, measurements: { ...prevOrder.measurements } }))} color={C.purple} small>↩ قەبارەی پێشوو</Btn>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {MEASUREMENTS.map(({ key, label }, idx) => (
              <div key={key} id={"mf-" + key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontSize: 16, color: errors[key] ? C.red : C.text, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "Segoe UI,Tahoma,sans-serif", flex: "0 0 96px", textAlign: "right" }}>{label}</label>
                <input
                  ref={el => { mRefs.current[idx] = el; }}
                  type="number"
                  value={form.measurements[key]}
                  onChange={e => { sm(key, e.target.value); ce(key); }}
                  onKeyDown={e => handleMKD(e, idx)}
                  style={{ flex: 1, minWidth: 0, padding: "11px 14px", fontSize: 20, border: `1.5px solid ${errors[key] ? C.red : C.border}`, borderRadius: 8, background: errors[key] ? "#fff5f5" : C.card, color: C.text, textAlign: "center", fontWeight: 700, outline: "none", fontFamily: "'Courier New',monospace", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = errors[key] ? C.red : C.accent)}
                  onBlur={e  => (e.target.style.borderColor = errors[key] ? C.red : C.border)}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 10, marginBottom: 0, textAlign: "center" }}>Enter بپەرە بۆ قەبارەی دواتر</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleSave} color={C.header} solid>پاشەکەوتکردن ✓</Btn>
          <Btn onClick={onClose} color={C.muted}>هەڵوەشاندن</Btn>
        </div>
      </div>
    </div>
  );
}
