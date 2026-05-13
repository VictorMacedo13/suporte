export class ProductAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Produto "${name}" ja existe`);
    this.name = 'ProductAlreadyExistsError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(msg?: string) {
    super(msg ?? 'Produto nao encontrado');
    this.name = 'ProductNotFoundError';
  }
}
