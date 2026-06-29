/** @format */

// ============================================================
//  server/server.ts - Backend dasar (Express + Socket.io)
// ============================================================
//  - Menyimpan posisi user online di memori server.
//  - Menyajikan hasil "vite build" dari folder dist saat produksi.
// ============================================================

import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  User,
} from "../shared/types";

const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

// Di produksi, file React hasil "vite build" ada di folder dist.
app.use(express.static("dist"));

// Daftar user yang sedang online, diindeks dengan socket.id.
const users: Record<string, User> = {};

io.on("connection", (socket) => {
  console.log("User terhubung:", socket.id);

  socket.emit("existing-users", users);

  socket.on("update-location", (data) => {
    const name = data.name.trim() || "Tanpa nama";
    users[socket.id] = {
      id: socket.id,
      name,
      lat: data.lat,
      lng: data.lng,
    };
    socket.broadcast.emit("location-updated", users[socket.id]);
  });

  socket.on("disconnect", () => {
    console.log("User keluar:", socket.id);
    delete users[socket.id];
    io.emit("user-left", socket.id);
  });
});

// SPA fallback: kembalikan index.html (hanya dipakai di produksi;
// saat dev, halaman disajikan oleh Vite, bukan server ini).
app.get("*", (_req, res) => {
  res.sendFile(path.resolve("dist", "index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
