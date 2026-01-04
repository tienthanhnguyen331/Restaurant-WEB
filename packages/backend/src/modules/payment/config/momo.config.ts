import { ConfigService } from '@nestjs/config';

export interface MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  requestType: string; // captureWallet, linkWallet, etc.
  redirectUrl: string;
  ipnUrl: string;
  orderInfo: string;
  extraData?: string;
  orderGroupId?: string;
  autoCapture?: boolean;
  lang?: string;
}

// Build MoMo config from environment variables and optional ngrok override
export const buildMomoConfig = (configService: ConfigService): MomoConfig => {
  const baseUrl = configService.get<string>('NGROK_BASE_URL');
  // Prefer ngrok base when running local; fallback to static env values
  const redirectEnv = configService.get<string>('MOMO_REDIRECT_URL');
  const ipnEnv = configService.get<string>('MOMO_IPN_URL');

  const redirectUrl = baseUrl ? `${baseUrl}/api/payment/momo/redirect` : redirectEnv;
  const ipnUrl = baseUrl ? `${baseUrl}/api/payment/momo/ipn` : ipnEnv;

  return {
    partnerCode: configService.getOrThrow<string>('MOMO_PARTNER_CODE'),
    accessKey: configService.getOrThrow<string>('MOMO_ACCESS_KEY'),
    secretKey: configService.getOrThrow<string>('MOMO_SECRET_KEY'),
    requestType: configService.get<string>('MOMO_REQUEST_TYPE', 'captureWallet'),
    redirectUrl: redirectUrl ?? '',
    ipnUrl: ipnUrl ?? '',
    orderInfo: configService.get<string>('MOMO_ORDER_INFO', 'pay with MoMo'),
    extraData: configService.get<string>('MOMO_EXTRA_DATA', ''),
    orderGroupId: configService.get<string>('MOMO_ORDER_GROUP_ID', ''),
    autoCapture: configService.get<boolean>('MOMO_AUTO_CAPTURE', true),
    lang: configService.get<string>('MOMO_LANG', 'vi'),
  };
};
