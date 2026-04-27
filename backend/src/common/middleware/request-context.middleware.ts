import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

/** Asigna `X-Request-Id`; solo registra requests si se habilita explícitamente. */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId =
    (typeof req.headers['x-request-id'] === 'string' &&
      req.headers['x-request-id'].trim()) ||
    randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const shouldLogRequests = process.env.LOG_HTTP_REQUESTS === 'true';
  const start = shouldLogRequests ? Date.now() : 0;
  res.on('finish', () => {
    if (!shouldLogRequests && res.statusCode < 400) return;
    const payload = {
      level: 'info',
      msg: 'http_request',
      requestId,
      method: req.method,
      path: req.originalUrl ?? req.url,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    };
    if (res.statusCode >= 500) {
      console.error(JSON.stringify({ ...payload, level: 'error' }));
      return;
    }
    console.warn(JSON.stringify({ ...payload, level: 'warn' }));
  });
  next();
}
