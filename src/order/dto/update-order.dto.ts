import { IsOptional, IsString, IsIn } from 'class-validator';
import { ORDER_STATUS_VALUES, type OrderStatusQuery } from './find-orders.dto';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(ORDER_STATUS_VALUES)
  status?: OrderStatusQuery;
  
  @IsOptional()
  @IsString()
  comment?: string;
}