import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, registerData);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Đăng ký</h2>

        <input {...register('name')} className="w-full border p-2 mb-4 rounded" placeholder="Tên" />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>

        <input {...register('email')} className="w-full border p-2 mb-4 rounded" placeholder="Email" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <input type="password" {...register('password')} className="w-full border p-2 mb-4 rounded" placeholder="Mật khẩu" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <input type="password" {...register('confirmPassword')} className="w-full border p-2 mb-4 rounded" placeholder="Xác nhận mật khẩu" />
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
          <Link to="/login" className="text-blue-500 hover:text-blue-700">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};