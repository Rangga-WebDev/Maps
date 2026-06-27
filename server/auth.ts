/** @format */

// ============================================================
//  server/auth.ts — Token JWT, middleware, & rute autentikasi
// ============================================================

import { Router, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { AuthResponse, AuthUser, Role } from "../shared/types";
import { UserModel, type UserDoc } from "./models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-ganti-di-produksi";
const TOKEN_TTL = "7d";

export interface TokenPayload {
  sub: string; // user id
  name: string;
  role: Role;
}

// Buat token dari sebuah user.
export function signToken(user: UserDoc): string {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    name: user.name,
    role: user.role as Role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// Verifikasi token (dipakai HTTP middleware & Socket.io).
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

function toAuthUser(user: UserDoc): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };
}

// Middleware HTTP: butuh header "Authorization: Bearer <token>".
export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token tidak ada" });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    (req as { user?: TokenPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token tidak valid" });
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authRouter = Router();

// --- Daftar akun baru ---
authRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Nama minimal 2 karakter" });
    return;
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Email tidak valid" });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password minimal 6 karakter" });
    return;
  }

  const exists = await UserModel.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409).json({ error: "Email sudah terdaftar" });
    return;
  }

  const user = await UserModel.register(name.trim(), email, password);
  const body: AuthResponse = { token: signToken(user), user: toAuthUser(user) };
  res.status(201).json(body);
});

// --- Login ---
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email & password wajib diisi" });
    return;
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ error: "Email atau password salah" });
    return;
  }

  const body: AuthResponse = { token: signToken(user), user: toAuthUser(user) };
  res.json(body);
});

// --- Ambil profil dari token (untuk validasi sesi saat reload) ---
authRouter.get("/me", requireAuth, async (req, res) => {
  const payload = (req as { user?: TokenPayload }).user!;
  const user = await UserModel.findById(payload.sub);
  if (!user) {
    res.status(404).json({ error: "User tidak ditemukan" });
    return;
  }
  res.json({ user: toAuthUser(user) });
});
