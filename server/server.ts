/** @format */

// ============================================================
//  server/server.ts — Backend (Express + Socket.io + MongoDB)
// ============================================================
//  - Menyediakan API autentikasi (/api/auth/*)
//  - Socket.io diamankan: hanya user dengan token valid yang
//    bisa terhubung & berbagi lokasi.
//  - Di produksi, menyajikan hasil "vite build" (folder dist).
// ============================================================

import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  User,
} from "../shared/types";
import { connectDB } from "./db.js";
import { authRouter, verifyToken, type TokenPayload } from "./auth.js";

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/livemap";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

app.use(express.json());
app.use("/api/auth", authRouter);

// Di produksi, file React hasil "vite build" ada di folder dist.
app.use(express.static("dist"));

// Daftar user yang sedang online, diindeks dengan socket.id.
const users: Record<string, User> = {};

// --- Gerbang autentikasi Socket.io ---
// Token dikirim client lewat handshake: io({ auth: { token } }).
io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) {
    next(new Error("Token tidak ada"));
    return;
  }
  try {
    const payload = verifyToken(token);
    (socket.data as { user: TokenPayload }).user = payload;
    next();
  } catch {
    next(new Error("Token tidak valid"));
  }
});

io.on("connection", (socket) => {
  const auth = (socket.data as { user: TokenPayload }).user;
  console.log("User terhubung:", auth.name, `(${socket.id})`);

  socket.emit("existing-users", users);

  // Identitas (nama, role, userId) diambil dari token — bukan dari client.
  socket.on("update-location", (data) => {
    users[socket.id] = {
      id: socket.id,
      userId: auth.sub,
      name: auth.name,
      role: auth.role,
      lat: data.lat,
      lng: data.lng,
    };
    socket.broadcast.emit("location-updated", users[socket.id]);
  });

  socket.on("disconnect", () => {
    console.log("User keluar:", auth.name, `(${socket.id})`);
    delete users[socket.id];
    io.emit("user-left", socket.id);
  });
});

// SPA fallback: kembalikan index.html (hanya dipakai di produksi;
// saat dev, halaman disajikan oleh Vite, bukan server ini).
app.get("*", (_req, res) => {
  res.sendFile(path.resolve("dist", "index.html"));
});

// Nyalakan server hanya setelah DB terhubung.
connectDB(MONGO_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server jalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Gagal terhubung ke MongoDB:", err.message);
    process.exit(1);
  });
