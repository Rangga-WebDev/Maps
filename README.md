<!-- @format -->

# Live Map - Share Lokasi Realtime Dasar (React + TypeScript)

Frontend **React (.tsx) + Vite**, backend **Express + Socket.io** dijalankan
oleh **tsx**, peta dengan **react-leaflet**.

## Cara menjalankan (mode dev)

```bash
npm install
npm run dev
```

Perintah `npm run dev` menjalankan **dua proses sekaligus** (lewat `concurrently`):

- **server** (`tsx watch server/server.ts`) di port **3000** — menangani Socket.io
- **client** (`vite`) di port **5173** — menyajikan aplikasi React

Buka browser ke **http://localhost:5173**, masukkan nama, izinkan akses lokasi.
Uji multi-user: buka di **dua tab** dengan nama berbeda.

> Koneksi socket dari React memakai `io()` tanpa URL. Saat dev, Vite mem-proxy
> `/socket.io` ke server port 3000 (lihat `vite.config.ts`), jadi tidak perlu
> mengatur CORS atau menulis alamat server.

## Cara menjalankan (mode produksi)

```bash
npm run build     # tsc (cek tipe) + vite build -> folder dist
npm start         # server menyajikan dist + Socket.io di port 3000
```

Lalu buka **http://localhost:3000**.

## Peta konsep React di proyek ini

- **`shared/types.ts`** — tipe dipakai server DAN client (satu sumber).
- **`src/hooks/useRealtimeLocation.ts`** — custom hook: koneksi socket + GPS,
  mengembalikan state. Saat state berubah, React render ulang otomatis.
- **`src/components/MapView.tsx`** — marker dibuat **deklaratif** dari data.
  Tidak ada lagi tambah/geser/hapus marker manual; react-leaflet yang urus.
- **`src/components/StatusPanel.tsx`**, **`NameGate.tsx`** — komponen tampilan.

## Catatan penting

- **Geolocation hanya jalan di `localhost` atau HTTPS.**
- Posisi disimpan di memori server (hilang saat restart).
- Tidak memakai file `.env`, MongoDB, login, atau register. Identitas user hanya
  berupa nama yang disimpan di `localStorage` browser.
- Di dev, `<React.StrictMode>` membuat efek dijalankan dua kali untuk mendeteksi
  bug. Karena kita sudah menulis cleanup (disconnect socket, clearWatch GPS),
  ini aman — kamu mungkin melihat log connect/disconnect ganda saat dev, itu wajar.

## Struktur

```
realtime-map-react/
├── package.json
├── vite.config.ts          # proxy /socket.io -> :3000
├── tsconfig.json           # konfigurasi TS aplikasi React
├── tsconfig.node.json      # konfigurasi TS vite config + server
├── index.html              # entry Vite
├── shared/
│   └── types.ts            # tipe bersama server & client
├── server/
│   └── server.ts           # backend (tsx)
└── src/
    ├── main.tsx            # entry React
    ├── App.tsx             # komponen utama
    ├── index.css           # gaya global & panel
    ├── vite-env.d.ts       # tipe impor aset (png) dari Vite
    ├── hooks/
    │   └── useRealtimeLocation.ts
    └── components/
        ├── MapView.tsx
        ├── StatusPanel.tsx
        └── NameGate.tsx
```
