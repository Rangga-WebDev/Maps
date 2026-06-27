/** @format */

// ============================================================
//  shared/types.ts — Tipe bersama (satu sumber kebenaran)
// ============================================================
//  Karena pakai Vite, file ini bisa diimpor BAIK oleh server
//  MAUPUN oleh kode React. Jadi tipe User cukup ditulis sekali
//  di sini — masalah duplikasi tipe di versi sebelumnya hilang.
// ============================================================

export type Role = "admin" | "member";

// User yang sedang aktif di peta (hasil broadcast realtime).
export interface User {
  id: string; // id koneksi socket (berubah tiap reconnect)
  userId: string; // id akun di database (tetap)
  name: string;
  role: Role;
  lat: number;
  lng: number;
}

// Data lokasi yang dikirim client ke server. Nama & identitas
// TIDAK dikirim dari client — server mengambilnya dari token.
export interface LocationInput {
  lat: number;
  lng: number;
}

// Data akun yang aman dikirim ke client (tanpa password).
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Respons dari endpoint /api/auth/login & /register.
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Event SERVER -> CLIENT
export interface ServerToClientEvents {
  "existing-users": (users: Record<string, User>) => void;
  "location-updated": (user: User) => void;
  "user-left": (id: string) => void;
}

// Event CLIENT -> SERVER
export interface ClientToServerEvents {
  "update-location": (data: LocationInput) => void;
}
