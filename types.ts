// ============================================================
//  shared/types.ts — Tipe bersama (satu sumber kebenaran)
// ============================================================
//  Karena pakai Vite, file ini bisa diimpor BAIK oleh server
//  MAUPUN oleh kode React. Jadi tipe User cukup ditulis sekali
//  di sini — masalah duplikasi tipe di versi sebelumnya hilang.
// ============================================================

export interface User {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface LocationInput {
  name: string;
  lat: number;
  lng: number;
}

// Event SERVER -> CLIENT
export interface ServerToClientEvents {
  'existing-users': (users: Record<string, User>) => void;
  'location-updated': (user: User) => void;
  'user-left': (id: string) => void;
}

// Event CLIENT -> SERVER
export interface ClientToServerEvents {
  'update-location': (data: LocationInput) => void;
}
