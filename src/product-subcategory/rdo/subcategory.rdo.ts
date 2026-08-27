import { Expose, Type } from 'class-transformer';
import { FilterOptionRdo } from 'utils/rdo/filter-option.rdo';

export class SubcategoryRdo {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  categoryId!: string;

  @Expose()
  categorySlug!: string;

  @Expose()
  @Type(() => FilterOptionRdo)
  filters?: FilterOptionRdo[];
}