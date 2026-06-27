import { useState } from 'react';
import NameGate from './components/NameGate';
import MapView from './components/MapView';
import StatusPanel from './components/StatusPanel';
import { useRealtimeLocation } from './hooks/useRealtimeLocation';

export default function App() {
  // Selama nama belum diisi, tampilkan layar masukkan nama.
  const [name, setName] = useState<string | null>(null);

  if (!name) {
    return <NameGate onSubmit={setName} />;
  }

  return <LiveMap name={name} />;
}

// Dipisah agar hook realtime hanya aktif setelah nama diisi.
function LiveMap({ name }: { name: string }) {
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
      />
    </>
  );
}
