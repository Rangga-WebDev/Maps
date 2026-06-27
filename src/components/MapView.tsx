/** @format */

// ============================================================
//  MapView.tsx — Peta deklaratif dengan react-leaflet
// ============================================================
//  Perhatikan: kita TIDAK lagi menambah/menggeser marker manual.
//  Kita cukup mendaftar <Marker> dari data; saat data berubah,
//  React + react-leaflet otomatis memperbarui peta. Inilah
//  perbedaan besar gaya React dibanding manipulasi DOM langsung.
// ============================================================

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { User } from "../../shared/types";

// Perbaiki ikon marker default Leaflet yang "rusak" saat dibundel Vite.
// (Tanpa ini, marker tampil sebagai gambar kosong.)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  name: string;
  me: Coords | null;
  users: Record<string, User>;
}

// Komponen kecil untuk memusatkan peta ke lokasi kita — sekali saja,
// saat GPS pertama kali dapat sinyal. useMap() memberi akses objek peta.
function RecenterOnce({ me }: { me: Coords | null }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (me && !done.current) {
      map.setView([me.lat, me.lng], 16);
      done.current = true;
    }
  }, [me, map]);

  return null;
}

export default function MapView({ name, me, users }: Props) {
  return (
    <MapContainer
      center={[-5.135, 119.423]} // default: Makassar
      zoom={13}
      zoomControl={false}
      style={{ position: "absolute", inset: 0 }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />

      {/* Marker diri sendiri */}
      {me && (
        <Marker position={[me.lat, me.lng]}>
          <Popup>Saya ({name})</Popup>
        </Marker>
      )}

      {/* Marker user lain — dibuat dari data, key wajib unik */}
      {Object.values(users).map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]}>
          <Popup>{u.name}</Popup>
        </Marker>
      ))}

      <RecenterOnce me={me} />
    </MapContainer>
  );
}
