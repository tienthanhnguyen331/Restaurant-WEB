// packages/backend/src/modules/report/report.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RevenueQueryDto, BestSellersQueryDto } from './dto/revenue-query.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Lấy báo cáo doanh thu theo khoảng thời gian
   * Hỗ trợ: daily (mặc định), weekly, monthly
   */
  async getRevenueReport(query: RevenueQueryDto) {
    this.logger.log(`[REVENUE_REPORT] from=${query.from}, to=${query.to}, period=${query.period || 'daily'}`);

    if (!query.from || !query.to) {
      throw new BadRequestException('from và to là bắt buộc');
    }

    const period = query.period || 'daily';
    let dateGroupFormat: string;

    switch (period) {
      case 'weekly':
        dateGroupFormat = `to_char(o.created_at, 'YYYY') || '-' || to_char(o.created_at, 'MM') || '-tuần ' || 
          CAST(CEILING(EXTRACT(DAY FROM o.created_at)::numeric / 7) AS INT)`;
        break;
      case 'monthly':
        dateGroupFormat = "to_char(o.created_at, 'YYYY-MM')";
        break;
      case 'daily':
      default:
        dateGroupFormat = "to_char(o.created_at, 'YYYY-MM-DD')";
    }

    try {
      const result = await this.dataSource.query(`
        SELECT 
          ${dateGroupFormat} as period,
          SUM(o.total_amount) as revenue,
          COUNT(DISTINCT o.id) as total_orders
        FROM orders o
        WHERE o.status = 'COMPLETED'
          AND DATE(o.created_at) BETWEEN $1::date AND $2::date
        GROUP BY ${dateGroupFormat}
        ORDER BY period ASC
      `, [query.from, query.to]);

      // We add completed_orders to be consistent with the previous output, though it's the same as total_orders here.
      const finalResult = result.map(r => ({
        ...r,
        completed_orders: r.total_orders,
      }));


      this.logger.log(`[REVENUE_REPORT_SUCCESS] Found ${finalResult.length} records`);
      return finalResult;
    } catch (error) {
      this.logger.error(`[REVENUE_REPORT_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Lấy báo cáo bán chạy nhất
   * Mặc định: top 10 items theo doanh thu
   */
  async getBestSellersReport(query: BestSellersQueryDto) {
    this.logger.log(`[BEST_SELLERS_REPORT] limit=${query.limit || 10}`);

    const limit = query.limit || 10;

    try {
      let sql = `
        SELECT 
          id,
          item_name,
          total_times_ordered,
          total_quantity_sold,
          total_revenue,
          avg_order_value
        FROM v_best_sellers
      `;

      const params: any[] = [];

      // Filter by date range (optional)
      if (query.from && query.to) {
        // Nếu có filter thời gian, cần join với order_items table
        sql = `
          SELECT 
            mi.id,
            mi.name as item_name,
            COUNT(DISTINCT oi.id) as total_times_ordered,
            SUM(oi.quantity) as total_quantity_sold,
            SUM(oi.quantity * oi.price) as total_revenue,
            ROUND(AVG(oi.quantity * oi.price), 2) as avg_order_value
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status IN ('COMPLETED', 'CANCELLED')
            AND DATE(o.created_at) BETWEEN $1::date AND $2::date
          GROUP BY mi.id, mi.name
          ORDER BY total_revenue DESC
          LIMIT $3
        `;
        params.push(query.from, query.to, limit);
      } else {
        sql += ` LIMIT $1`;
        params.push(limit);
      }

      const result = await this.dataSource.query(sql, params);
      this.logger.log(`[BEST_SELLERS_REPORT_SUCCESS] Found ${result.length} items`);
      return result;
    } catch (error) {
      this.logger.error(`[BEST_SELLERS_REPORT_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
