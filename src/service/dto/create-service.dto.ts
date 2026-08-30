import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray } from 'class-validator';

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
  features?: string[];
}
