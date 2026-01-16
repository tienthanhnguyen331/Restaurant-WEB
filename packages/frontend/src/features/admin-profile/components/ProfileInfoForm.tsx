import React, { useState } from 'react';
import { FormInput } from '../../../components/FormComponents';

interface ProfileInfoFormProps {
  initialData: {
    fullName: string;
    displayName?: string;
  };
  onSubmit: (data: { fullName: string; displayName?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (formData.displayName && formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
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
      setSuccessMessage('Thông tin hồ sơ đã được cập nhật thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi cập nhật hồ sơ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin Cơ Bản</h3>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Họ và Tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Nhập họ và tên"
          disabled={isSubmitting || isLoading}
          required
        />

        <FormInput
          label="Tên Hiển Thị (Tùy Chọn)"
          name="displayName"
          value={formData.displayName || ''}
          onChange={handleChange}
          error={errors.displayName}
          placeholder="Nhập tên hiển thị"
          disabled={isSubmitting || isLoading}
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
          {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Thông Tin'}
        </button>
      </form>
    </div>
  );
};
