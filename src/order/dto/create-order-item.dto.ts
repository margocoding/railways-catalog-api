import { IsInt, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;
  
  @IsInt()
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity!: number;
}