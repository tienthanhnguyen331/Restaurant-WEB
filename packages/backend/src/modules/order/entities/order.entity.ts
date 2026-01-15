import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { User } from '../../user/user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
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

    @Column('uuid', { name: 'user_id', nullable: true })
    userId?: string;

    @ManyToOne(() => User, (user) => user.orders, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];
}