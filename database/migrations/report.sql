-- Migration: Tạo views cho báo cáo (Report)

-- View 1: Doanh thu theo ngày
-- Dùng để hiển thị doanh thu daily/weekly/monthly
-- Lấy từ orders với status = 'COMPLETED'
CREATE OR REPLACE VIEW v_revenue_daily AS
SELECT 
  DATE(o.created_at) as report_date,
  SUM(o.total_amount) as total_revenue,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT o.id) as completed_orders
FROM orders o
WHERE o.status = 'COMPLETED'
GROUP BY DATE(o.created_at)
ORDER BY report_date DESC;

-- View 2: Bán chạy nhất (Best Sellers)
-- Dùng để hiển thị top items theo số lượng và doanh thu
CREATE OR REPLACE VIEW v_best_sellers AS
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
GROUP BY mi.id, mi.name
ORDER BY total_revenue DESC;

