import { C } from "../../constants/theme";

export default function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: C.red, fontSize: 13, marginTop: 3, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
      ⚠ {msg}
    </div>
  );
}
