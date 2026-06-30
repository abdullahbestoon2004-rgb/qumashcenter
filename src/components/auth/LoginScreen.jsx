import { useState } from "react";
import { C } from "../../constants/theme";
import { BRANCHES } from "../../constants/branches";
import scissorsIcon from "../../assets/images/scissors.png";
import storeIcon    from "../../assets/images/store.png";

export default function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [pin,      setPin]      = useState("");
  const [err,      setErr]      = useState(false);

  function selectBranch(b) {
    setSelected(b);
    setPin("");
    setErr(false);
  }

  function handleLogin() {
    if (!selected) return;
    if (pin === selected.pin) {
      onLogin(selected.id);
    } else {
      setErr(true);
      setPin("");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", direction: "rtl", padding: 20 }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
        <div style={{ background: C.header, borderRadius: 16, padding: 12 }}>
          <img src={scissorsIcon} alt="scissors" style={{ width: 36, height: 36, objectFit: "contain" }} />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.header, fontFamily: "Segoe UI,Tahoma,sans-serif", lineHeight: 1.2 }}>قوماش سەنتەر</div>
          <div style={{ fontSize: 14, color: C.muted, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>لقێک هەڵبژێرە بۆ چوونەژوورەوە</div>
        </div>
      </div>

      {/* Branch cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {BRANCHES.map(b => {
          const active = selected?.id === b.id;
          return (
            <button key={b.id} onClick={() => selectBranch(b)} style={{
              width: 170, padding: "24px 16px 20px", borderRadius: 16, cursor: "pointer",
              border: `2.5px solid ${active ? C.accent : C.border}`,
              background: active ? C.header : C.card,
              color: active ? C.headerText : C.text,
              fontFamily: "Segoe UI,Tahoma,sans-serif", fontSize: 17, fontWeight: 700,
              transition: "all .18s",
              display: "flex", flexDirection: "column", alignItems: "center",
              boxShadow: active ? `0 8px 28px rgba(61,44,30,.25)` : "0 2px 10px rgba(0,0,0,.07)",
              transform: active ? "translateY(-3px)" : "none",
            }}>
              <img src={storeIcon} alt="store" style={{ width: 44, height: 44, objectFit: "contain", marginBottom: 10 }} />
              {b.name}
            </button>
          );
        })}
      </div>

      {/* PIN panel */}
      {selected && (
        <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: "24px 28px", width: "100%", maxWidth: 300, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.08)", direction: "rtl" }}>
          <div style={{ fontSize: 15, color: C.muted, marginBottom: 14, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            PIN — <strong style={{ color: C.text }}>{selected.name}</strong>
          </div>

          <input
            type="password"
            value={pin}
            autoFocus
            placeholder="····"
            onChange={e => { setPin(e.target.value); setErr(false); }}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
            style={{
              width: "100%", padding: "12px", fontSize: 24, textAlign: "center",
              border: `1.5px solid ${err ? C.red : C.border}`,
              borderRadius: 8, outline: "none", boxSizing: "border-box",
              background: err ? "#fff5f5" : C.bg, color: C.text,
              fontFamily: "'Courier New',monospace", letterSpacing: 8,
              transition: "border-color .12s",
            }}
          />

          {err && (
            <div style={{ color: C.red, fontSize: 13, marginTop: 8, fontFamily: "Segoe UI,Tahoma,sans-serif", fontWeight: 600 }}>
              کۆدەکە هەڵەیە، دووبارە هەوڵبدەرەوە
            </div>
          )}

          <button
            onClick={handleLogin}
            style={{
              marginTop: 16, width: "100%", padding: "13px", fontSize: 16, fontWeight: 700,
              background: C.header, color: C.headerText, border: "none", borderRadius: 9,
              cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif",
              transition: "opacity .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            چوونەژوورەوە
          </button>
        </div>
      )}
    </div>
  );
}
