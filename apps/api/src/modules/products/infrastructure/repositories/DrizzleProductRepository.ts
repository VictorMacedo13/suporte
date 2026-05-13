import { eq, asc } from 'drizzle-orm';
import { schema, type DB } from '@dgcom/db';
import { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';

const { products } = schema;

export class DrizzleProductRepository implements IProductRepository {
  constructor(private readonly db: DB) {}

  async create(name: string): Promise<Product> {
    const [row] = await this.db.insert(products).values({ name: name.trim() }).returning();
    if (!row) throw new Error('Falha ao criar produto');
    return Product.restore({ name: row.name, createdAt: row.createdAt }, row.id);
  }

  async findByName(name: string): Promise<Product | null> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.name, name.trim()),
    });
    if (!row) return null;
    return Product.restore({ name: row.name, createdAt: row.createdAt }, row.id);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!row) return null;
    return Product.restore({ name: row.name, createdAt: row.createdAt }, row.id);
  }

  async list(): Promise<Product[]> {
    const rows = await this.db.query.products.findMany({
      orderBy: [asc(products.name)],
    });
    return rows.map((r) => Product.restore({ name: r.name, createdAt: r.createdAt }, r.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }
}
