import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfGeneratorService {
  private getFontPath(): string {
    const possiblePaths = [
      path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Regular.ttf'),
      path.join(process.cwd(), 'dist', 'assets', 'fonts', 'Roboto-Regular.ttf'),
      path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
      path.join(__dirname, '..', '..', '..', '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }

    return 'Helvetica';
  }

  /* ======================= QR PDF (SINGLE) ======================= */
  async generate(table: any, res: Response) {
    const fontPath = this.getFontPath();
    const baseUrl =
      process.env.FRONTEND_URL || 'https://restaurant-web-2t3m.vercel.app';

    const qrUrl = `${baseUrl}/menu?table=${table.id}&token=${table.qrToken || ''}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    if (fontPath !== 'Helvetica') {
      try {
        doc.font(fontPath);
      } catch {}
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Table-${table.tableNumber}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text(`Bàn số: ${table.tableNumber}`, { align: 'center' });

    doc.rect(100, 150, 400, 400).stroke();
    doc.image(qrDataUrl, 200, 200, { width: 200, height: 200 });

    doc
      .moveDown(15)
      .fontSize(12)
      .text(`Vị trí: ${table.location}`, { align: 'center' });

    doc.end();
  }

  /* ======================= QR PDF (BULK) ======================= */
  async generateBulk(tables: any[], res: Response) {
    const fontPath = this.getFontPath();
    const baseUrl =
      process.env.FRONTEND_URL || 'https://restaurant-web-2t3m.vercel.app';

    const doc = new PDFDocument({ size: 'A4', margin: 20 });

    if (fontPath !== 'Helvetica') {
      try {
        doc.font(fontPath);
      } catch {}
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=All-QR-Codes.pdf',
    );

    doc.pipe(res);

    doc.fontSize(24).text('Restaurant QR Codes', { align: 'center' });
    doc
      .moveDown()
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleString('vi-VN')}`, {
        align: 'center',
      });

    doc.addPage();

    const cols = 2;
    const rows = 2;
    const qrSize = 120;
    const margin = 20;
    const cellWidth = (doc.page.width - margin * 2) / cols;
    const cellHeight = (doc.page.height - margin * 2) / rows;

    for (let i = 0; i < tables.length; i++) {
      if (i > 0 && i % 4 === 0) doc.addPage();

      const table = tables[i];
      const qrUrl = `${baseUrl}/menu?table=${table.id}&token=${table.qrToken || ''}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);

      const index = i % 4;
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = margin + col * cellWidth;
      const y = margin + row * cellHeight;

      doc.rect(x + 5, y + 5, cellWidth - 10, cellHeight - 10).stroke();

      doc.fontSize(12).text(`Table ${table.tableNumber}`, x + 10, y + 10);
      doc.fontSize(9).text(table.location, x + 10, y + 28);

      doc.image(qrDataUrl, x + (cellWidth - qrSize) / 2, y + 60, {
        width: qrSize,
        height: qrSize,
      });

      doc
        .fontSize(8)
        .text('Scan to Order', x + 10, y + cellHeight - 20, {
          width: cellWidth - 20,
          align: 'center',
        });
    }

    doc.end();
  }

  /* ======================= ORDER INVOICE ======================= */
  async generateOrderInvoice(order: any, res: Response) {
  const fontPath = this.getFontPath();

  const doc = new PDFDocument({
    size: [226, 800], // ~ 80mm width
    margin: 10,
  });

  if (fontPath !== 'Helvetica') {
    try {
      doc.font(fontPath);
    } catch {}
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Invoice-POS-${order.code || order.id}.pdf`,
  );

  doc.pipe(res);

  const formatMoney = (v: number) =>
    v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  /* ===== HEADER ===== */
  //doc.fontSize(12).text('RESTAURANT NAME', { align: 'center' });
  doc.fontSize(10).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
  doc.moveDown(0.5);

  doc
    .fontSize(8)
    .text(`Mã đơn: ${order.code || order.id}`);
  if (order.table?.tableNumber) {
    doc.text(`Bàn: ${order.table.tableNumber}`);
  }
  doc.text(
    `Thời gian: ${new Date(order.createdAt).toLocaleString('vi-VN')}`,
  );

  doc.moveDown(0.5);
  doc.text('--------------------------------');

  /* ===== ITEMS ===== */
  let total = 0;

  for (const item of order.items) {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;

    doc.fontSize(9).text(item.name, { continued: false });

    doc
      .fontSize(8)
      .text(
        `${item.quantity} x ${formatMoney(item.price)}`,
        { continued: true },
      )
      .text(formatMoney(itemTotal), { align: 'right' });

    doc.moveDown(0.3);
  }

  doc.text('--------------------------------');

  /* ===== TOTAL ===== */
  doc
    .fontSize(10)
    .fillColor('blue')
    .text(`TỔNG CỘNG`, { continued: true })
    .text(formatMoney(total), { align: 'right' })
    .fillColor('black');

  doc.moveDown();

  /* ===== FOOTER ===== */
  doc
    .fontSize(8)
    .text('Cảm ơn quý khách!', { align: 'center' });
  doc
    .fontSize(7)
    .text('Hẹn gặp lại', { align: 'center' });

  doc.end();
}

}
