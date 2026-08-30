import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { fillDto } from 'utils/fill-dto';
import { DashboardStatsRdo } from './rdo/dashboard-stats.rdo';

const LOW_STOCK_THRESHOLD = 5;
const RECENT_LIMIT = 5;
const CHART_DAYS = 7;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(offsetDays: number) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - offsetDays,
    );
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  private mapOrder(o: any) {
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      name: o.name,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
    };
  }

  private mapRequest(r: any) {
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      serviceTitle: r.service?.title,
      createdAt: r.createdAt,
    };
  }

  async getDashboard(): Promise<DashboardStatsRdo> {
    const today = this.getDateRange(0);
    const yesterday = this.getDateRange(1);
    const chartStart = this.getDateRange(CHART_DAYS - 1).start;

    const [
      ordersTodayCount,
      ordersYesterdayCount,
      revenueTodayAgg,
      revenueYesterdayAgg,
      requestsTodayCount,
      lowStockCount,
      totalProducts,
      totalServices,
      recentOrdersRaw,
      recentRequestsRaw,
      chartOrdersRaw,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: { gte: today.start, lt: today.end },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: yesterday.start, lt: yesterday.end },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: today.start, lt: today.end },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterday.start, lt: yesterday.end },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.request.count({
        where: {
          createdAt: { gte: today.start, lt: today.end },
        },
      }),
      this.prisma.product.count({
        where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      }),
      this.prisma.product.count(),
      this.prisma.service.count(),
      this.prisma.order.findMany({
        take: RECENT_LIMIT,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          name: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.request.findMany({
        take: RECENT_LIMIT,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { title: true } },
        },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: chartStart } },
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const ordersToday = ordersTodayCount;
    const revenueToday = revenueTodayAgg._sum.totalAmount ?? 0;

    const ordersYesterday = ordersYesterdayCount;
    const revenueYesterday = revenueYesterdayAgg._sum.totalAmount ?? 0;

    const ordersChart = this.buildOrdersChart(chartOrdersRaw);

    return fillDto(DashboardStatsRdo, {
      ordersToday,
      ordersYesterday,
      revenueToday,
      revenueYesterday,
      requestsToday: requestsTodayCount,
      lowStockProducts: lowStockCount,
      totalProducts,
      totalServices,
      recentOrders: recentOrdersRaw.map((o) => this.mapOrder(o)),
      recentRequests: recentRequestsRaw.map((r) => this.mapRequest(r)),
      ordersChart,
    });
  }

  private buildOrdersChart(orders: { totalAmount: number; createdAt: Date }[]) {
    const dates: string[] = [];
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const grouped = new Map<string, { count: number; revenue: number }>();
    for (const date of dates) {
      grouped.set(date, { count: 0, revenue: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.count += 1;
        bucket.revenue += order.totalAmount ?? 0;
      }
    }

    return dates.map((date) => {
      const data = grouped.get(date)!;
      return {
        date,
        count: data.count,
        revenue: data.revenue,
      };
    });
  }
}