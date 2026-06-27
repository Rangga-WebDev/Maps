/** @format */

import { useEffect, useState } from "react";
import AuthGate from "./components/AuthGate";
import MapView from "./components/MapView";
import StatusPanel from "./components/StatusPanel";
import { useRealtimeLocation } from "./hooks/useRealtimeLocation";
import type { AuthUser } from "../shared/types";
import { fetchMe, getStoredUser, getToken, logout } from "./lib/auth";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [checking, setChecking] = useState(true);

  // Saat aplikasi dibuka, validasi token tersimpan ke server.
  useEffect(() => {
    fetchMe()
      .then((u) => {
        if (u) setUser(u);
        else setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (checking && getToken()) {
    return (
      <div className="namegate">
        <div className="namegate-card">
          <p>Memuat sesi…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuth={setUser} />;
  }

  return <LiveMap user={user} onLogout={handleLogout} />;
}

// Dipisah agar hook realtime hanya aktif setelah login.
function LiveMap({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const token = getToken() ?? "";
  const { connected, users, me } = useRealtimeLocation(token);

  // Jumlah online = user lain + diri sendiri (jika posisi sudah ada).
  const onlineCount = Object.keys(users).length + (me ? 1 : 0);

  return (
    <>
      <MapView name={user.name} me={me} users={users} />
      <StatusPanel
        connected={connected}
        name={user.name}
        role={user.role}
        onlineCount={onlineCount}
        coords={me}
        onLogout={onLogout}
      />
    </>
  );
}
