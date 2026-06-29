/** @format */

// ============================================================
//  useRealtimeLocation.ts — "otak" realtime di sisi React
// ============================================================
//  Custom hook menyatukan dua hal:
//  1. Koneksi Socket.io (kirim & terima posisi).
//  2. Pemantauan GPS sendiri (watchPosition).
//  Hook mengembalikan state, dan React otomatis me-render ulang
//  komponen saat state berubah — itulah inti cara React bekerja.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  User,
} from "../../shared/types";

// Socket bertipe: emit & on ikut diperiksa TypeScript.
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Coords {
  lat: number;
  lng: number;
}

interface RealtimeState {
  connected: boolean;
  users: Record<string, User>; // user LAIN (diri sendiri tidak termasuk)
  me: Coords | null;
}

export function useRealtimeLocation(name: string): RealtimeState {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [me, setMe] = useState<Coords | null>(null);
  const socketRef = useRef<AppSocket | null>(null);

  // Efek 1: buka koneksi socket sekali, dengarkan event server.
  useEffect(() => {
    const socket: AppSocket = io();
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("existing-users", (existing) => setUsers(existing));

    socket.on("location-updated", (user) =>
      setUsers((prev) => ({ ...prev, [user.id]: user })),
    );

    socket.on("user-left", (id) =>
      setUsers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    );

    // Cleanup: tutup koneksi saat komponen dilepas.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Efek 2: pantau lokasi sendiri & kirim ke server tiap kali bergerak.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("Browser kamu tidak mendukung geolocation.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMe(coords);
        socketRef.current?.emit("update-location", { ...coords, name });
      },
      (err) => alert("Gagal mengambil lokasi: " + err.message),
      { enableHighAccuracy: true, maximumAge: 0 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [name]);

  return { connected, users, me };
}
