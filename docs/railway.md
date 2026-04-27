# Deploy en Railway

Monorepo sin `package.json` en la raíz: en Railway crea **dos servicios** desde el mismo repo, cada uno con su **Root Directory**.

## Servicios recomendados

| Servicio | Root Directory | Rol |
|----------|----------------|-----|
| API | `backend` | NestJS |
| Web | `frontend` | Next.js (output `standalone` en Docker; Nixpacks también usa el build de Next) |
| Mongo | Plugin **MongoDB** de Railway, o **MongoDB Atlas** externo | Base de datos |

## Variables de entorno

### API (`backend`)

| Variable | Obligatorio | Notas |
|----------|-------------|--------|
| `MONGODB_URI` | Sí | URI del cluster (p. ej. del plugin Railway o Atlas). |
| `PORT` | No | Railway lo inyecta; el código usa `process.env.PORT`. |
| `FRONTEND_ORIGIN` | Sí en prod | Origen CORS, URL pública del front con `https://` (puede incluir varios orígenes vía lógica en `main.ts` si hace falta). |
| `NODE_ENV` | Recomendado | `production` |

Opcionales: `GUEST_MAX_BATTLES_PER_HOUR`, `CONTACT_*`, etc. (ver `backend/.env.example` y `docs/OPS.md`).

### Web (`frontend`)

`NEXT_PUBLIC_*` se **inlinan en el build**. Hay que fijarlas en el **build** (custom build command o variables de entorno disponibles al ejecutar `npm run build`):

| Variable | Ejemplo | Notas |
|----------|---------|--------|
| `NEXT_PUBLIC_API_URL` | `https://tu-api.up.railway.app` | URL pública de la API, **sin** barra final. |
| `PORT` | `3000` | El runtime de Next suele respetarlo; Railway puede inyectar otro. |

## Comandos (Nixpacks / Node)

**API — Build:** `npm ci && npm run build`  
**API — Start:** `npm start` (ejecuta `node dist/main.js`).

**Web — Build:** `npm ci && npm run build`  
**Web — Start:** `npm start` (Next en modo producción).

Si usas **Dockerfile** en lugar de Nixpacks, los mismos directorios: contexto `backend` o `frontend` según el servicio.

## Health check (API)

- **Liveness:** `GET /health` (no requiere Mongo).  
- Configura el health check de Railway a `/health` o `/health/ready` según el tipo de comprobación que quieras.

## Primera puesta en marcha (datos)

Una vez la API tenga `MONGODB_URI` correcto, ejecuta **una vez** el seed (guerreros, ataques, etc.):

```bash
# con Railway CLI, o localmente apuntando a la URI de prod:
cd backend && MONGODB_URI="…" npx ts-node -r tsconfig-paths/register src/seed-once.ts
```

## Scripts del repo (referencia)

- **`openapi:export`**: genera `openapi.json`; usado en CI, no en runtime.  
- **`lint:fix`**: formatea con ESLint; en local, no en el pipeline de build.
