import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { parseJsonFormField } from 'src/common/json-form-field';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Omitted: keep current images. Empty array: explicitly remove all current images.
  @Transform(({ value }: { value: unknown }) => parseJsonFormField(value))
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  retainedImages?: string[];
}
