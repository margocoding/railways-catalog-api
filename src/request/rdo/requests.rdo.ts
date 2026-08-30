import { Expose, Type } from 'class-transformer';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';
import { RequestRdo } from './request.rdo';

export class RequestsRdo {
  @Expose()
  @Type(() => RequestRdo)
  items!: RequestRdo[];

  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}