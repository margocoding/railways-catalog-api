import { Expose, Type } from 'class-transformer';
import { CategoryRdo } from './category.rdo';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';

export class CategoriesRdo {
  @Expose()
  @Type(() => CategoryRdo)
  items!: CategoryRdo[];

  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}