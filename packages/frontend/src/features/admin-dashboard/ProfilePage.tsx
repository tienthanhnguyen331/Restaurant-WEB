import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Lấy chính xác key 'access_token' như đã lưu trong useAuth.ts
  const token = localStorage.getItem('access_token'); 

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Bảo vệ: Nếu không có token, ném lỗi ngay lập tức để không gọi API vô ích
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: {
          // Gửi đúng định dạng Bearer Token
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    // Chỉ chạy query nếu đã có token
    enabled: !!token, 
    retry: false, // Không thử lại nếu bị 401
  });

  // Tự động điều hướng về login nếu có lỗi xác thực (401)
  useEffect(() => {
    if (error || (!isLoading && !token)) {
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  }, [error, isLoading, token, navigate]);

  if (isLoading) return <div className="p-6 flex justify-center">Đang tải thông tin...</div>;
  if (error) return <div className="p-6 text-red-500">Phiên làm việc hết hạn. Vui lòng đăng nhập lại.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thông tin cá nhân</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-blue-50 shadow-sm object-cover"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <h2 className="text-2xl font-bold mt-4 text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 font-medium">{user?.email}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Vai trò</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
              {user?.role || 'Thành viên'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</span>
            <span className="text-sm text-green-600 font-medium">Đang hoạt động</span>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:transform active:scale-95">
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
};