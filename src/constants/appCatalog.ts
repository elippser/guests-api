export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  GUEST: "guest",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Credenciales inválidas",
  USER_ALREADY_EXISTS: "El usuario ya existe con ese email",
  USER_NOT_FOUND: "Usuario no encontrado",
  GUEST_NOT_FOUND: "Huésped no encontrado",
  INVALID_VERIFICATION_CODE: "Código de verificación inválido o expirado",
  UNAUTHORIZED: "No autorizado",
  FORBIDDEN: "Acceso denegado",
} as const;

export const VERIFICATION_CODE_EXPIRY_HOURS = 24;
