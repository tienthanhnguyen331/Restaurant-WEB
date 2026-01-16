import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminProfileApi } from '../../services/adminProfileApi';
import {
  ProfileInfoForm,
  ChangePasswordForm,
  ChangeEmailForm,
  AvatarUploadComponent,
  SectionCard,
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

type EditingSection = 'profile' | 'avatar' | 'password' | 'email' | null;

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});

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
        setEditingSection(null);
        setSuccessMessages(prev => ({
          ...prev,
          profile: 'Thông tin hồ sơ đã được cập nhật thành công!',
        }));
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, profile: '' }));
        }, 3000);
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
    onSuccess: () => {
      setEditingSection(null);
      setSuccessMessages(prev => ({
        ...prev,
        password: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.',
      }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, password: '' }));
      }, 5000);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi thay đổi mật khẩu');
    },
  });

  // Change email mutation
  const changeEmailMutation = useMutation({
    mutationFn: (data: { newEmail: string; password: string }) =>
      adminProfileApi.changeEmail(data),
    onSuccess: () => {
      setEditingSection(null);
      setSuccessMessages(prev => ({
        ...prev,
        email: 'Email đã được gửi. Vui lòng kiểm tra email để xác nhận.',
      }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, email: '' }));
      }, 5000);
    },
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
        setEditingSection(null);
        setSuccessMessages(prev => ({
          ...prev,
          avatar: 'Avatar đã được cập nhật thành công!',
        }));
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, avatar: '' }));
        }, 3000);
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

  const isEditing = editingSection !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-600">Cập nhật thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
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
              <div className="flex items-center mt-2 gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {profile.role}
                </span>
                {profile.isEmailVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Email xác nhận
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-8">
          {/* Profile Info Section */}
          <SectionCard
            title="Thông Tin Cơ Bản"
            description="Cập nhật tên hiển thị và tên đầy đủ"
            isEditing={editingSection === 'profile'}
            isLoading={updateProfileMutation.isPending}
            isDisabled={isEditing && editingSection !== 'profile'}
            onEdit={() => setEditingSection('profile')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const form = document.querySelector('[data-section="profile"] form') as HTMLFormElement;
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
          >
            <div className="space-y-4" data-section="profile">
              <ProfileInfoForm
                initialData={{
                  fullName: profile.name,
                  displayName: profile.displayName,
                }}
                onSubmit={updateProfileMutation.mutateAsync}
                isLoading={updateProfileMutation.isPending}
              />
            </div>
            {successMessages.profile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.profile}
              </div>
            )}
          </SectionCard>

          {/* Avatar Section */}
          <SectionCard
            title="Cập Nhật Avatar"
            description="Thay đổi ảnh đại diện của bạn"
            isEditing={editingSection === 'avatar'}
            isLoading={uploadAvatarMutation.isPending}
            isDisabled={isEditing && editingSection !== 'avatar'}
            onEdit={() => setEditingSection('avatar')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const button = document.querySelector('[data-section="avatar"] button[type="submit"]') as HTMLButtonElement;
              if (button) button.click();
            }}
          >
            {/* THAY ĐỔI Ở ĐÂY: Đổi <form> thành <div> và bỏ onSubmit */}
            <div data-section="avatar"> 
              <AvatarUploadComponent
                currentAvatar={profile.avatar}
                onSubmit={uploadAvatarMutation.mutateAsync}
                isLoading={uploadAvatarMutation.isPending}
              />
              {/* Đã xóa <button type="submit" className="hidden" /> ở đây vì không cần thiết nữa */}
            </div>
            {successMessages.avatar && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.avatar}
              </div>
            )}
          </SectionCard>

          {/* Change Password Section */}
          <SectionCard
            title="Thay Đổi Mật Khẩu"
            description="Cập nhật mật khẩu đăng nhập của bạn"
            isEditing={editingSection === 'password'}
            isLoading={changePasswordMutation.isPending}
            isDisabled={isEditing && editingSection !== 'password'}
            onEdit={() => setEditingSection('password')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const form = document.querySelector('[data-section="password"] form') as HTMLFormElement;
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
          >
            <div data-section="password">
              <ChangePasswordForm
                onSubmit={changePasswordMutation.mutateAsync}
                isLoading={changePasswordMutation.isPending}
              />
            </div>
            {successMessages.password && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.password}
              </div>
            )}
          </SectionCard>

          {/* Change Email Section */}
          <SectionCard
            title="Thay Đổi Email"
            description="Cập nhật địa chỉ email của bạn"
            isEditing={editingSection === 'email'}
            isLoading={changeEmailMutation.isPending}
            isDisabled={isEditing && editingSection !== 'email'}
            onEdit={() => setEditingSection('email')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const form = document.querySelector('[data-section="email"] form') as HTMLFormElement;
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
          >
            <div data-section="email">
              <ChangeEmailForm
                currentEmail={profile.email}
                onSubmit={changeEmailMutation.mutateAsync}
                isLoading={changeEmailMutation.isPending}
              />
            </div>
            {successMessages.email && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.email}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
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