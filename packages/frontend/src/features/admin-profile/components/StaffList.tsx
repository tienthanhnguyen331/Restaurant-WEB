import React from 'react';
import type { StaffMember } from '../../../services/staffApi';

interface StaffListProps {
  staff: StaffMember[];
  isLoading?: boolean;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staffId: string) => void;
  isDeleting?: boolean;
}

const getRoleLabel = (role: string): string => {
  return role === 'WAITER' ? 'Nhân viên phục vụ' : 'Nhân viên bếp';
};

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  isLoading = false,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có nhân viên nào. Tạo tài khoản nhân viên mới.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Họ tên</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Vai trò</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-800">{member.email}</td>
              <td className="py-3 px-4 text-gray-800">{member.name}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    member.role === 'WAITER'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {getRoleLabel(member.role)}
                </span>
              </td>
              <td className="py-3 px-4 text-center space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  disabled={isDeleting}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xoá ${member.name}?`)) {
                      onDelete(member.id);
                    }
                  }}
                  disabled={isDeleting}
                  className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
