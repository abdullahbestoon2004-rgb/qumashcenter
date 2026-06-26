import { useState, useEffect, useMemo } from "react";
import { C } from "./constants/theme";
import { EMPTY_FORM } from "./constants/forms";
import { EMPTY_M } from "./constants/measurements";
import { uuid } from "./utils/uuid";
import { todayISO } from "./utils/date";
import { normPhone } from "./utils/phone";
import { matchSearch } from "./utils/search";
import { ls } from "./utils/storage";

import Dashboard     from "./components/orders/Dashboard";
import OrderCard     from "./components/orders/OrderCard";
import OrderModal    from "./components/orders/OrderModal";
import PaymentModal  from "./components/orders/PaymentModal";
import ProfilesTab   from "./components/profiles/ProfilesTab";
import ProfileForm   from "./components/profiles/ProfileForm";
import ProfileDetail from "./components/profiles/ProfileDetail";
import DeleteConfirm from "./components/shared/DeleteConfirm";
import BinPanel      from "./components/shared/BinPanel";
import Btn           from "./components/ui/Btn";
import binIcon      from "./assets/images/bin.png";
import magnifyIcon  from "./assets/images/magnify.png";
import ordersIcon   from "./assets/images/orders.png";
import personIcon   from "./assets/images/person.png";
import scissorsIcon from "./assets/images/scissors.png";

export default function App({ branchId, branchName, onLogout }) {
  const K = k => `qumash_${branchId}_${k}`;

  const [orders,       setOrders]       = useState(() => ls.load(K("orders"),   []));
  const [profiles,     setProfiles]     = useState(() => ls.load(K("profiles"), []));
  const [bin,          setBin]          = useState(() => ls.load(K("bin"),      []));
  const [tab,          setTab]          = useState("orders");   // "orders" | "profiles"
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [modal,        setModal]        = useState(null);       // null | "new" | order
  const [payModal,     setPayModal]     = useState(null);       // null | order
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [showBin,      setShowBin]      = useState(false);
  const [profileModal, setProfileModal] = useState(null);       // null | "new" | profile (edit) | { view: profile }

  useEffect(() => { ls.save(K("orders"),   orders);   }, [orders]);
  useEffect(() => { ls.save(K("profiles"), profiles); }, [profiles]);
  useEffect(() => { ls.save(K("bin"),      bin);      }, [bin]);

  function handleAddNewProfile(name) {
    setProfiles(prev => [{ id: uuid(), name, phone: "", notes: "", measurements: { ...EMPTY_M }, createdAt: todayISO() }, ...prev]);
  }

  // Auto-create/update profile when an order is saved
  function handleSaveOrder(order) {
    setOrders(prev => {
      const exists = prev.find(o => o.id === order.id);
      return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
    });
    setProfiles(prev => {
      const ph = normPhone(order.phone);
      // Match by phone first, then fall back to a stub profile (no phone) with same name
      const existing = prev.find(p => normPhone(p.phone) === ph)
        || prev.find(p => !normPhone(p.phone) && p.name.trim().toLowerCase() === order.name.trim().toLowerCase());
      if (existing) {
        return prev.map(p => p.id === existing.id
          ? { ...p, name: order.name, phone: ph, measurements: { ...order.measurements } }
          : p
        );
      }
      return [{ id: uuid(), name: order.name, phone: ph, measurements: { ...order.measurements }, notes: "", createdAt: todayISO() }, ...prev];
    });
    setModal(null);
  }

  function handleSaveProfile(profile) {
    setProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id);
      return exists ? prev.map(p => p.id === profile.id ? profile : p) : [profile, ...prev];
    });
    setProfileModal(null);
  }

  function handleDeleteProfile(id) {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setProfileModal(null);
  }

  function handleAddPayment(updatedOrder) {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setPayModal(null);
  }

  function handleDeleteOrder(id) {
    const target = orders.find(o => o.id === id);
    if (!target) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    setBin(prev => [{ ...target, deletedAt: todayISO() }, ...prev]);
  }

  function handleNewOrderForProfile(profile) {
    setProfileModal(null);
    setTab("orders");
    setModal({ ...EMPTY_FORM, measurements: { ...profile.measurements }, name: profile.name, phone: profile.phone, id: null });
  }

  const filtered = useMemo(() =>
    orders.filter(o => (!search || matchSearch(o, search)) && (filter === "all" || o.status === filter)),
    [orders, search, filter]
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, direction: "rtl" }}>

      {/* Header */}
      <header style={{ background: C.header, padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={scissorsIcon} alt="scissors" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <div>
            <div style={{ color: C.headerText, fontWeight: 700, fontSize: 19, fontFamily: "Segoe UI,Tahoma,sans-serif", lineHeight: 1.2 }}>قوماش سەنتەر</div>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 600, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>🏪 {branchName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setShowBin(true)} style={{ background: "none", color: C.headerText, border: `1.5px solid ${C.muted}`, borderRadius: 10, padding: "9px 18px", fontSize: 15, cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif", display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
            <img src={binIcon} alt="bin" style={{ width: 16, height: 16, objectFit: "contain" }} /> سڕاوەکان
            {bin.length > 0 && (
              <span style={{ background: C.red, color: "#fff", borderRadius: "50%", width: 22, height: 22, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: -8, left: -8 }}>
                {bin.length}
              </span>
            )}
          </button>
          {tab === "orders"
            ? <Btn onClick={() => setModal("new")} color={C.accent} solid>+ داواکاری نوێ</Btn>
            : <Btn onClick={() => setProfileModal("new")} color={C.accent} solid>+ پرۆفایلی نوێ</Btn>
          }
          <button onClick={onLogout} title="چوونەدەرەوە" style={{ background: "none", border: `1.5px solid ${C.muted}`, borderRadius: 10, padding: "9px 14px", fontSize: 18, cursor: "pointer", color: C.muted, lineHeight: 1 }}>⏻</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: C.header, display: "flex", padding: "0 30px", borderBottom: `2.5px solid ${C.accent}` }}>
        {[
          { key: "orders", icon: ordersIcon, label: "داواکارییەکان" },
          { key: "profiles", icon: personIcon, label: "کڕیارەکان" }
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "none", border: "none", color: tab === key ? C.accent : C.muted,
            fontSize: 16, fontWeight: tab === key ? 700 : 400, padding: "14px 22px",
            cursor: "pointer", fontFamily: "Segoe UI,Tahoma,sans-serif",
            borderBottom: tab === key ? `4px solid ${C.accent}` : "4px solid transparent",
            marginBottom: -2.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}>
            <img src={icon} alt={label} style={{ width: 18, height: 18, objectFit: "contain", filter: tab === key ? "none" : "grayscale(100%) opacity(0.7)" }} />
            <span>{label}</span>
            {key === "profiles" && (
              <span style={{ marginRight: 8, background: C.muted, color: C.header, borderRadius: 20, padding: "2px 9px", fontSize: 13 }}>{profiles.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "orders" && <>
        <Dashboard orders={orders} activeFilter={filter} onFilter={setFilter} />
        <div style={{ background: "#ede3cf", borderBottom: `1.5px solid ${C.border}`, padding: "16px 30px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <img src={magnifyIcon} alt="search" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, objectFit: "contain", pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="گەڕان بەپێی کۆد، ناو، یان ژمارەی مۆبایل..."
              style={{ width: "100%", padding: "12px 42px 12px 16px", fontSize: 16, border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.card, color: C.text, fontFamily: "Segoe UI,Tahoma,sans-serif", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = C.accent)}
              onBlur={e  => (e.target.style.borderColor = C.border)}
            />
          </div>
          <div style={{ color: C.muted, fontSize: 15, whiteSpace: "nowrap" }}>{filtered.length} داواکاری</div>
        </div>
        <main style={{ padding: "30px 20px", maxWidth: 1600, margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 70, color: C.muted }}>
              <div style={{ marginBottom: 10 }}>
                <img src={ordersIcon} alt="no orders" style={{ width: 48, height: 48, objectFit: "contain", filter: "grayscale(100%) opacity(0.6)" }} />
              </div>
              <div style={{ fontSize: 17, fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
                {search || filter !== "all" ? "هیچ داواکارییەک نەدۆزرایەوە" : "هیچ داواکارییەک تۆمار نەکراوە"}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(370px,1fr))", gap: 20 }}>
              {filtered.map(o => <OrderCard key={o.id} order={o} onEdit={ord => setModal(ord)} onDelete={id => setConfirmDel(id)} onAddPayment={ord => setPayModal(ord)} />)}
            </div>
          )}
        </main>
      </>}

      {tab === "profiles" && (
        <ProfilesTab
          profiles={profiles} orders={orders}
          onNewProfile={() => setProfileModal("new")}
          onEditProfile={p => setProfileModal(p)}
          onDeleteProfile={handleDeleteProfile}
          onViewProfile={p => setProfileModal({ view: p })}
        />
      )}

      {/* Modals */}
      {showBin && (
        <BinPanel bin={bin}
          onRestore={id => {
            const t = bin.find(o => o.id === id);
            if (!t) return;
            const { deletedAt, ...o } = t;
            setBin(prev => prev.filter(x => x.id !== id));
            setOrders(prev => [o, ...prev]);
          }}
          onPermanentDelete={id => setBin(prev => prev.filter(o => o.id !== id))}
          onClearAll={() => setBin([])}
          onClose={() => setShowBin(false)}
        />
      )}

      {confirmDel && (
        <DeleteConfirm
          name={orders.find(o => o.id === confirmDel)?.name || ""}
          onConfirm={() => { handleDeleteOrder(confirmDel); setConfirmDel(null); }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {modal && (
        <OrderModal
          order={modal === "new" ? null : modal}
          allOrders={orders} profiles={profiles}
          onClose={() => setModal(null)}
          onSave={handleSaveOrder}
          onAddNewProfile={handleAddNewProfile}
        />
      )}

      {payModal && (
        <PaymentModal
          order={payModal}
          onClose={() => setPayModal(null)}
          onSave={handleAddPayment}
        />
      )}

      {profileModal === "new" && <ProfileForm onClose={() => setProfileModal(null)} onSave={handleSaveProfile} />}
      {profileModal && profileModal !== "new" && !profileModal.view && <ProfileForm profile={profileModal} onClose={() => setProfileModal(null)} onSave={handleSaveProfile} />}
      {profileModal?.view && (
        <ProfileDetail
          profile={profileModal.view} orders={orders}
          onClose={() => setProfileModal(null)}
          onEdit={p => setProfileModal(p)}
          onDelete={handleDeleteProfile}
          onNewOrder={handleNewOrderForProfile}
        />
      )}
    </div>
  );
}
