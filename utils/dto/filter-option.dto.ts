import { IsString, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterOptionValueDto {
  @IsString()
  value!: string;

  @IsString()
  label!: string;
}

export class FilterOptionDto {
  @IsString()
  key!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsIn(['select', 'range'])
  type?: 'select' | 'range';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterOptionValueDto)
  options?: FilterOptionValueDto[];
}