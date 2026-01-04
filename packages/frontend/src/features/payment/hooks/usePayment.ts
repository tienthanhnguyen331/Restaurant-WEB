import { useState } from 'react';
import { paymentApi } from '../services/paymentApi';
import { momoApi } from '../services/momoApi';
import type { Payment, CreatePaymentDto } from '../types/payment';
export function usePayment() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [payment, setPayment] = useState<Payment | undefined>();
  const [loading, setLoading] = useState(false);

  const MENU_RETURN_KEY = 'last_menu_url';

  const setReturnUrl = (url?: string) => {
    try {
      const current = url || window.location.href;
      // Avoid storing /payment to prevent redirect loop; if so, keep previous stored
      if (current.includes('/payment')) {
        return;
      }
      localStorage.setItem(MENU_RETURN_KEY, current);
    } catch (e) {
      console.warn('Could not persist return URL', e);
    }
  };

  const pay = async (data: CreatePaymentDto) => {
    setLoading(true);
    setStatus('pending');
    setError(undefined);
    try {
      const result = await paymentApi.createPayment(data);
      setPayment(result);
      setStatus(result.status);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const payWithMomo = async (orderId: string, amount: number) => {
    setLoading(true);
    setStatus('pending');
    setError(undefined);
    try {
      const result = await momoApi.createPayment({ orderId, amount });
      setPayment({
        id: result.paymentId,
        orderId: result.orderId,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Payment);

      // Remember current page (with token) to return after payment
      setReturnUrl();

      // Redirect to MoMo payment URL (works on web)
      if (result.momo?.payUrl) {
        momoApi.redirectToMoMo(result.momo.payUrl);
      } else {
        throw new Error('No payment URL provided by MoMo');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to create MoMo payment');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return { pay, payWithMomo, status, error, payment, loading, MENU_RETURN_KEY, setReturnUrl };
}
