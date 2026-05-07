import type { RequestHandler } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/shared/domain/errors/DomainError';

type Role = 'admin' | 'agent' | 'customer';

export const requireAuth: RequestHandler = (_req, res, next) => {
  if (!res.locals.session?.user) return next(new UnauthorizedError('Login obrigatorio'));
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.session?.user;
    if (!user) return next(new UnauthorizedError('Login obrigatorio'));
    if (!roles.includes(user.role)) return next(new ForbiddenError('Acesso negado'));
    next();
  };
}
