/** @format */

import { useState } from "react";
import NameGate from "./components/NameGate";
import MapView from "./components/MapView";
import StatusPanel from "./components/StatusPanel";
import { useRealtimeLocation } from "./hooks/useRealtimeLocation";

const NAME_KEY = "livemap.name";

function getStoredName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export default function App() {
  const [name, setName] = useState(getStoredName);

  const handleNameSubmit = (nextName: string) => {
    const trimmed = nextName.trim();
    localStorage.setItem(NAME_KEY, trimmed);
    setName(trimmed);
  };

  const handleResetName = () => {
    localStorage.removeItem(NAME_KEY);
    setName("");
  };

  if (!name) {
    return <NameGate onSubmit={handleNameSubmit} />;
  }

  return <LiveMap name={name} onResetName={handleResetName} />;
}

// Dipisah agar hook realtime hanya aktif setelah nama diisi.
function LiveMap({
  name,
  onResetName,
}: {
  name: string;
  onResetName: () => void;
}) {
  const { connected, users, me } = useRealtimeLocation(name);

  // Jumlah online = user lain + diri sendiri (jika posisi sudah ada).
  const onlineCount = Object.keys(users).length + (me ? 1 : 0);

  return (
    <>
      <MapView name={name} me={me} users={users} />
      <StatusPanel
        connected={connected}
        name={name}
        onlineCount={onlineCount}
        coords={me}
        onResetName={onResetName}
      />
    </>
  );
}
