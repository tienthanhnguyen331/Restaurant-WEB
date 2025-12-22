import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { MenuLoader } from './components/MenuLoader';
import { ErrorScreen } from './components/ErrorScreen';
import { tableApi } from '../../services/tableApi';
import GuestMenuPage from '../guest-menu/GuestMenuPage';

type PageStatus = 'loading' | 'success' | 'error';

// Helper: Decode JWT token để lấy payload (không verify signature)
function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export const ScanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [tableInfo, setTableInfo] = useState<{ tableId: string; tableNumber: string } | null>(null);

  // Lấy token từ URL: /menu?token=...
  const token = searchParams.get('token');

  const verifyToken = async () => {
    // Nếu không có token trên URL
    if (!token) {
      setStatus('error');
      setErrorMessage('Không tìm thấy mã QR. Vui lòng quét lại mã QR trên bàn.');
      return;
    }

    setStatus('loading');

    // Kiểm tra mock mode
    const useMock = String(import.meta.env.VITE_USE_MOCK_MENU || '').toLowerCase() === 'true';
    
    if (useMock) {
      // Mock mode: decode token để lấy thông tin bàn thực tế
      const decoded = decodeJwtPayload(token);
      
      if (decoded && decoded.sub && decoded.tableNumber) {
        setTimeout(() => {
          setTableInfo({
            tableId: decoded.sub,
            tableNumber: String(decoded.tableNumber),
          });
          setStatus('success');
        }, 500);
      } else {
        setStatus('error');
        setErrorMessage('Token không hợp lệ. Không thể đọc thông tin bàn từ mã QR.');
      }
      return;
    }

    try {
      // Gọi API verify của Backend thông qua tableApi
      const result = await tableApi.verifyQrToken(token);

      if (result.valid) {
        setTableInfo({
          tableId: result.tableId,
          tableNumber: result.tableNumber,
        });
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Mã QR không hợp lệ.');
      }
    } catch (error: any) {
      console.error('QR verification error:', error);
      
      // Xử lý lỗi 401 Unauthorized và các lỗi khác
      let message = 'Mã QR không hợp lệ hoặc đã hết hạn.';
      
      if (error.response) {
        // Server trả về response với status code
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          // Backend NestJS trả về format: { statusCode, message, error }
          message = data?.message || data?.error || 'Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng quét lại mã QR mới từ bàn.';
        } else {
          message = data?.message || data?.error || `Lỗi ${status}: Không thể xác thực mã QR.`;
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response (backend down)
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend hoặc bật Mock Mode.';
      } else {
        // Lỗi khác (setup request)
        message = error.message || 'Đã xảy ra lỗi không xác định.';
      }
      
      setStatus('error');
      setErrorMessage(message);
    }
  };

  // Gọi verify khi component mount hoặc token thay đổi
  useEffect(() => {
    verifyToken();
  }, [token]);

  // Render dựa trên status
  if (status === 'loading') {
    return <MenuLoader />;
  }

  if (status === 'error') {
    return (
      <ErrorScreen 
        message={errorMessage} 
        onRetry={token ? verifyToken : undefined} 
      />
    );
  }

  // status === 'success'
  if (tableInfo) {
    return (
      <GuestMenuPage 
        tableInfo={tableInfo}
        authToken={token}
      />
    );
  }

  // Fallback (không nên xảy ra)
  return <MenuLoader />;
};
