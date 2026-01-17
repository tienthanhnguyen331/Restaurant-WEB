import React, { useState, useEffect } from 'react';
import type { StaffMember, UpdateStaffPayload } from '../../../services/staffApi';

interface EditStaffModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffId: string, data: UpdateStaffPayload) => void;
  isLoading?: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  role?: string;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UpdateStaffPayload>({
    fullName: '',
    role: 'WAITER',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.name,
        role: staff.role,
      });
      setErrors({});
    }
  }, [staff, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.fullName && formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    } else if (formData.fullName && !/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'fullName' || name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value || undefined,
      }));
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && staff) {
      onSubmit(staff.id, formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Cập nhật thông tin nhân viên</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>



          {/* Role Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              name="role"
              value={formData.role || 'WAITER'}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="WAITER">Nhân viên phục vụ</option>
              <option value="KITCHEN_STAFF">Nhân viên bếp</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
