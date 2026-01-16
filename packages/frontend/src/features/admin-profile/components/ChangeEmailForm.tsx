import React, { useState } from 'react';
import { FormInput, PasswordInput } from '../../../components/FormComponents';

interface ChangeEmailFormProps {
  currentEmail: string;
  onSubmit: (data: { newEmail: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

export const ChangeEmailForm: React.FC<ChangeEmailFormProps> = ({
  currentEmail,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
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

    if (!formData.newEmail) {
      newErrors.newEmail = 'Email mới là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmail)) {
      newErrors.newEmail = 'Email không hợp lệ';
    } else if (formData.newEmail === currentEmail) {
      newErrors.newEmail = 'Email mới phải khác với email hiện tại';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
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
      setFormData({ newEmail: '', password: '' });
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi thay đổi email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">
        Email hiện tại: <strong>{currentEmail}</strong>
      </div>

      <FormInput
        label="Email Mới"
        name="newEmail"
        type="email"
        value={formData.newEmail}
        onChange={handleChange}
        error={errors.newEmail}
        placeholder="Nhập email mới"
        disabled={isSubmitting || isLoading}
        required
      />

      <PasswordInput
        label="Mật Khẩu (Xác Nhận)"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Nhập mật khẩu để xác nhận"
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
