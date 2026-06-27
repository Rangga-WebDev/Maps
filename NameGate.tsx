// Layar masukkan nama (pengganti prompt). Memakai state lokal
// terkontrol — pola dasar form di React.

import { useState } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

export default function NameGate({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  const submit = () => {
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="namegate">
      <div className="namegate-card">
        <h1>Live Map</h1>
        <p>Masukkan nama untuk mulai berbagi lokasi.</p>
        <input
          type="text"
          placeholder="Nama kamu"
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <button onClick={submit} disabled={!trimmed}>
          Masuk peta
        </button>
      </div>
    </div>
  );
}
