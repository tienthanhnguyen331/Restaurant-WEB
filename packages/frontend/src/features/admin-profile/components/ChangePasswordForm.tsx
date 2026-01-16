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

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi thay đổi mật khẩu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {errors.submit}
        </div>
      )}
    </form>
  );
};
