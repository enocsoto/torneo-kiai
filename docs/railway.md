# Deploy en Railway

## Cómo tener **API + Web** (no son dos repositorios)

En **GitHub** tenés **un** repo (`torneo-kiai`). Eso es correcto.

En **Railway** tenés que crear **dos servicios** (dos “apps”) que usan **el mismo** repositorio, cada uno con su **carpeta raíz** distinta:

| Servicio en Railway | Qué hace | Root Directory (obligatorio) |
|---------------------|----------|-----------------------------|
| p. ej. `torneo-kiai-api` | NestJS | `backend` |
| p. ej. `torneo-kiai-web` | Next.js | `frontend` |

**Railway no despliega automáticamente dos binarios** desde un monorepo: si solo creás un servicio, suele clonar el repo y el contexto de build queda en **`/`** (sin `package.json` en la raíz) → eso provoca el error de Railpack que ves en los logs.

### Pasos (resumen)

1. En tu **proyecto** de Railway: **+ New** → **GitHub Repo** → elegí `torneo-kiai` (si aún no está conectado, autorizá a Railway).
2. Ese primer servicio: **Settings** (o **Service settings**) → **Root Directory** → escribí **`backend`** → Guardar → **Redeploy** (o esperá un deploy nuevo).  
   - Así se usa `backend/package.json`, `backend/Dockerfile` y `backend/railway.toml`.
3. Otra vez: **+ New** → **GitHub Repo** → **mismo** repo `torneo-kiai` (sí, de nuevo) → ponele un nombre, p. ej. **Web** → en **Root Directory** → **`frontend`** → Guardar.
4. En el servicio **Web**, configurá `NEXT_PUBLIC_API_URL` con la URL pública del servicio de la API (y en la **API**, `FRONTEND_ORIGIN` con la URL del front).

> **Config file:** si usás *Config as code*, en la UI podés fijar la ruta al manifiesto, p. ej. `/backend/railway.toml` o `/frontend/railway.toml`, pero lo más simple es poner **Root Directory** en `backend` o `frontend` y que se lea el `railway.toml` de esa carpeta.

### Qué mirar en el log

Si el build “analiza” solo cosas como `.github/`, `docs/`, `frontend/`, `README.md` (raíz), el servicio **todavía está construyendo desde `/`**. Corregí **Root Directory** y volvé a desplegar.

---

## Si el build falla con Railpack (“could not determine how to build” / `start.sh`)

Eso pasa cuando el despliegue usa la **raíz del repo** como contexto: ahí **no hay** `package.json`, y Railpack no detecta Node/Next y acaba en idiomas soportados limitados (p. ej. “Staticfile” solamente).

**Solución (elige una):**

1. **Recomendado:** en cada servicio, **Settings → Root Directory**:
   - API → `backend`
   - Web → `frontend`  
   Así Railpack ve el `package.json` del paquete, o (mejor) el **`railway.toml`** de esa carpeta que fuerza **Dockerfile**.

2. **Forzar Docker:** en el repo ya hay `backend/railway.toml` y `frontend/railway.toml` con `builder = "DOCKERFILE"`. Con **Root Directory** apuntando a `backend` o `frontend`, Railway construye con el `Dockerfile` de cada app (misma lógica que en `docker-compose.yml`).

3. **Variables (alternativa):** en el servicio, `RAILWAY_DOCKERFILE_PATH=Dockerfile` y root directory correcto, según [docs de Docker en Railway](https://docs.railway.com/guides/dockerfiles).

---

Monorepo sin `package.json` en la raíz: en Railway crea **dos servicios** desde el mismo repo, cada uno con su **Root Directory** (o su `railway.toml` bajo esa ruta, ver arriba).

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

**Opción 1 — Desde tu máquina** (misma `MONGODB_URI` que en Railway, copiada de Variables del servicio API o de MongoDB):

```bash
cd backend
export MONGODB_URI="mongodb+srv://…"   # o la que te dé Railway
npm install   # asegúrate de tener dependencias
npm run seed
```

**Opción 2 — Contenedor de la API en Railway** (la imagen ya trae `dist/`; no hace falta `ts-node`):

En el servicio de la API: **Settings →** abre la shell/terminal (o `railway ssh` / **Run** con la CLI vinculada al proyecto) y ejecuta:

```bash
node dist/seed-once.js
```

`MONGODB_URI` ya debería estar inyectada como en el despliegue. Si hace falta, exporta el valor antes de `node`.

**Opción 3 — Railway CLI en local** (inyecta `MONGODB_URI` del proyecto; primero compila, el comando se ejecuta en **tu** máquina):

```bash
cd backend
npm run build
railway run --service <nombre-servicio-api> node dist/seed-once.js
```

## Scripts del repo (referencia)

- **`openapi:export`**: genera `openapi.json`; usado en CI, no en runtime.  
- **`lint:fix`**: formatea con ESLint; en local, no en el pipeline de build.
