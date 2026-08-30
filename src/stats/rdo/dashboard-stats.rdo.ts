import { Expose, Type } from 'class-transformer';

export class RecentOrderRdo {
  @Expose()
  id!: string;

  @Expose()
  orderNumber!: string;

  @Expose()
  name!: string;

  @Expose()
  totalAmount!: number;

  @Expose()
  status!: string;

  @Expose()
  createdAt!: Date;
}

export class RecentRequestRdo {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  phone!: string;

  @Expose()
  serviceTitle?: string;

  @Expose()
  createdAt!: Date;
}

export class OrdersChartPointRdo {
  @Expose()
  date!: string;

  @Expose()
  count!: number;

  @Expose()
  revenue!: number;
}

export class DashboardStatsRdo {
  @Expose()
  ordersToday!: number;

  @Expose()
  ordersYesterday!: number;

  @Expose()
  revenueToday!: number;

  @Expose()
  revenueYesterday!: number;

  @Expose()
  requestsToday!: number;

  @Expose()
  lowStockProducts!: number;

  @Expose()
  totalProducts!: number;

  @Expose()
  totalServices!: number;

  @Expose()
  @Type(() => RecentOrderRdo)
  recentOrders!: RecentOrderRdo[];

  @Expose()
  @Type(() => RecentRequestRdo)
  recentRequests!: RecentRequestRdo[];

  @Expose()
  @Type(() => OrdersChartPointRdo)
  ordersChart!: OrdersChartPointRdo[];
}