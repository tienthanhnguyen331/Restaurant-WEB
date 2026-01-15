import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { WaiterModule } from '../waiter/waiter.module';
import { AuthModule } from '../auth/auth.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]), AuthModule, WaiterModule],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway, OptionalJwtAuthGuard],
  exports: [OrderService, OrderGateway],
})
export class OrderModule {}