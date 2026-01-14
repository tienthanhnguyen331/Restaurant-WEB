// ...existing code...
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../order/entities/order.entity';
import { KitchenGateway } from '../kitchen/kitchen.gateway';
import { WaiterGateway } from './waiter.gateway';
import { OrderGateway } from '../order/order.gateway';

@Injectable()
export class WaiterService {
  private readonly logger = new Logger(WaiterService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @Inject(forwardRef(() => KitchenGateway))
    private kitchenGateway: KitchenGateway,
    @Inject(forwardRef(() => WaiterGateway))
    private waiterGateway: WaiterGateway,
    @Inject(forwardRef(() => OrderGateway))
    private orderGateway: OrderGateway,
  ) {}

  async getPendingOrders() {
    // Include orders with status PENDING, ACCEPTED, PREPARING, READY
    return this.orderRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.ACCEPTED },
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.READY },
        { status: OrderStatus.SERVED },
      ],
      relations: ['items', 'items.menuItem'], // Added menuItem relation if needed for display
      order: { created_at: 'DESC' },
    });
  }

  async acceptOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is not pending (Current: ${order.status})`);
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.ACCEPTED,
    });

    this.orderGateway.notifyOrderStatusUpdate(orderId, OrderStatus.ACCEPTED);
    this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.ACCEPTED);

    return { message: 'Order accepted' };
  }

  async rejectOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is not pending (Current: ${order.status})`);
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.REJECTED,
    });

    this.orderGateway.notifyOrderStatusUpdate(orderId, OrderStatus.REJECTED);
    this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.REJECTED);

    return { message: 'Order rejected' };
  }

  async sendToKitchen(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException(`Order must be accepted first (Current: ${order.status})`);
    }
    await this.orderRepository.update(orderId, {
      status: OrderStatus.PREPARING,
    });
    // Lấy lại order mới nhất để emit
    const updatedOrder = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items', 'items.menuItem'] });
    if (updatedOrder) {
      this.kitchenGateway.notifyOrderToKitchen(updatedOrder);
      // Notify both Waiter and Guest
      this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.PREPARING);
      this.orderGateway.notifyOrderStatusUpdate(orderId, OrderStatus.PREPARING);
    }
    return { message: 'Order sent to kitchen' };
  }

  async serveOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // Strict check: Must be READY
    if (order.status !== OrderStatus.READY) {
      this.logger.warn(`Failed to serve order ${orderId}: Status is ${order.status}, expected READY`);
      throw new BadRequestException(`Order is not ready to be served (Current: ${order.status})`);
    }
    
    await this.orderRepository.update(orderId, {
      status: OrderStatus.SERVED,
    });
    
    this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.SERVED);
    this.orderGateway.notifyOrderStatusUpdate(orderId, OrderStatus.SERVED);
    
    return { message: 'Order served' };
  }

  async completeOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.SERVED) {
       this.logger.warn(`Failed to complete order ${orderId}: Status is ${order.status}, expected SERVED`);
       throw new BadRequestException(`Order must be served first (Current: ${order.status})`);
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.COMPLETED,
    });

    this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.COMPLETED);
    this.orderGateway.notifyOrderStatusUpdate(orderId, OrderStatus.COMPLETED);

    return { message: 'Order completed' };
  }
}
