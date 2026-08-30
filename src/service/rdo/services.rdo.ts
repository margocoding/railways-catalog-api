import { Expose, Type } from 'class-transformer';
import { ServiceRdo } from './service.rdo';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';

export class ServicesRdo {
  @Expose()
  @Type(() => ServiceRdo)
  items!: ServiceRdo[];
  
  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}
