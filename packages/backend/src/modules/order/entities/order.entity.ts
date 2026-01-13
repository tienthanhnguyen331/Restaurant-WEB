import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class OrderEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    table_id: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column('numeric', { precision: 12, scale: 2, default: 0 })
    total_amount: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];
}