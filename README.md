# Torneo Kiai — NestJS · MongoDB · Next.js

Monorepo para un combate por turnos de estilo **shōnen de artes marciales** (inspiración temática, sin ser obra derivada presentada como oficial): modelo **atómico** (ataques, evoluciones, guerreros, batallas), API REST con **NestJS**, persistencia en **MongoDB** y selección de personajes + arena en **Next.js**. Ver [`docs/fan-works-y-marcas.md`](docs/fan-works-y-marcas.md) sobre IP y obras de aficionado.

## Requisitos

- Node.js 20+
- Docker (recomendado) o MongoDB instalado
- Puerto **27029** libre en el host (mapeo al 27017 del contenedor)

## Configuración rápida

### 1. MongoDB (Docker, puerto 27029)

En la raíz del repo:

```bash
docker compose up -d
```

La URI por defecto del backend es `mongodb://127.0.0.1:27029/torneo-kiai-tournament`.

Sin Docker, puedes usar tu propio `mongod` y definir `MONGODB_URI` en `backend/.env`.

**Stack completo (Mongo + API + Next)** en la misma raíz:

```bash
docker compose up -d --build
```

- API: `http://localhost:4004` (el front del contenedor usa `NEXT_PUBLIC_API_URL` apuntando al host).
- Web: `http://localhost:3000`

Operación, backups, OpenAPI y carga: [`docs/OPS.md`](docs/OPS.md).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar MONGODB_URI si hace falta
npm install
npm run seed    # Carga ataques, evoluciones y guerreros (idempotente: borra colecciones implicadas)
npm run start:dev
```

API por defecto: `http://localhost:4004` (configurable con `PORT` en `backend/.env`)  
Comprobación: `GET http://localhost:4004/health` · Readiness Mongo: `GET http://localhost:4004/health/ready` · Métricas: `GET http://localhost:4004/health/detailed` · OpenAPI UI: `http://localhost:4004/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4004
npm install
npm run dev
```

Interfaz: `http://localhost:3000`

## Imágenes de personajes

El **seed** del backend puede consultar una [API pública de personajes](https://web.dragonball-api.com/) (`GET https://dragonball-api.com/api/characters`, paginado) y guardar en Mongo el campo `imageUrl` de cada guerrero. Si la petición falla, el front usa **SVG** de respaldo en `frontend/public/characters/`. El uso de nombres o imágenes de terceras obras conlleva consideraciones de IP; ver [`docs/fan-works-y-marcas.md`](docs/fan-works-y-marcas.md).

## API relevante

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/warriors` | Lista de guerreros con ataques y evolución activa |
| POST | `/battles` | Cuerpo: `{ "warriorAId", "warriorBId" }` |
| GET | `/battles/recent?limit=20` | Últimas batallas (Mongo), resumen para historial |
| GET | `/battles/:id` | Estado de la batalla |
| POST | `/battles` | Opcional: `{ "guestId" }` (modo invitado; límite por hora vía `GUEST_MAX_BATTLES_PER_HOUR`) |
| POST | `/battles/:id/action` | Cuerpo: `{ "type": "ATTACK" \| "RECHARGE" \| "DODGE", "attackIndex"?: number }` · **Rate limit**: 48 peticiones / minuto por IP (Nest Throttler) |
| GET | `/rankings/warriors?limit=30` | Victorias por `slug` de guerrero |

### Errores HTTP

Las respuestas de error siguen un cuerpo homogéneo:

`{ "statusCode", "message", "path", "timestamp", "requestId" }` (filtro global Nest). Cada respuesta expone además la cabecera **`x-request-id`**; los logs del servidor son JSON por petición.

## E2E (Playwright)

En una terminal: Mongo + `npm run seed` + `npm run start:dev` en `backend/`.  
En otra: `npm run dev` en `frontend/` (puerto 3000).

```bash
cd frontend
npx playwright install chromium   # primera vez
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

El spec recorre el roster (goku vs vegeta), enfría acciones hasta ver el fin de combate.

## Deploy (Railway)

**Un repo en GitHub, dos servicios en Railway** (mismo repo, distintas carpetas): API con **Root directory = `backend`**, web con **Root directory = `frontend`**. Si solo hay un servicio y la raíz es `/`, el build falla (no hay `package.json` en la raíz). Detalle: [`docs/railway.md`](docs/railway.md).

## Estructura

- `backend/` — NestJS, Mongoose, validación con `class-validator`, CORS hacia el front.
- `frontend/` — Next.js (App Router), Tailwind, `next/image` para dominios remotos configurados.

## Notas pedagógicas

Las clases del dominio se reflejan en **esquemas Mongoose** y en **DTOs** para entrar al hexágono HTTP; el estado de combate es un documento `Battle` con *snapshots* de guerrero para no mutar la ficha original en MongoDB durante el torneo.
