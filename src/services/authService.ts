import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Guest } from "../models/Guest";
import type { IGuest } from "../models/Guest";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document: { type: "dni" | "passport" | "other"; number: string };
  nationality: string;
}

function generateToken(guestId: string, email: string): string {
  const secret = process.env.GUEST_JWT_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("GUEST_JWT_SECRET (or JWT_SECRET) is not defined");
  }

  return jwt.sign(
    { guestId, email },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
  );
}

export async function registerGuestService(
  payload: RegisterPayload
): Promise<{ guest: IGuest; token: string }> {
  const existing = await Guest.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    const error = new Error("El email ya está registrado");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const guestId = `guest-${crypto.randomUUID()}`;

  const guest = await Guest.create({
    guestId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email.toLowerCase(),
    password: payload.password,
    phone: payload.phone,
    document: payload.document,
    nationality: payload.nationality.toUpperCase(),
  });

  const token = generateToken(guest.guestId, guest.email);

  return { guest, token };
}

export async function loginGuestService(
  email: string,
  password: string
): Promise<{ guest: IGuest; token: string }> {
  const guest = await Guest.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!guest) {
    const error = new Error("Credenciales inválidas");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  if (guest.status !== "active") {
    const error = new Error("Cuenta no activa");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  const isValid = await guest.comparePassword(password);
  if (!isValid) {
    const error = new Error("Credenciales inválidas");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  guest.lastLoginAt = new Date();
  await guest.save({ validateBeforeSave: false });

  const token = generateToken(guest.guestId, guest.email);

  return { guest, token };
}
