import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const setupAttempts = new Map<string, AttemptRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_SETUP_ATTEMPTS = 5;

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
};

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  // Skip rate limiting in automated test environment to allow test suites to run cleanly
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    next();
    return;
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (now < record.resetAt) {
      if (record.count >= MAX_LOGIN_ATTEMPTS) {
        const remainingMinutes = Math.ceil((record.resetAt - now) / 60000);
        res.status(429).json({
          success: false,
          message: `Too many login attempts from this location. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
        });
        return;
      }
    } else {
      // Window expired, reset
      loginAttempts.delete(ip);
    }
  }

  next();
};

export const recordFailedLoginAttempt = (req: Request): void => {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now >= record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
  }
};

export const resetLoginAttempts = (req: Request): void => {
  const ip = getClientIp(req);
  loginAttempts.delete(ip);
};

export const setupRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    next();
    return;
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const record = setupAttempts.get(ip);

  if (record) {
    if (now < record.resetAt) {
      if (record.count >= MAX_SETUP_ATTEMPTS) {
        const remainingMinutes = Math.ceil((record.resetAt - now) / 60000);
        res.status(429).json({
          success: false,
          message: `Too many initial setup attempts from this location. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
        });
        return;
      }
      record.count += 1;
    } else {
      setupAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    setupAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  next();
};
