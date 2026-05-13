import { Entity } from '@/shared/domain/Entity';

export interface ProductProps {
  name: string;
  createdAt: Date;
}

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  static create(name: string, id?: string): Product {
    return new Product({ name: name.trim(), createdAt: new Date() }, id);
  }

  static restore(props: ProductProps, id: string): Product {
    return new Product(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
