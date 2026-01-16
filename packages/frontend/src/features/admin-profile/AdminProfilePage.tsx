import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminProfileApi } from '../../services/adminProfileApi';
import {
  ProfileInfoForm,
  ChangePasswordForm,
  ChangeEmailForm,
  AvatarUploadComponent,
} from './components';

interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: adminProfileApi.getProfile,
  });

  useEffect(() => {
    if (profileData?.data) {
      setProfile(profileData.data);
    }
  }, [profileData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; displayName?: string }) =>
      adminProfileApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        setProfile(response.data);
      }
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => adminProfileApi.changePassword(data),
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi thay đổi mật khẩu');
    },
  });

  // Change email mutation
  const changeEmailMutation = useMutation({
    mutationFn: (data: { newEmail: string; password: string }) =>
      adminProfileApi.changeEmail(data),
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi thay đổi email');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => adminProfileApi.uploadAvatar(file),
    onSuccess: (response) => {
      // response is the full user object from backend (with avatar URL)
      // Update profile state with new avatar URL from Cloudinary
      if (response.data && response.data.avatar) {
        setProfile((prev) => prev ? { ...prev, avatar: response.data.avatar } : prev);
      }
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi tải lên avatar');
    },
  });

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-gray-600">Vui lòng thử lại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-600">Cập nhật thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <div className="mr-6">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {profile.role}
                </span>
                {profile.isEmailVerified && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Email xác nhận
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Profile Info Form */}
          <ProfileInfoForm
            initialData={{
              fullName: profile.name,
              displayName: profile.displayName,
            }}
            onSubmit={updateProfileMutation.mutateAsync}
            isLoading={updateProfileMutation.isPending}
          />

          {/* Avatar Upload */}
          <AvatarUploadComponent
            currentAvatar={profile.avatar}
            onSubmit={uploadAvatarMutation.mutateAsync}
            isLoading={uploadAvatarMutation.isPending}
          />
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          {/* Change Password */}
          <ChangePasswordForm
            onSubmit={changePasswordMutation.mutateAsync}
            isLoading={changePasswordMutation.isPending}
          />

          {/* Change Email */}
          <ChangeEmailForm
            currentEmail={profile.email}
            onSubmit={changeEmailMutation.mutateAsync}
            isLoading={changeEmailMutation.isPending}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p>
            <strong>Tài khoản được tạo:</strong> {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
          </p>
          <p>
            <strong>Cập nhật lần cuối:</strong> {new Date(profile.updatedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;