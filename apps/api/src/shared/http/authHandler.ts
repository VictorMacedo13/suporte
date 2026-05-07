import type { Request, Response } from 'express';
import { auth } from '@dgcom/auth/server';
import { toNodeHandler } from 'better-auth/node';

/**
 * Adapta o handler do BetterAuth para Express. Monta em /api/auth/*.
 */
export const authHandler = (req: Request, res: Response) => {
  return toNodeHandler(auth)(req, res);
};
