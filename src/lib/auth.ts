/** @format */

// ============================================================
//  src/lib/auth.ts — Helper autentikasi sisi client
// ============================================================
//  - Memanggil API /api/auth/*
//  - Menyimpan token & data user di localStorage agar sesi
//    bertahan setelah refresh.
// ============================================================

import type { AuthResponse, AuthUser } from "../../shared/types";

const TOKEN_KEY = "livemap.token";
const USER_KEY = "livemap.user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

function persist(data: AuthResponse): AuthUser {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function post(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
  return data as AuthResponse;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  return persist(await post("login", { email, password }));
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return persist(await post("register", { name, email, password }));
}

// Validasi token tersimpan ke server (dipakai saat aplikasi dibuka).
export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      logout();
      return null;
    }
    const data = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user as AuthUser;
  } catch {
    return null;
  }
}
