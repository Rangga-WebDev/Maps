/** @format */

// ============================================================
//  AuthGate.tsx — Layar login & daftar (pengganti NameGate)
// ============================================================
//  Satu komponen, dua mode: "login" dan "register". Form
//  terkontrol dengan state lokal — pola dasar React.
// ============================================================

import { useState } from "react";
import type { AuthUser } from "../../shared/types";
import { login, register } from "../lib/auth";

interface Props {
  onAuth: (user: AuthUser) => void;
}

type Mode = "login" | "register";

export default function AuthGate({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const user =
        mode === "login"
          ? await login(email.trim(), password)
          : await register(name.trim(), email.trim(), password);
      onAuth(user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="namegate">
      <div className="namegate-card">
        <h1>Live Map</h1>
        <p>
          {mode === "login"
            ? "Masuk untuk berbagi lokasi dengan tim."
            : "Buat akun anggota baru."}
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
            type="button"
          >
            Masuk
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
            type="button"
          >
            Daftar
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {mode === "register" && (
            <input
              type="text"
              placeholder="Nama lengkap"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoFocus={mode === "login"}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min. 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={busy}>
            {busy
              ? "Memproses…"
              : mode === "login"
                ? "Masuk peta"
                : "Daftar & masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
