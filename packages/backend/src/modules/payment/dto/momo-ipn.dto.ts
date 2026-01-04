// DTO for MoMo IPN payload
export class MomoIpnDto {
  partnerCode!: string;
  orderId!: string;
  requestId!: string;
  amount!: number;
  orderInfo?: string;
  orderType?: string;
  transId?: number;
  resultCode!: number;
  message!: string;
  payType?: string;
  responseTime?: number;
  extraData?: string;
  signature!: string;
  // MoMo may add fields; allow index signature in controller validation layer if needed
}
