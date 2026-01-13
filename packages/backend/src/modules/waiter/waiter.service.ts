import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class WaiterService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
  ) {}

  async getPendingOrders() {
    return this.orderRepository.find({
      where: { status: OrderStatus.PENDING },
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
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('Order must be accepted first');
    }

    // Send directly to PREPARING status (no IN_KITCHEN intermediate state)
    await this.orderRepository.update(orderId, {
      status: OrderStatus.PREPARING,
    });

    return { message: 'Order sent to kitchen' };
  }
}
