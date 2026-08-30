import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from 'utils/dto/pagination.dto';

export const ORDER_SORT_VALUES = ['newest', 'oldest'] as const;
export type OrderSort = (typeof ORDER_SORT_VALUES)[number];

export const ORDER_STATUS_VALUES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OrderStatusQuery = (typeof ORDER_STATUS_VALUES)[number];

export class FindOrdersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
  
  @IsOptional()
  @IsIn(ORDER_STATUS_VALUES)
  status?: OrderStatusQuery;
  
  @IsOptional()
  @IsIn(ORDER_SORT_VALUES)
  sort?: OrderSort;
}