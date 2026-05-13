export interface ListProductsOutput {
  products: Array<{ id: string; name: string; createdAt: string }>;
}
