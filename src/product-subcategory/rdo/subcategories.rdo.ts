import { Expose, Type } from 'class-transformer';
import { SubcategoryRdo } from './subcategory.rdo';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';

export class SubcategoriesRdo {
  @Expose()
  @Type(() => SubcategoryRdo)
  items!: SubcategoryRdo[];

  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}