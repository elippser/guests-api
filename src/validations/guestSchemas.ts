import Joi from "joi";

const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .required()
  .messages({
    "string.pattern.base":
      "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial",
  });

const documentSchema = Joi.object({
  type: Joi.string().valid("dni", "passport", "other").required(),
  number: Joi.string().min(5).max(20).required(),
});

export const registerGuestSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  phone: Joi.string().min(7).max(20).required(),
  document: documentSchema.required(),
  nationality: Joi.string().length(2).uppercase().required(),
});

export const loginGuestSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().min(7).max(20).optional(),
  document: Joi.object({
    type: Joi.string().valid("dni", "passport", "other"),
    number: Joi.string().min(5).max(20),
  }).optional(),
  nationality: Joi.string().length(2).uppercase().optional(),
  avatar: Joi.string().uri().optional(),
  notes: Joi.string().max(1000).optional(),
  customProperties: Joi.object().unknown(true).optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
});
