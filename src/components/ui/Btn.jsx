import { C } from "../../constants/theme";

export default function Btn({ children, onClick, color = C.header, solid = false, small = false, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background:  solid ? color : "none",
      color:       solid ? "#fff" : color,
      border:      `1.5px solid ${color}`,
      borderRadius: 9,
      padding:     small ? "6px 14px" : "9px 20px",
      fontSize:    small ? 13 : 15,
      cursor:      "pointer",
      fontFamily:  "Segoe UI,Tahoma,sans-serif",
      fontWeight:  solid ? 600 : 400,
      whiteSpace:  "nowrap",
      ...style,
    }}>
      {children}
    </button>
  );
}
