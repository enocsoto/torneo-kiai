# syntax=docker/dockerfile:1
# Next.js output: "standalone" ya trae node_modules mínimo + server.js; no hace falta
# un segundo "npm ci" en el stage final (ahorra ~1 min por build en CI/Railway).
FROM node:20-alpine AS deps
WORKDIR /app
# .npmrc define legacy-peer-deps (react-joyride vs React 19); debe existir antes de npm ci
COPY package*.json .npmrc ./
RUN npm ci

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL=http://api:4004
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Orden alineado con el ejemplo oficial de Next (with-docker)
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
