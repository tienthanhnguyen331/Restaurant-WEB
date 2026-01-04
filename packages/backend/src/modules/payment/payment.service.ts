import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateMomoPaymentDto } from './dto/create-momo-payment.dto';
import { IPayment } from './interfaces/payment.interface';
import { MomoService } from './momo.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
	private readonly logger = new Logger(PaymentService.name);

	constructor(
		private readonly repo: PaymentRepository = new PaymentRepository(),
		private readonly momoService?: MomoService,
		private readonly orderService?: OrderService,
		private readonly configService?: ConfigService,
	) {}

	async create(dto: CreatePaymentDto): Promise<IPayment> {
		const id = Math.random().toString(36).substring(2, 10);
		const now = new Date();
		const payment: IPayment = {
			id,
			orderId: dto.orderId,
			amount: dto.amount,
			method: dto.method,
			status: 'pending',
			createdAt: now,
			updatedAt: now,
		};

		// Mock payment processing (legacy endpoint, prefer MoMo for production)
		payment.status = 'pending'; // Will be updated via IPN callback
		payment.updatedAt = new Date();
		return this.repo.create(payment);
	}

	async createMomo(dto: CreateMomoPaymentDto) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[createMomo] START - orderId=${dto.orderId}, amount=${dto.amount}`);

		const id = Math.random().toString(36).substring(2, 10);
		const now = new Date();
		const requestId = dto.orderId; 
		const payment: IPayment = {
			id,
			orderId: dto.orderId,
			amount: dto.amount,
			method: 'momo',
			status: 'pending',
			createdAt: now,
			updatedAt: now,
		};

		await this.repo.create(payment);
		this.logger.debug(`[createMomo] Payment record created - paymentId=${id}`);

		try {
			const momo = await this.momoService.createPayment({
				orderId: dto.orderId,
				amount: dto.amount,
				requestId,
			});

			this.logger.log(`[createMomo] SUCCESS - payUrl generated for orderId=${dto.orderId}`);
			return {
				paymentId: payment.id,
				orderId: dto.orderId,
				requestId,
				momo,
			};
		} catch (error) {
			await this.repo.update(payment.id, { status: 'failed', updatedAt: new Date() });
			this.logger.error(`[createMomo] ERROR - orderId=${dto.orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Failed to create MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async handleMomoIpn(payload: any) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[handleMomoIpn] IPN received - orderId=${payload.orderId}, resultCode=${payload.resultCode}`);

		// Verify signature first
		try {
			this.momoService.verifyIpnSignature(payload);
			this.logger.log(`[handleMomoIpn] Signature verified - orderId=${payload.orderId}`);
		} catch (error) {
			this.logger.error(`[handleMomoIpn] Signature verification failed - orderId=${payload.orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Invalid MoMo signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		const { orderId, resultCode } = payload;

		const payment = await this.findByOrderId(orderId);
		if (!payment) {
			this.logger.error(`[handleMomoIpn] Payment not found - orderId=${orderId}`);
			throw new NotFoundException('Payment not found');
		}

		const status: IPayment['status'] = resultCode === 0 ? 'success' : 'failed';
		await this.repo.update(payment.id, { status, updatedAt: new Date() });
		this.logger.log(`[handleMomoIpn] Payment status updated - paymentId=${payment.id}, status=${status}`);

		// sync Order status
		if (this.orderService) {
			try {
				const orderStatus = resultCode === 0 ? 'completed' : 'cancelled';
				await this.orderService.updateStatus(orderId, orderStatus);
				this.logger.log(`[handleMomoIpn] Order status synced - orderId=${orderId}, orderStatus=${orderStatus}`);
			} catch (error) {
				this.logger.error(`[handleMomoIpn] Failed to sync order status - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else {
			this.logger.warn(`[handleMomoIpn] OrderService not available, skipping order sync - orderId=${orderId}`);
		}

		return { ok: true, status };
	}

	async queryMomo(orderId: string, requestId: string) {
		if (!this.momoService) {
			throw new BadRequestException('MoMo service not available');
		}

		this.logger.log(`[queryMomo] START - orderId=${orderId}, requestId=${requestId}`);

		try {
			const data = await this.momoService.queryPayment(orderId, requestId);
			this.logger.log(`[queryMomo] SUCCESS - orderId=${orderId}, resultCode=${data.resultCode}`);
			return data;
		} catch (error) {
			this.logger.error(`[queryMomo] ERROR - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new BadRequestException(`Failed to query MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async findAll(): Promise<IPayment[]> {
		return this.repo.findAll();
	}

	async findOne(id: string): Promise<IPayment | undefined> {
		return this.repo.findOne(id);
	}

	async update(id: string, dto: UpdatePaymentDto): Promise<IPayment | undefined> {
		return this.repo.update(id, { ...dto, updatedAt: new Date() });
	}

	async remove(id: string): Promise<boolean> {
		return this.repo.remove(id);
	}

	// Handle MoMo redirect after payment: stay on MoMo success page, don't hop to frontend
	handleMomoRedirect(query: Record<string, any>, res: Response): void {
		const { orderId, resultCode, transId, amount } = query;
		this.logger.log(`[handleMomoRedirect] MoMo redirect received - orderId=${orderId}, resultCode=${resultCode}`);

		const isSuccess = resultCode === '0';
		const message = isSuccess
			? 'Thanh toán thành công. Bạn có thể đóng cửa sổ này.'
			: 'Thanh toán không thành công hoặc đã hủy. Bạn có thể đóng cửa sổ này.';

		// Return a minimal HTML page so browser stays here (no further redirects)
		res.status(200).send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kết quả thanh toán</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f7f7f7; }
    .card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; max-width: 360px; }
    .title { font-size: 18px; margin-bottom: 12px; color: ${isSuccess ? '#16a34a' : '#dc2626'}; }
    .detail { font-size: 14px; color: #444; margin: 4px 0; }
    .small { font-size: 12px; color: #666; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">${isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</div>
    <div class="detail">${message}</div>
    ${orderId ? `<div class="detail">Mã đơn: ${orderId}</div>` : ''}
    ${transId ? `<div class="detail">Mã giao dịch: ${transId}</div>` : ''}
    ${amount ? `<div class="detail">Số tiền: ${amount}</div>` : ''}
    <div class="small">Bạn có thể đóng tab này.</div>
  </div>
</body>
</html>`);
	}

	private async findByOrderId(orderId: string): Promise<IPayment | undefined> {
		const all = await this.repo.findAll();
		return all.find((p) => p.orderId === orderId);
	}
}
