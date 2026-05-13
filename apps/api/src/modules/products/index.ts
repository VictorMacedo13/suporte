import { getDb } from '@dgcom/db';
import { CreateProduct } from './application/use-cases/CreateProduct/CreateProduct';
import { ListProducts } from './application/use-cases/ListProducts/ListProducts';
import { DeleteProduct } from './application/use-cases/DeleteProduct/DeleteProduct';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { CreateProductController } from './infrastructure/http/controllers/CreateProductController';
import { ListProductsController } from './infrastructure/http/controllers/ListProductsController';
import { DeleteProductController } from './infrastructure/http/controllers/DeleteProductController';
import { buildProductRouter } from './infrastructure/http/routes';

export function buildProductsModule() {
  const repo = new DrizzleProductRepository(getDb());

  const routes = buildProductRouter({
    create: new CreateProductController(new CreateProduct(repo)),
    list: new ListProductsController(new ListProducts(repo)),
    delete: new DeleteProductController(new DeleteProduct(repo)),
  });

  return { routes, repo };
}
