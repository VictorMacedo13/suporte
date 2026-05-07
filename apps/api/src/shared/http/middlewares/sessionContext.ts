import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '@dgcom/auth/server';

/**
 * Anexa res.locals.session em toda request. Nunca bloqueia — apenas popula
 * quando ha sessao valida.
 */
export const sessionContext: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    res.locals.session = session;
  } catch {
    res.locals.session = null;
  }
  next();
};
