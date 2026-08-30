import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

export class CreateProductSpecDto {
  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    return !isNaN(num) && String(value).trim() !== '' ? num : value;
  })
  value!: number | string;
}

export class CreateProductDto {
  @IsString()
  sku!: string;

  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  gost?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsIn(['new', 'used', 'service'])
  condition!: 'new' | 'used' | 'service';

  @IsString()
  categorySlug!: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return parsed;
      return parsed.map((item: any) => plainToInstance(CreateProductSpecDto, item));
    } catch {
      return value;
    }
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecDto)
  specs?: CreateProductSpecDto[];

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  analogues?: string[];
}