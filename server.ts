// ============================================================
//  server/server.ts — Backend (Express + Socket.io)
// ============================================================
//  Dijalankan langsung oleh tsx (tanpa build). Tugasnya:
//  - menyajikan hasil build React (folder dist) di produksi
//  - jadi penghubung realtime antar user
// ============================================================

import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  User,
} from '../shared/types';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

// Di produksi, file React hasil "vite build" ada di folder dist.
app.use(express.static('dist'));

const users: Record<string, User> = {};

io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);

  socket.emit('existing-users', users);

  // "data" otomatis bertipe LocationInput berkat generic di atas.
  socket.on('update-location', (data) => {
    users[socket.id] = {
      id: socket.id,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
    };
    socket.broadcast.emit('location-updated', users[socket.id]);
  });

  socket.on('disconnect', () => {
    console.log('User keluar:', socket.id);
    delete users[socket.id];
    io.emit('user-left', socket.id);
  });
});

// SPA fallback: kembalikan index.html (hanya dipakai di produksi;
// saat dev, halaman disajikan oleh Vite, bukan server ini).
app.get('*', (_req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
