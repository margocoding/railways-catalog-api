import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from 'utils/dto/pagination.dto';

export const PRODUCT_SORT_VALUES = [
  'name',
  'price-asc',
  'price-desc',
  'popular',
  'newest',
] as const;

export const PRODUCT_CONDITION_VALUES = ['new', 'used', 'service'] as const;

export const PRODUCT_STOCK_VALUES = ['all', 'in-stock', 'on-order'] as const;

export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];
export type ProductConditionQuery = (typeof PRODUCT_CONDITION_VALUES)[number];
export type ProductStockFilter = (typeof PRODUCT_STOCK_VALUES)[number];

export class FindProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(PRODUCT_SORT_VALUES)
  sort?: ProductSort;

  @IsOptional()
  @IsIn(PRODUCT_CONDITION_VALUES)
  condition?: ProductConditionQuery;

  @IsOptional()
  @IsIn(PRODUCT_STOCK_VALUES)
  stock?: ProductStockFilter;
}