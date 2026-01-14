import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaiterController } from './waiter.controller';
import { WaiterService } from './waiter.service';
import { WaiterGateway } from './waiter.gateway';
import { OrderEntity } from '../order/entities/order.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { KitchenModule } from '../kitchen/kitchen.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, User]),
    AuthModule,
    KitchenModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [WaiterController],
  providers: [WaiterService, WaiterGateway],
  exports: [WaiterGateway],
})
export class WaiterModule {}
