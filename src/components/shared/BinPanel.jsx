import { useState } from "react";
import { C } from "../../constants/theme";
import { fmt } from "../../utils/format";
import Btn from "../ui/Btn";
import binIcon from "../../assets/images/bin.png";
import checkIcon from "../../assets/images/check.png";

export default function BinPanel({ bin, onRestore, onPermanentDelete, onClearAll, onClose }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 680, border: `2px solid ${C.border}`, direction: "rtl", boxShadow: "0 16px 48px rgba(0,0,0,.28)", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={binIcon} alt="bin" style={{ width: 20, height: 20, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>سەتلی داواکارییە سڕاوەکان</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{bin.length} داواکاری</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {bin.length > 0 && <Btn onClick={() => setConfirmClear(true)} color={C.red} small>سڕینەوەی هەموو</Btn>}
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
          </div>
        </div>

        {/* Confirm clear all */}
        {confirmClear && (
          <div style={{ background: "#fff5f5", border: `1px solid ${C.red}`, margin: "10px 16px", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginBottom: 8, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>⚠ دڵنیای لە سڕینەوەی هەموو؟</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => { onClearAll(); setConfirmClear(false); }} color={C.red} solid small>بەڵێ</Btn>
              <Btn onClick={() => setConfirmClear(false)} color={C.muted} small>نەخێر</Btn>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "10px 16px 16px" }}>
          {bin.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 50, color: C.muted }}>
              <div style={{ marginBottom: 10 }}>
                <img src={checkIcon} alt="empty bin" style={{ width: 40, height: 40, objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: 15, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>سەتل بەتاڵە</div>
            </div>
          ) : bin.map(o => (
            <div key={o.id} style={{ background: "#fff8f8", border: "1px solid #f0d0d0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: C.header, color: C.headerText, borderRadius: 6, padding: "3px 14px", fontFamily: "'Courier New',monospace", fontSize: 15, fontWeight: 700 }}>{o.code}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>{o.name}</span>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{o.deletedAt || ""}</span>
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 10, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                {o.phone} • گەیاندن: {o.deliveryDate || "—"} • {fmt(o.totalPrice)} د.ع
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => onRestore(o.id)} color={C.green} solid small>↩ گەڕاندنەوە</Btn>
                <Btn onClick={() => onPermanentDelete(o.id)} color={C.red} small>سڕینەوەی ئەبەدی</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
