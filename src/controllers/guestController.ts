import { Request, Response } from "express";
import * as guestService from "../services/guestService";
import {
  updateProfileSchema,
  changePasswordSchema,
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

export const updateProfileController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.guest) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const guest = await guestService.updateGuestProfile(
      req.guest.guestId,
      value
    );
    res.status(200).json(toFilteredGuest(guest));
  }
);

export const changePasswordController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.guest) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await guestService.changeGuestPassword(
      req.guest.guestId,
      value.currentPassword,
      value.newPassword
    );
    res.status(200).json({ message: "Contraseña actualizada" });
  }
);

export const deleteAccountController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.guest) {
      return res.status(401).json({ error: "No autorizado" });
    }

    await guestService.deleteGuestAccount(req.guest.guestId);
    res.clearCookie("guest_token");
    res.status(200).json({ message: "Cuenta eliminada" });
  }
);
