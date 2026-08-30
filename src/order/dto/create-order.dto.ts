import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  Equals,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, {
    message: 'Телефон должен быть в формате +7 (XXX) XXX-XX-XX',
  })
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsBoolean()
  @Equals(true, {
    message: 'Необходимо согласие с политикой конфиденциальности',
  })
  policyAccepted!: boolean;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return parsed;
      return parsed.map((item: any) =>
        plainToInstance(CreateOrderItemDto, item),
      );
    } catch {
      return value;
    }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
