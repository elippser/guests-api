# PMS Auth Guests - API

API de gestión de huéspedes para reservas. Backend basado en Node.js, Express, TypeScript y MongoDB.

## Requisitos

- Node.js 18+
- MongoDB
- Cuenta SMTP para envío de correos (opcional en desarrollo)

## Instalación

```bash
cd api
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env`:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_MDB` | URI de conexión MongoDB |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `PORT` | Puerto del servidor (default: 3000) |
| `SMTP_HOST` | Host SMTP (ej: smtp.gmail.com) |
| `SMTP_PORT` | Puerto SMTP (587 o 465) |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña o app password |
| `EMAIL_FROM` | Email remitente |

## Ejecución

### Desarrollo (hot-reload)

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Tests

```bash
npm test
npm run test:watch    # Modo watch
npm run test:coverage # Con cobertura
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/user/register` | Registro de usuario |
| POST | `/user/login` | Login |
| POST | `/user/verify-email` | Verificación de email |
| GET | `/user/me` | Usuario actual (requiere JWT) |
| GET | `/api/v1/guests` | Listar huéspedes (admin/staff) |
| GET | `/api/v1/guests/:id` | Obtener huésped |
| POST | `/api/v1/guests` | Crear huésped |
| PATCH | `/api/v1/guests/:id` | Actualizar huésped |
| DELETE | `/api/v1/guests/:id` | Eliminar huésped |

## Estructura del proyecto

```
api/
├── src/
│   ├── config/       # Conexión DB
│   ├── constants/    # Constantes
│   ├── controllers/  # Controladores
│   ├── middleware/   # Auth, roles
│   ├── models/       # Mongoose models
│   ├── routes/       # Rutas
│   ├── services/     # Lógica de negocio
│   ├── utils/        # Logger, helpers
│   ├── validations/  # Schemas Joi
│   ├── ws/           # Socket.io (stub)
│   ├── index.ts      # Entrada
│   └── server.ts     # Express
├── __tests__/
└── ...
```
