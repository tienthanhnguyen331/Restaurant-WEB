import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/forgot-password`,
        { email: data.email }
      );

      setMessage(response.data.message);
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg w-96 mt-16 flex flex-col justify-center">
          <div className="text-center">
            <div className="mb-4 text-4xl">📧</div>
            <h2 className="text-2xl font-bold mb-4">Kiểm Tra Email</h2>
            <p className="text-gray-600 mb-6">
              Nếu tài khoản với email này tồn tại, chúng tôi sẽ gửi một liên kết đặt lại mật khẩu trong vài phút.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vui lòng kiểm tra thư mục Spam nếu bạn không thấy email.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Quay Lại Đăng Nhập
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Thử Một Email Khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 bg-white shadow-md rounded-lg w-96 mt-16 mb-8 flex flex-col justify-start"
        style={{ minHeight: '20rem' }}
      >
        <h2 className="text-2xl font-bold mb-2">Quên Mật Khẩu?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Nhập email của bạn và chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            {...register('email')}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="your@email.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang Gửi...' : 'Gửi Liên Kết Đặt Lại'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Nhớ mật khẩu?</p>
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Quay Lại Đăng Nhập
          </Link>
        </div>
      </form>
    </div>
  );
};
