import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { parseJsonFormField } from 'src/common/json-form-field';

export class CreateServiceDto {
  @IsString()
  slug!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @Transform(({ value }: { value: unknown }) => parseJsonFormField(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
