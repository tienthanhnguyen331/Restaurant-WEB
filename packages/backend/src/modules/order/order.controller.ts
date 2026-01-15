import { Controller, Get, Post, Body, Param, Patch, BadRequestException, Logger, Req, UseGuards, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './entities/order.entity';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PdfGeneratorService } from '../exports/pdf-generator.service';


interface RequestWithUser extends Request {
  user?: { sub?: string };
}

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly jwtService: JwtService,
    private readonly pdfGeneratorService: PdfGeneratorService, // Thêm DI
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    this.logger.log(`[CREATE_ORDER] payload=${JSON.stringify(createOrderDto)}`);
    try {
      const userId = await this.resolveUserId(req);
      const result = await this.orderService.create(createOrderDto, userId);
      this.logger.log(`[CREATE_ORDER_SUCCESS] orderId=${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[CREATE_ORDER_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to create order');
    }
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('me')
  getMyOrders(@Req() req: Request) {
    const payload = (req as RequestWithUser).user;
    return this.orderService.findByUserId(payload?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
  
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
      return this.orderService.updateStatus(id, status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.orderService.update(id, updateOrderDto);
  }

  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const order = await this.orderService.findOne(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Chuyển đổi dữ liệu order sang dạng phù hợp cho PDF
    const orderForPdf = {
      id: order.id,
      createdAt: order.created_at,
      tableNumber: order.table_id,
      items: order.items.map((item: any) => ({
        name: item.menuItem?.name || '',
        quantity: item.quantity,
        price: item.price,
        categoryName: item.menuItem?.category?.name || '',
      })),
    };
    return this.pdfGeneratorService.generateOrderInvoice(orderForPdf, res);
  }

  private async resolveUserId(request: Request): Promise<string | undefined> {
    const token = this.extractTokenFromHeader(request);
    if (!token) return undefined;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string }>(token);
      return payload?.sub;
    } catch (error) {
      this.logger.warn(`[CREATE_ORDER] Invalid token: ${error instanceof Error ? error.message : 'unknown'}`);
      return undefined;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
