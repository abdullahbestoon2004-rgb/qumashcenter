import { initials, avatarColor } from "../../utils/avatar";

export default function Avatar({ name, size = 44 }) {
  const [bg, fg] = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, fontFamily: "Segoe UI,Tahoma,sans-serif", flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}
