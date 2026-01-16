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
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccessMessage('Email đã được gửi. Vui lòng kiểm tra email để xác nhận.');
      setFormData({ newEmail: '', password: '' });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi thay đổi email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thay Đổi Email</h3>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">
        Email hiện tại: <strong>{currentEmail}</strong>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang gửi...' : 'Thay Đổi Email'}
        </button>
      </form>
    </div>
  );
};
