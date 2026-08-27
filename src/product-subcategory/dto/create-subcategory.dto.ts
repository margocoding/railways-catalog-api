import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterOptionDto } from 'utils/dto/filter-option.dto';

export class CreateSubcategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  categorySlug!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterOptionDto)
  filters?: FilterOptionDto[];
}