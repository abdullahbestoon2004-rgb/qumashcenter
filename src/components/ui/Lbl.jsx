import { C } from "../../constants/theme";

export default function Lbl({ children }) {
  return (
    <div style={{ fontSize: 13, color: C.muted, marginBottom: 3, fontWeight: 600, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
      {children}
    </div>
  );
}
