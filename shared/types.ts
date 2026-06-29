/** @format */

// ============================================================
//  shared/types.ts - Tipe bersama (satu sumber kebenaran)
// ============================================================
//  File ini dipakai server dan React agar bentuk data realtime
//  tetap sama di dua sisi aplikasi.
// ============================================================

// User yang sedang aktif di peta (hasil broadcast realtime).
export interface User {
  id: string; // id koneksi socket (berubah tiap reconnect)
  name: string;
  lat: number;
  lng: number;
}

// Data lokasi yang dikirim client ke server.
export interface LocationInput {
  name: string;
  lat: number;
  lng: number;
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
