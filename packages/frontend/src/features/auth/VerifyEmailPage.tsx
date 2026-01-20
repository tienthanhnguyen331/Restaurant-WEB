
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Reuse the configured API base URL logic slightly modified or just use direct axios if simple
// Ideally imports from a central api config, but for now we'll match useAuth.ts style
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Không tìm thấy token xác thực.');
            return;
        }

        const verify = async () => {
            try {
                // Call Backend API
                await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
            } catch (err: any) {
                setStatus('error');
                // Extract error message from backend if available
                const msg = err.response?.data?.message || 'Xác thực thất bại. Token có thể đã hết hạn hoặc không hợp lệ.';
                setMessage(msg);
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow rounded-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {status === 'verifying' && 'Đang xác thực...'}
                        {status === 'success' && 'Thành công!'}
                        {status === 'error' && 'Lỗi xác thực'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {message}
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    {status === 'verifying' && (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    )}

                    {status === 'success' && (
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Đến trang Đăng nhập
                        </button>
                    )}

                    {status === 'error' && (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Quay lại Đăng nhập
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
