import { Expose, Type } from 'class-transformer';
import { SubcategoryRdo } from 'src/product-subcategory/rdo/subcategory.rdo';
import { FilterOptionRdo } from 'utils/rdo/filter-option.rdo';

export class CategoryRdo {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  description!: string;

  @Expose()
  image!: string;

  @Expose()
  @Type(() => FilterOptionRdo)
  filters?: FilterOptionRdo[];

  @Expose()
  @Type(() => SubcategoryRdo)
  subcategories?: SubcategoryRdo[];
}