import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToken = searchParams.get('returnToken');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, registerData);
      alert('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập.');
      navigate(`/login${returnToken ? `?returnToken=${returnToken}` : ''}`);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        alert('Email đã tồn tại.');
      } else if (status === 400) {
        alert('Dữ liệu không hợp lệ.');
      } else {
        alert('Đăng ký thất bại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 bg-white shadow-md rounded-lg w-96 mt-16 mb-8 flex flex-col justify-start"
        style={{ marginTop: '7vh', height: '26rem', minHeight: '26rem', maxHeight: '28rem' }}
      >
        <h2 className="text-2xl font-bold mb-6">Đăng ký</h2>
        <input {...register('name')} className="w-full border p-2 mb-4 rounded" placeholder="Tên" />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>
        <input {...register('email')} className="w-full border p-2 mb-4 rounded" placeholder="Email" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register('password')}
            className="w-full border p-2 mb-4 rounded pr-10"
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
        <p className="text-red-500 text-sm">{errors.password?.message}</p>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword')}
            className="w-full border p-2 mb-4 rounded pr-10"
            placeholder="Xác nhận mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link to={`/login${returnToken ? `?returnToken=${returnToken}` : ''}`} className="text-blue-500 hover:text-blue-700">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};