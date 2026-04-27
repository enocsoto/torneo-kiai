# Operaciones — monorepo Torneo Kiai

## Variables de entorno (backend)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP (default `4004`) |
| `MONGODB_URI` | URI MongoDB |
| `FRONTEND_ORIGIN` | Origen CORS del front |
| `GUEST_MAX_BATTLES_PER_HOUR` | Máx. batallas nuevas por hora e id. de invitado (`guestId`) |
| `OPENAPI_EXPORT_PATH` | Si está definido, genera el JSON y termina (sin escuchar puerto) |

## Health

- `GET /health` — liveness (sin Mongo).
- `GET /health/ready` — readiness (ping Mongo).
- `GET /health/detailed` — uptime + métricas de `POST .../action` (latencias muestreadas y contadores 4xx/5xx).

## Observabilidad

- Cabecera **`x-request-id`** en respuesta (o se genera una).
- Logs en **JSON** por petición: `requestId`, `method`, `path`, `statusCode`, `durationMs`.
- Errores incluyen **`requestId`** en el cuerpo JSON.

## Backup de Mongo (Docker)

Volumen `torneo_kiai_mongo_data` en Compose:

```bash
docker exec torneo-kiai-mongo mongodump --out=/tmp/dump
docker cp torneo-kiai-mongo:/tmp/dump ./mongo-backup-$(date +%Y%m%d)
```

Restauración (ejemplo):

```bash
docker cp ./mongo-backup-YYYYMMDD torneo-kiai-mongo:/tmp/dump
docker exec torneo-kiai-mongo mongorestore /tmp/dump
```

## Migraciones de esquema

Hoy los modelos son **Mongoose** sin migraciones versionadas. Estrategia recomendada al crecer:

1. Añadir campos opcionales primero; desplegar código que los rellene.
2. Introducir herramienta tipo **migrate-mongo** o jobs idempotentes en CI.
3. Documentar cada cambio en `docs/MIGRATIONS.md` (fecha, colección, script).

## Contrato OpenAPI

```bash
cd backend && npm run openapi:export
```

Salida: `backend/openapi.json` (UI en `/docs` con el API en marcha).
