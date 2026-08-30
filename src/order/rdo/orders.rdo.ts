import { Expose, Type } from 'class-transformer';
import { PaginationRdo } from 'utils/rdo/pagination.rdo';
import { OrderRdo } from './order.rdo';

export class OrdersRdo {
  @Expose()
  @Type(() => OrderRdo)
  items!: OrderRdo[];

  @Expose()
  @Type(() => PaginationRdo)
  pagination!: PaginationRdo;
}