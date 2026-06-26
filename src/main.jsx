import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginScreen from './components/auth/LoginScreen.jsx'
import { ls } from './utils/storage.js'
import { BRANCHES } from './constants/branches.js'

function Root() {
  const [branchId, setBranchId] = useState(() => {
    const saved = ls.load("qumash_session", null);
    // Make sure the saved branch still exists in config
    return saved && BRANCHES.find(b => b.id === saved) ? saved : null;
  });

  if (!branchId) {
    return (
      <LoginScreen
        onLogin={id => { ls.save("qumash_session", id); setBranchId(id); }}
      />
    );
  }

  const branch = BRANCHES.find(b => b.id === branchId);

  return (
    <App
      key={branchId}
      branchId={branchId}
      branchName={branch?.name || ""}
      onLogout={() => { ls.remove("qumash_session"); setBranchId(null); }}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
