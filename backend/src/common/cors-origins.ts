/**
 * Misma lista para HTTP (enableCors) y Socket.IO: local dev usa localhost o 127.0.0.1; CI/Playwright suelen fijar 127.0.0.1.
 */
export function getFrontendCorsOrigins(): string[] {
  const s = new Set<string>(['http://localhost:3000', 'http://127.0.0.1:3000']);
  const e = process.env.FRONTEND_ORIGIN?.trim();
  if (e) s.add(e);
  return [...s];
}
