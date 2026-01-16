import React, { useState } from 'react';
import { PasswordInput } from '../../../components/FormComponents';

interface ChangePasswordFormProps {
  onSubmit: (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Mật khẩu cũ là bắt buộc';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ thường';
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 số';
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccessMessage('Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại.');
      setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi thay đổi mật khẩu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thay Đổi Mật Khẩu</h3>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <PasswordInput
          label="Mật Khẩu Cũ"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
          error={errors.oldPassword}
          placeholder="Nhập mật khẩu cũ"
          disabled={isSubmitting || isLoading}
          required
        />

        <PasswordInput
          label="Mật Khẩu Mới"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          placeholder="Nhập mật khẩu mới"
          disabled={isSubmitting || isLoading}
          required
          showRequirements
        />

        <PasswordInput
          label="Xác Nhận Mật Khẩu Mới"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          error={errors.confirmNewPassword}
          placeholder="Xác nhận mật khẩu mới"
          disabled={isSubmitting || isLoading}
          required
        />

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang cập nhật...' : 'Thay Đổi Mật Khẩu'}
        </button>
      </form>
    </div>
  );
};
