import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitize objects by removing keys starting with '$' or containing '.'
 * to prevent NoSQL query injection attacks.
 */
function cleanNoSqlKeys(target: any): any {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(cleanNoSqlKeys);
  }

  // Preserve Date, Buffer, ObjectId or non-plain instances
  if (target instanceof Date || target instanceof RegExp) {
    return target;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue; // Strip prohibited injection operators
    }
    sanitized[key] = cleanNoSqlKeys(value);
  }

  return sanitized;
}

export function sanitizeNoSql(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSqlKeys(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSqlKeys(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSqlKeys(req.params);
  }
  next();
}
