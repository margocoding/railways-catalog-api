// src/product/dto/create-product.dto.ts
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
import { Type } from 'class-transformer';

export class CreateProductSpecDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  value!: number | string;
}

export class CreateProductDto {
  @IsString()
  sku!: string;

  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  gost!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsBoolean()
  priceOnRequest?: boolean;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsIn(['new', 'used', 'service'])
  condition!: 'new' | 'used' | 'service';

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsString()
  categorySlug!: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecDto)
  specs?: CreateProductSpecDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  analogues?: string[];
}