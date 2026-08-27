import { Expose, Type } from 'class-transformer';
import { ProductSpecRdo } from './product-spec.rdo';

export class ProductRdo {
  @Expose()
  id!: string;

  @Expose()
  sku!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  gost!: string;

  @Expose()
  price!: number;

  @Expose()
  priceOnRequest?: boolean;

  @Expose()
  stock!: number;

  @Expose()
  condition!: 'new' | 'used' | 'service';

  @Expose()
  images!: string[];

  @Expose()
  categorySlug!: string;

  @Expose()
  subcategorySlug?: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => ProductSpecRdo)
  specs?: ProductSpecRdo[];

  @Expose()
  analogues?: string[];
}