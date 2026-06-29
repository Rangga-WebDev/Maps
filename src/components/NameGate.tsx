/** @format */

// ============================================================
//  NameGate.tsx - Layar input nama sederhana
// ============================================================

import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export default function NameGate({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="namegate">
      <div className="namegate-card">
        <h1>Live Map</h1>
        <p>Masukkan nama untuk mulai berbagi lokasi realtime.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <input
            type="text"
            placeholder="Nama kamu"
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />

          {error && <p className="name-error">{error}</p>}

          <button type="submit">Masuk peta</button>
        </form>
      </div>
    </div>
  );
}
