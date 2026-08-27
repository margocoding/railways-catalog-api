import { Expose, Type } from 'class-transformer';

export class FilterOptionValueRdo {
  @Expose()
  value!: string;

  @Expose()
  label!: string;
}

export class FilterOptionRdo {
  @Expose()
  key!: string;

  @Expose()
  label!: string;

  @Expose()
  type?: 'select' | 'range';

  @Expose()
  @Type(() => FilterOptionValueRdo)
  options?: FilterOptionValueRdo[];
}