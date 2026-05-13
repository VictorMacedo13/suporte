import { Router } from 'express';
import { requireAuth, requireRole } from '@/shared/http/middlewares/requireAuth';
import type { CreateProductController } from './controllers/CreateProductController';
import type { ListProductsController } from './controllers/ListProductsController';
import type { DeleteProductController } from './controllers/DeleteProductController';

export interface ProductRouteControllers {
  create: CreateProductController;
  list: ListProductsController;
  delete: DeleteProductController;
}

export function buildProductRouter(c: ProductRouteControllers): Router {
  const router = Router();

  // Publico: listar produtos (necessario para o formulario de novo ticket).
  router.get('/', c.list.handle);

  // Apenas admins podem criar/excluir produtos.
  router.post('/', requireAuth, requireRole('admin'), c.create.handle);
  router.delete('/:id', requireAuth, requireRole('admin'), c.delete.handle);

  return router;
}
