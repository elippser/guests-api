# pms-auth-guests — Plan de Implementación Backend
> Express · MongoDB · JWT propio · Referencia: pms-auth-guests.md

---

## Estado inicial

- backend/src/ vacío
- package.json, tsconfig.json y node_modules listos
- .env requiere: PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV

---

## Variables de entorno

env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=           # SECRET PROPIO — nunca el mismo que pms-core
JWT_EXPIRES_IN=7d
NODE_ENV=development


---

## Flujo de datos


Cliente
  └── POST /auth/register | /auth/login
        └── authRouter
              └── authController
                    └── authService
                          └── Guest (modelo)
                          └── JWT → cookie guest_token

Cliente autenticado
  └── GET /auth/me | PATCH /guest/profile
        └── authenticateGuest (middleware)
              └── controller → service → Guest


---

## Archivos a crear en orden

### 1. Infraestructura base

*src/index.ts*
Entry point. Conecta DB y levanta servidor.

*src/server.ts*
Express app. CORS, middlewares globales, monta routers bajo /api/v1.

typescript
// Rutas montadas:
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/guest", authenticateGuest, guestRouter);


*src/config/dbCon.ts*
Conexión Mongoose usando MONGODB_URI.

*src/utils/catchAsync.ts*
Wrapper para async handlers — mismo patrón que pms-core.

*src/utils/logger.ts*
Winston — combined.log + error.log.

*src/types/express.d.ts*
Extiende Request con req.guest:
typescript
declare namespace Express {
  interface Request {
    guest?: {
      guestId: string;
      email: string;
    };
  }
}


---

### 2. Modelo

*src/models/Guest.ts*

Campos obligatorios:
- guestId: string — "guest-{uuid}", único
- firstName: string — requerido, trim
- lastName: string — requerido, trim
- email: string — requerido, único, lowercase
- password: string — requerido, bcrypt hash
- phone: string — requerido
- document: { type: "dni"|"passport"|"other", number: string } — requerido
- nationality: string — ISO 3166-1 alpha-2, uppercase (ej: "AR", "ES")

Campos opcionales:
- avatar?: string — URL
- notes?: string — maxlength 1000
- customProperties?: Schema.Types.Mixed — default {}

Estado:
- status: "active"|"suspended"|"deleted" — default "active"
- emailVerified: boolean — default false
- lastLoginAt?: Date

Timestamps: { timestamps: true }

Hooks pre-save:
- Si password fue modificado → hashear con bcrypt (10 rounds)

Método de instancia:
- comparePassword(candidate: string): Promise<boolean>

Índices:
- guestId unique
- email unique
- document.number

---

### 3. Validaciones

*src/validations/guestSchemas.ts*

*registerGuestSchema:*
typescript
{
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8).max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({ "string.pattern.base": "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial" }),
  phone: Joi.string().min(7).max(20).required(),
  document: Joi.object({
    type: Joi.string().valid("dni", "passport", "other").required(),
    number: Joi.string().min(5).max(20).required()
  }).required(),
  nationality: Joi.string().length(2).uppercase().required()
}


*loginGuestSchema:*
typescript
{
  email: Joi.string().email().required(),
  password: Joi.string().required()
}


*updateProfileSchema:*
typescript
{
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().min(7).max(20).optional(),
  document: Joi.object({
    type: Joi.string().valid("dni", "passport", "other"),
    number: Joi.string().min(5).max(20)
  }).optional(),
  nationality: Joi.string().length(2).uppercase().optional(),
  avatar: Joi.string().uri().optional(),
  notes: Joi.string().max(1000).optional(),
  customProperties: Joi.object().unknown(true).optional()
}


*changePasswordSchema:*
typescript
{
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8).max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
}


---

### 4. Middleware

*src/middleware/authenticateGuest.ts*

- Lee JWT de cookie guest_token O header Authorization: Bearer
- Verifica con process.env.JWT_SECRET (el propio de este servicio)
- Busca el guest en DB por guestId del payload
- Verifica guest.status === "active"
- Puebla req.guest = { guestId, email }
- 401 si no hay token
- 403 si token inválido o guest no existe
- 403 si status !== "active"

*IMPORTANTE:* Este middleware usa el JWT_SECRET propio de este servicio, nunca el del pms-core.

---

### 5. Services

*src/services/authService.ts*

typescript
registerGuestService(payload): Promise<{ guest: IGuest, token: string }>
  1. Verificar email único → 400 si ya existe
  2. Generar guestId = "guest-" + crypto.randomUUID()
  3. Crear Guest (password se hashea en pre-save)
  4. Generar JWT: { guestId, email }, expira en JWT_EXPIRES_IN
  5. Retornar { guest, token }

loginGuestService(email, password): Promise<{ guest: IGuest, token: string }>
  1. Buscar guest por email → 401 si no existe
  2. Verificar status === "active" → 403 si no
  3. guest.comparePassword(password) → 401 si falla
  4. Actualizar lastLoginAt
  5. Generar JWT
  6. Retornar { guest, token }


*src/services/guestService.ts*

typescript
getGuestById(guestId): Promise<IGuest>
  → 404 si no existe

updateGuestProfile(guestId, payload): Promise<IGuest>
  → Actualizar solo campos permitidos
  → No permite cambiar email, password, status, guestId

changeGuestPassword(guestId, currentPassword, newPassword): Promise<void>
  → Verificar currentPassword con comparePassword → 401 si falla
  → Setear nueva password (pre-save la hashea)

deleteGuestAccount(guestId): Promise<void>
  → Soft delete: status = "deleted"


---

### 6. Controllers

*src/controllers/authController.ts*

typescript
registerController    → POST /auth/register
  - Valida con registerGuestSchema
  - Llama registerGuestService
  - Setea cookie guest_token: httpOnly, secure (prod), sameSite: "lax"
  - 201 { message, guest: filteredGuest, token }

loginController       → POST /auth/login
  - Valida con loginGuestSchema
  - Llama loginGuestService
  - Setea cookie guest_token
  - 200 { message, guest: filteredGuest, token }

logoutController      → POST /auth/logout
  - Limpia cookie guest_token
  - 200 { message: "Sesión cerrada" }

getMeController       → GET /auth/me
  - req.guest.guestId disponible (viene de authenticateGuest)
  - Llama getGuestById
  - 200 con guest filtrado (sin password)


*Campos filtrados en respuesta (nunca enviar):* password, __v

*src/controllers/guestController.ts*

typescript
updateProfileController   → PATCH /guest/profile
changePasswordController  → PATCH /guest/password
deleteAccountController   → DELETE /guest/account


---

### 7. Routers

*src/routes/authRouter.ts*

typescript
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", authenticateGuest, logoutController);
router.get("/me", authenticateGuest, getMeController);


*src/routes/guestRouter.ts*

Todas las rutas requieren authenticateGuest (montado en server.ts):

typescript
router.patch("/profile", updateProfileController);
router.patch("/password", changePasswordController);
router.delete("/account", deleteAccountController);


---

## Endpoints resultantes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | no | Registro de huésped |
| POST | /api/v1/auth/login | no | Login |
| POST | /api/v1/auth/logout | JWT | Logout |
| GET | /api/v1/auth/me | JWT | Perfil autenticado |
| PATCH | /api/v1/guest/profile | JWT | Actualizar perfil |
| PATCH | /api/v1/guest/password | JWT | Cambiar contraseña |
| DELETE | /api/v1/guest/account | JWT | Eliminar cuenta |

---

## Notas clave

- guestId generado con crypto.randomUUID() — sin dependencias externas
- Cookie: guest_token, httpOnly, secure en producción, sameSite "lax"
- El JWT payload solo contiene { guestId, email } — mínimo necesario
- Soft delete: status = "deleted", nunca se elimina el documento
- Este servicio no conoce ni referencia a companies, properties ni spaces — es completamente independiente
- pms-app-reservas validará el token de huésped llamando a GET /api/v1/auth/me de este servicio

---

## Orden de implementación


1.  src/index.ts
2.  src/config/dbCon.ts
3.  src/utils/catchAsync.ts + logger.ts
4.  src/types/express.d.ts
5.  src/models/Guest.ts
6.  src/validations/guestSchemas.ts
7.  src/middleware/authenticateGuest.ts
8.  src/services/authService.ts
9.  src/services/guestService.ts
10. src/controllers/authController.ts
11. src/controllers/guestController.ts
12. src/routes/authRouter.ts
13. src/routes/guestRouter.ts
14. src/server.ts