import { Expose } from 'class-transformer';

export class ProductSpecRdo {
  @Expose()
  id!: string;

  @Expose()
  label!: string;

  @Expose()
  unit?: string;

  @Expose()
  value!: number | string;
}