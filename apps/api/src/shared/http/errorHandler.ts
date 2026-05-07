import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '@/shared/domain/errors/DomainError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({ code: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      issues: err.issues,
    });
    return;
  }

  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno' });
};
