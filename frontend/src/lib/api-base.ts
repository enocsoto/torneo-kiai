/**
 * Origen de la API (sin barra final).
 * Acepta URL con `http(s)://` o solo el host (p. ej. en Railway) y añade `https://`.
 */
function normalizeApiBase(env: string | undefined, fallback: string): string {
  const raw = (env ?? fallback).trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) {
    return `http://${raw}`;
  }
  return `https://${raw}`;
}

export function getApiBase(): string {
  return normalizeApiBase(
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:4004"
  );
}
