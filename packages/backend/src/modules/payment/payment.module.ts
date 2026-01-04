import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { MomoService } from './momo.service';
import { OrderModule } from '../order/order.module';

@Module({
	imports: [ConfigModule, OrderModule],
	controllers: [PaymentController],
	providers: [PaymentService, PaymentRepository, MomoService],
	exports: [PaymentService, MomoService],
})
export class PaymentModule {}
