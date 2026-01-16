import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderEntity } from '../order/entities/order.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  WAITER = 'WAITER',
  KITCHEN = 'KITCHEN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  emailVerificationToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders?: OrderEntity[];
}