// src/product/rdo/products.rdo.ts
import { Expose, Type } from 'class-transformer';
import { ProductRdo } from './product.rdo';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';

export class ProductsRdo {
  @Expose()
  @Type(() => ProductRdo)
  items!: ProductRdo[];

  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}