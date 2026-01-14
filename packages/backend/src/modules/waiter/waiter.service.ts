// ...existing code...
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../order/entities/order.entity';
import { KitchenGateway } from '../kitchen/kitchen.gateway';
import { WaiterGateway } from './waiter.gateway';

@Injectable()
export class WaiterService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @Inject(forwardRef(() => KitchenGateway))
    private kitchenGateway: KitchenGateway,
    @Inject(forwardRef(() => WaiterGateway))
    private waiterGateway: WaiterGateway,
  ) {}

  async getPendingOrders() {
    // Include orders with status PENDING, ACCEPTED, PREPARING, READY
    return this.orderRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.ACCEPTED },
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.READY },
      ],
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async acceptOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.ACCEPTED,
    });

    return { message: 'Order accepted' };
  }

  async rejectOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.REJECTED,
    });

    return { message: 'Order rejected' };
  }

  async sendToKitchen(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('Order must be accepted first');
    }
    await this.orderRepository.update(orderId, {
      status: OrderStatus.PREPARING,
    });
    // Lấy lại order mới nhất để emit
    const updatedOrder = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (updatedOrder) {
      this.kitchenGateway.notifyOrderToKitchen(updatedOrder);
      this.waiterGateway.notifyOrderStatusUpdate(orderId, OrderStatus.PREPARING);
    }
    return { message: 'Order sent to kitchen' };
  }

  async serveOrder(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('Order is not ready to be served');
    }
    await this.orderRepository.update(orderId, {
      status: OrderStatus.SERVED,
    });
    // Optionally emit socket event here for real-time update
    return { message: 'Order served' };
  }
}
