import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  parseJsonFormArrayOf,
  parseJsonFormField,
} from 'src/common/json-form-field';

export class CreateProductSpecDto {
  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
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

  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? null : Number(value),
  )
  @IsNumber()
  @Min(0)
  price?: number | null;

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

  @IsOptional()
  @IsString()
  descriptionTags?: string;

  @Transform(({ value }: { value: unknown }) =>
    parseJsonFormArrayOf(CreateProductSpecDto, value),
  )
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecDto)
  specs?: CreateProductSpecDto[];

  @Transform(({ value }: { value: unknown }) => parseJsonFormField(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  analogues?: string[];
}
