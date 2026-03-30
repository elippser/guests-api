import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Guest } from "../models/Guest";

const JWT_SECRET = process.env.GUEST_JWT_SECRET || process.env.JWT_SECRET;

interface JwtPayload {
  guestId: string;
  email: string;
}

export async function authenticateGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const token =
    req.cookies?.guest_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Configuración del servidor incorrecta" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const guest = await Guest.findOne({ guestId: decoded.guestId }).select("+password");

    if (!guest) {
      return res.status(403).json({ error: "Token inválido o huésped no encontrado" });
    }

    if (guest.status !== "active") {
      return res.status(403).json({ error: "Cuenta no activa" });
    }

    req.guest = {
      guestId: guest.guestId,
      email: guest.email,
    };

    next();
  } catch {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
}
