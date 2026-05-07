import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { sseHub } from '@/shared/infrastructure/sse/SSEHub';

export const sseRoutes = Router();

sseRoutes.get('/tickets/:code', requireAuth, (req, res) => {
  const code = String(req.params.code ?? '');
  if (!code) return res.status(400).end();
  sseHub.subscribe(`ticket:${code}`, res);
});
