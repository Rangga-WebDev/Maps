/** @format */

// ============================================================
//  server/models/User.ts — Skema akun pengguna
// ============================================================
//  Password TIDAK PERNAH disimpan apa adanya. Kita simpan hash
//  bcrypt, dan membandingkannya saat login.
// ============================================================

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  comparePassword(plain: string): Promise<boolean>;
};

// Method instance: bandingkan password mentah dengan hash tersimpan.
userSchema.methods.comparePassword = function (
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, (this as UserDoc).passwordHash);
};

// Helper statis: buat akun baru sambil hash password.
userSchema.statics.register = async function (
  name: string,
  email: string,
  password: string,
  role: "admin" | "member" = "member",
) {
  const passwordHash = await bcrypt.hash(password, 12);
  return this.create({ name, email, passwordHash, role });
};

interface UserModel extends Model<UserDoc> {
  register(
    name: string,
    email: string,
    password: string,
    role?: "admin" | "member",
  ): Promise<UserDoc>;
}

export const UserModel =
  (mongoose.models.User as UserModel) ||
  mongoose.model<UserDoc, UserModel>("User", userSchema);
