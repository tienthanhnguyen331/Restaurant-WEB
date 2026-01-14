import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { KitchenGateway } from './kitchen.gateway';
import { OrderEntity } from '../order/entities/order.entity';
import { AuthModule } from '../auth/auth.module';
import { WaiterModule } from '../waiter/waiter.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), AuthModule, forwardRef(() => WaiterModule)],
  controllers: [KitchenController],
  providers: [KitchenService, KitchenGateway],
  exports: [KitchenGateway],
})
export class KitchenModule {}
