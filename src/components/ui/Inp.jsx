import { C } from "../../constants/theme";

export default function Inp({ hasErr, style, ...props }) {
  return (
    <input
      style={{
        width: "100%", padding: "10px 14px", fontSize: 16, boxSizing: "border-box",
        border: `1.5px solid ${hasErr ? C.red : C.border}`, borderRadius: 10,
        background: hasErr ? "#fff5f5" : C.card, color: C.text,
        fontFamily: "Segoe UI,Tahoma,sans-serif", outline: "none",
        ...style,
      }}
      onFocus={e => (e.target.style.borderColor = hasErr ? C.red : C.accent)}
      onBlur={e  => (e.target.style.borderColor = hasErr ? C.red : C.border)}
      {...props}
    />
  );
}
