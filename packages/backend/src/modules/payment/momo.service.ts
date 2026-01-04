import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { buildMomoConfig, MomoConfig } from './config/momo.config';

interface MomoCreatePayload {
  amount: number;
  orderId: string;
  requestId?: string;
  extraData?: string;
}

export interface MomoCreateResponse {
  payUrl: string;
  deeplink?: string;
  qrCodeUrl?: string;
  resultCode: number;
  message: string;
  orderId: string;
  requestId: string;
  signature: string;
}

export interface MomoIpnPayload {
  orderId: string;
  requestId: string;
  amount: number;
  resultCode: number;
  message: string;
  orderType?: string;
  transId?: string;
  signature: string;
  [key: string]: any; // allow passthrough for fields momo may add
}

export interface MomoQueryResponse {
  resultCode: number;
  message: string;
  orderId: string;
  requestId: string;
  transId?: string;
  amount?: number;
  signature: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);
  private readonly cfg: MomoConfig;

  constructor(private readonly configService: ConfigService) {
    this.cfg = buildMomoConfig(this.configService);
  }

  private sign(raw: string): string {
    return crypto
      .createHmac('sha256', this.cfg.secretKey)
      .update(raw)
      .digest('hex');
  }

  private buildCreateSignature(body: Record<string, any>): string {
    const raw = `accessKey=${this.cfg.accessKey}&amount=${body.amount}&extraData=${body.extraData}&ipnUrl=${body.ipnUrl}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&partnerCode=${body.partnerCode}&redirectUrl=${body.redirectUrl}&requestId=${body.requestId}&requestType=${body.requestType}`;
    return this.sign(raw);
  }

  private buildQuerySignature(orderId: string, requestId: string): string {
    const raw = `accessKey=${this.cfg.accessKey}&orderId=${orderId}&partnerCode=${this.cfg.partnerCode}&requestId=${requestId}`;
    return this.sign(raw);
  }

  verifyIpnSignature(payload: MomoIpnPayload): void {
    const { signature, ...rest } = payload;
    const raw = Object.keys(rest)
      .sort()
      .map((k) => `${k}=${rest[k]}`)
      .join('&');
    const expected = this.sign(raw);
    
    this.logger.debug(`[verifyIpnSignature] orderId=${payload.orderId}, signature match: ${expected === signature}`);
    
    if (expected !== signature) {
      this.logger.error(`[verifyIpnSignature] FAIL - orderId=${payload.orderId}, expected=${expected}, got=${signature}`);
      throw new UnauthorizedException('Invalid MoMo signature');
    }
    
    this.logger.log(`[verifyIpnSignature] SUCCESS - orderId=${payload.orderId}`);
  }

  async createPayment(payload: MomoCreatePayload): Promise<MomoCreateResponse> {
    const requestId = payload.requestId ?? payload.orderId;
    const body = {
      partnerCode: this.cfg.partnerCode,
      accessKey: this.cfg.accessKey,
      requestId,
      orderId: payload.orderId,
      orderInfo: this.cfg.orderInfo,
      amount: payload.amount,
      extraData: payload.extraData ?? this.cfg.extraData ?? '',
      ipnUrl: this.cfg.ipnUrl,
      redirectUrl: this.cfg.redirectUrl,
      requestType: this.cfg.requestType,
      lang: this.cfg.lang ?? 'vi',
      autoCapture: this.cfg.autoCapture ?? true,
    } as const;

    const signature = this.buildCreateSignature(body);
    const momoRequest = { ...body, signature };

    this.logger.log(`[createPayment] START - orderId=${payload.orderId}, amount=${payload.amount}, ipnUrl=${this.cfg.ipnUrl}`);
    this.logger.debug(`[createPayment] Request body:`, JSON.stringify(momoRequest, null, 2));

    try {
      const res = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(momoRequest),
      });

      const data = (await res.json()) as MomoCreateResponse;
      
      this.logger.log(`[createPayment] SUCCESS - orderId=${payload.orderId}, resultCode=${data.resultCode}, payUrl=${data.payUrl ? 'generated' : 'none'}`);
      this.logger.debug(`[createPayment] Response:`, JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      this.logger.error(`[createPayment] ERROR - orderId=${payload.orderId}, error=${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }

  async queryPayment(orderId: string, requestId: string): Promise<MomoQueryResponse> {
    const signature = this.buildQuerySignature(orderId, requestId);
    const body = {
      partnerCode: this.cfg.partnerCode,
      accessKey: this.cfg.accessKey,
      requestId,
      orderId,
      signature,
      lang: this.cfg.lang ?? 'vi',
    };

    this.logger.log(`[queryPayment] START - orderId=${orderId}, requestId=${requestId}`);

    try {
      const res = await fetch('https://test-payment.momo.vn/v2/gateway/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as MomoQueryResponse;
      
      this.logger.log(`[queryPayment] SUCCESS - orderId=${orderId}, resultCode=${data.resultCode}`);
      
      return data;
    } catch (error) {
      this.logger.error(`[queryPayment] ERROR - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }
}
