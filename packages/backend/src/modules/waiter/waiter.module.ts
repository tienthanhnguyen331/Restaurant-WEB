import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaiterController } from './waiter.controller';
import { WaiterService } from './waiter.service';
import { WaiterGateway } from './waiter.gateway';
import { OrderEntity } from '../order/entities/order.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, User]),
    AuthModule, // ✅ BAT BUOC
  ],
  controllers: [WaiterController],
  providers: [WaiterService, WaiterGateway],
  exports: [WaiterGateway],
})
export class WaiterModule {}
