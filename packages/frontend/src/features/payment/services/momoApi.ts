// MoMo Payment API service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateMomoPaymentRequest {
  orderId: string;
  amount: number;
}

export interface MomoCreateResponse {
  paymentId: string;
  orderId: string;
  requestId: string;
  momo: {
    payUrl: string;
    deeplink?: string;
    qrCodeUrl?: string;
    resultCode: number;
    message: string;
    orderId: string;
    requestId: string;
    signature: string;
  };
}

export interface MomoQueryRequest {
  orderId: string;
  requestId: string;
}

export interface MomoQueryResponse {
  resultCode: number;
  message: string;
  orderId: string;
  requestId: string;
  transId?: number;
  amount?: number;
  signature: string;
}

export const momoApi = {
  async createPayment(data: CreateMomoPaymentRequest): Promise<MomoCreateResponse> {
    try {
      const response = await axios.post<MomoCreateResponse>(
        `${API_BASE_URL}/api/payment/momo/create`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create MoMo payment');
      }
      throw error;
    }
  },

  async queryPayment(data: MomoQueryRequest): Promise<MomoQueryResponse> {
    try {
      const response = await axios.post<MomoQueryResponse>(
        `${API_BASE_URL}/api/payment/momo/query`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to query MoMo payment');
      }
      throw error;
    }
  },

  // Redirect to MoMo payment URL
  redirectToMoMo(payUrl: string): void {
    if (payUrl) {
      window.location.href = payUrl;
    }
  },

  // Open MoMo deeplink (for mobile)
  openMoMoDeeplink(deeplink?: string): void {
    if (deeplink) {
      window.location.href = deeplink;
    }
  },

  // Cancel payment when user navigates away
  async cancelPayment(orderId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/payment/momo/cancel`,
        { orderId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Cancel payment failed:', error);
      throw error;
    }
  },
};
