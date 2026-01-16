import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const schema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không trùng khớp",
  path: ["confirmPassword"],
});

export const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Không có token được cung cấp. Vui lòng yêu cầu một liên kết đặt lại mật khẩu mới.');
    }
  }, [token]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (!token) {
      setError('Không có token được cung cấp.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/reset-password`,
        {
          token,
          newPassword: data.newPassword,
        }
      );

      // Show success message and redirect
      alert(response.data.message);
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg w-96 mt-16">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Lỗi</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            Yêu Cầu Đặt Lại Mật Khẩu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 bg-white shadow-md rounded-lg w-96 mt-16 mb-8 flex flex-col justify-start"
        style={{ minHeight: '28rem' }}
      >
        <h2 className="text-2xl font-bold mb-2">Đặt Lại Mật Khẩu</h2>
        <p className="text-gray-600 text-sm mb-6">
          Nhập mật khẩu mới của bạn. Mật khẩu phải có ít nhất 6 ký tự.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mật Khẩu Mới</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('newPassword')}
              className="w-full border p-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Xác Nhận Mật Khẩu</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="w-full border p-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Xác nhận mật khẩu"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang Xử Lý...' : 'Đặt Lại Mật Khẩu'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Quay lại
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-700 font-medium ml-1"
            >
              Đăng Nhập
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
