import { useState, useRef, useEffect } from "react";
import { C } from "../../constants/theme";
import { MEASUREMENTS, EMPTY_M } from "../../constants/measurements";
import { uuid } from "../../utils/uuid";
import { todayISO } from "../../utils/date";
import { normPhone, validPhone } from "../../utils/phone";
import Lbl from "../ui/Lbl";
import FieldErr from "../ui/FieldErr";
import Inp from "../ui/Inp";
import Btn from "../ui/Btn";
import checkIcon from "../../assets/images/check.png";

export default function ProfileForm({ profile, onClose, onSave }) {
  const isEdit = !!profile;
  const [form, setForm] = useState(profile
    ? { ...profile, measurements: { ...profile.measurements } }
    : { id: uuid(), name: "", phone: "", notes: "", measurements: { ...EMPTY_M }, createdAt: todayISO() }
  );
  const [errors, setErrors] = useState({});
  const mRefs    = useRef([]);
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sm = (k, v) => setForm(f => ({ ...f, measurements: { ...f.measurements, [k]: v } }));

  function handleSave() {
    const e = {};
    if (!form.name.trim())            e.name  = "ناو داواکراوە";
    if (!normPhone(form.phone))       e.phone = "ژمارەی مۆبایل داواکراوە";
    else if (!validPhone(form.phone)) e.phone = "ژمارە دروست نییە — 07XXXXXXXXX";
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, phone: normPhone(form.phone) });
  }

  function handleMKD(e, idx) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (idx < MEASUREMENTS.length - 1) mRefs.current[idx + 1]?.focus();
    else handleSave();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 620, border: `2px solid ${C.border}`, padding: "28px 28px 24px", direction: "rtl", boxShadow: "0 16px 48px rgba(0,0,0,.22)", maxHeight: "92vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: C.text, fontSize: 21, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{isEdit ? "دەستکاری پرۆفایل" : "پرۆفایلی نوێ"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Lbl>ناو</Lbl>
            <Inp ref={firstRef} value={form.name} hasErr={!!errors.name} placeholder="ناوی کڕیار"
              onChange={e => { sf("name", e.target.value); setErrors(ev => ({ ...ev, name: "" })); }} />
            <FieldErr msg={errors.name} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Lbl>ژمارەی مۆبایل</Lbl>
          <Inp value={form.phone} hasErr={!!errors.phone} placeholder="07XXXXXXXXX" dir="ltr" style={{ textAlign: "right" }}
            onChange={e => { sf("phone", e.target.value); setErrors(ev => ({ ...ev, phone: "" })); }} />
          <FieldErr msg={errors.phone} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Lbl>تێبینی کڕیار</Lbl>
          <textarea value={form.notes} onChange={e => sf("notes", e.target.value)}
            placeholder="کڕیاری هەمیشەیی، حەزی لە کلاسیک..."
            style={{ width: "100%", padding: "10px 14px", fontSize: 15, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif", boxSizing: "border-box", outline: "none", resize: "vertical", minHeight: 62 }} />
        </div>

        <div style={{ background: C.strip, borderRadius: 12, padding: "16px 18px 12px", border: `1px solid ${C.border}`, marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 12, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>📐 قەبارەکان (سم)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {MEASUREMENTS.map(({ key, label }, idx) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontSize: 16, color: C.text, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "Segoe UI,Tahoma,sans-serif", flex: "0 0 96px", textAlign: "right" }}>{label}</label>
                <input
                  ref={el => { mRefs.current[idx] = el; }}
                  type="number"
                  value={form.measurements[key]}
                  onChange={e => sm(key, e.target.value)}
                  onKeyDown={e => handleMKD(e, idx)}
                  style={{ flex: 1, minWidth: 0, padding: "11px 14px", fontSize: 20, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.card, color: C.text, textAlign: "center", fontWeight: 700, outline: "none", fontFamily: "'Courier New',monospace", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = C.accent)}
                  onBlur={e  => (e.target.style.borderColor = C.border)}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 10, marginBottom: 0, textAlign: "center" }}>Enter بپەرە بۆ قەبارەی دواتر</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleSave} color={C.header} solid style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>پاشەکەوتکردن</span>
            <img src={checkIcon} alt="check" style={{ width: 14, height: 14, objectFit: "contain" }} />
          </Btn>
          <Btn onClick={onClose} color={C.muted}>هەڵوەشاندن</Btn>
        </div>
      </div>
    </div>
  );
}
