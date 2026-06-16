import { NextFunction, Request, Response } from 'express';
import { httpRequestDurationSeconds, httpRequestsTotal } from './registry';

function normalizeRoute(req: Request): string {
  if (req.route?.path) {
    const base = req.baseUrl || '';
    return `${base}${req.route.path}`;
  }

  return req.path.replace(/\/\d+/g, '/:id');
}

export function httpMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationSeconds = Number(durationNs) / 1_000_000_000;
    const route = normalizeRoute(req);
    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
}
