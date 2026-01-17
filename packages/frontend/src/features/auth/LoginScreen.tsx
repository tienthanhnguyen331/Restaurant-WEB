import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from './hooks/useAuth'
import * as z from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [loginError, setLoginError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    setLoginError(''); // Xóa lỗi cũ khi submit
    try {
      const user = await login(data);

      // Kiểm tra role của user
      if (user.role === 'USER') {
        alert(`Chào mừng ${user.name}! Bạn đã đăng nhập thành công với tài khoản khách hàng.`);
        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else {
          navigate('/guest-menu');
        }
      } else if (user.role === 'ADMIN') {
        navigate(from, { replace: true });
      } else if (user.role === 'WAITER') {
        navigate('/waiter');
      } else if (user.role === 'KITCHEN_STAFF') {
        navigate('/kitchen');
      } else {
        setLoginError('Tài khoản không có quyền truy cập phù hợp.');
      }
    } catch (err: any) {
      // Hiển thị thông báo lỗi dưới input password
      if (err.response?.status === 401) {
        setLoginError('Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Đăng nhập thất bại!';
        setLoginError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 bg-white shadow-md rounded-lg w-96 mt-16 mb-8 flex flex-col justify-start"
        style={{ marginTop: '7vh', height: '24rem', minHeight: '24rem', maxHeight: '24rem' }}
      >
        <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>
        <input {...register('email')} className="w-full border p-2 mb-4 rounded" placeholder="Email" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register('password')}
            className="w-full border p-2 mb-2 rounded pr-10"
            placeholder="Mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
          Đăng nhập
        </button>
        <div className="mt-4 text-center space-y-2">
          <Link to="/register" className="block text-blue-500 hover:text-blue-700">Đăng ký</Link>
          <Link to="/forgot-password" className="block text-blue-500 hover:text-blue-700">Quên mật khẩu?</Link>
        </div>
      </form>
    </div>
  );
};