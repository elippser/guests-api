import { Guest } from "../models/Guest";
import type { IGuest } from "../models/Guest";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  document?: { type: "dni" | "passport" | "other"; number: string };
  nationality?: string;
  avatar?: string;
  notes?: string;
  customProperties?: Record<string, unknown>;
}

export async function getGuestById(guestId: string): Promise<IGuest> {
  const guest = await Guest.findOne({ guestId });

  if (!guest) {
    const error = new Error("Huésped no encontrado");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return guest;
}

export async function updateGuestProfile(
  guestId: string,
  payload: UpdateProfilePayload
): Promise<IGuest> {
  const guest = await Guest.findOne({ guestId });

  if (!guest) {
    const error = new Error("Huésped no encontrado");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const allowed = [
    "firstName",
    "lastName",
    "phone",
    "document",
    "nationality",
    "avatar",
    "notes",
    "customProperties",
  ] as const;

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      (guest as unknown as Record<string, unknown>)[key] = payload[key];
    }
  }

  if (payload.nationality) {
    guest.nationality = payload.nationality.toUpperCase();
  }

  await guest.save();

  return guest;
}

export async function changeGuestPassword(
  guestId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const guest = await Guest.findOne({ guestId }).select("+password");

  if (!guest) {
    const error = new Error("Huésped no encontrado");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const isValid = await guest.comparePassword(currentPassword);
  if (!isValid) {
    const error = new Error("Contraseña actual incorrecta");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  guest.password = newPassword;
  await guest.save();
}

export async function deleteGuestAccount(guestId: string): Promise<void> {
  const guest = await Guest.findOne({ guestId });

  if (!guest) {
    const error = new Error("Huésped no encontrado");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  guest.status = "deleted";
  await guest.save({ validateBeforeSave: false });
}
