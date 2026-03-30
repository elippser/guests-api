import { Request, Response } from "express";
import * as authService from "../services/authService";
import * as guestService from "../services/guestService";
import {
  registerGuestSchema,
  loginGuestSchema,
} from "../validations/guestSchemas";
import { catchAsync } from "../utils/catch/catchAsync";
import type { IGuest } from "../models/Guest";

function toFilteredGuest(guest: IGuest) {
  const obj = guest.toObject ? guest.toObject() : guest;
  const { password, __v, ...rest } = obj as Record<string, unknown> & {
    password?: string;
    __v?: number;
  };
  return rest;
}

function setGuestCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("guest_token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const registerController = catchAsync(
  async (req: Request, res: Response) => {
    const { error, value } = registerGuestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { guest, token } = await authService.registerGuestService(value);
    setGuestCookie(res, token);

    res.status(201).json({
      message: "Registro exitoso",
      guest: toFilteredGuest(guest),
      token,
    });
  }
);

export const loginController = catchAsync(async (req: Request, res: Response) => {
  const { error, value } = loginGuestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { guest, token } = await authService.loginGuestService(
    value.email,
    value.password
  );
  setGuestCookie(res, token);

  res.status(200).json({
    message: "Login exitoso",
    guest: toFilteredGuest(guest),
    token,
  });
});

export const logoutController = catchAsync(
  async (_req: Request, res: Response) => {
    res.clearCookie("guest_token");
    res.status(200).json({ message: "Sesión cerrada" });
  }
);

export const getMeController = catchAsync(async (req: Request, res: Response) => {
  if (!req.guest) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const guest = await guestService.getGuestById(req.guest.guestId);
  res.status(200).json(toFilteredGuest(guest));
});
