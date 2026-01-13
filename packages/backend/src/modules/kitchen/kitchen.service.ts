import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
  ) {}

  async getOrders() {
    // Get orders that are in PREPARING or READY status
    return this.orderRepository.find({
      where: [
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.READY },
      ],
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async setPreparing(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('Order must be accepted first');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.PREPARING,
    });

    return { message: 'Order set to preparing' };
  }

  async setReady(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PREPARING) {
      throw new BadRequestException('Order must be preparing first');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.READY,
    });

    return { message: 'Order set to ready' };
  }
}
