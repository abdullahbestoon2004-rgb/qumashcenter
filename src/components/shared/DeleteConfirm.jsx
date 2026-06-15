import { C } from "../../constants/theme";
import Btn from "../ui/Btn";

export default function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,18,8,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 16 }}>
      <div style={{ background: C.card, borderRadius: 14, padding: "34px 30px 26px", maxWidth: 420, width: "100%", direction: "rtl", border: `2px solid ${C.border}`, boxShadow: "0 16px 48px rgba(0,0,0,.28)", textAlign: "center" }}>
        <div style={{ fontSize: 46, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 21, fontWeight: 700, color: C.text, marginBottom: 10, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>دڵنیای لە سڕینەوە؟</div>
        <div style={{ fontSize: 15, color: "#8a6a4a", marginBottom: 26, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>داواکاری «{name}» دەسڕێتەوە.</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn onClick={onConfirm} color={C.red} solid>بەڵێ، بسڕەوە</Btn>
          <Btn onClick={onCancel} color={C.muted}>نەخێر</Btn>
        </div>
      </div>
    </div>
  );
}
