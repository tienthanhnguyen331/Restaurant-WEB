import React from 'react';
import type { StaffMember } from '../../../services/staffApi';

interface StaffListProps {
  staff: StaffMember[];
  isLoading?: boolean;
  onEdit: (staff: StaffMember) => void;
  onDisable: (staffId: string) => void;
  onEnable: (staffId: string) => void;
  isDisabling?: boolean;
  isEnabling?: boolean;
}


const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'WAITER':
      return 'Nhân viên phục vụ';
    case 'KITCHEN_STAFF':
      return 'Nhân viên bếp';
    case 'ADMIN':
      return 'Quản trị viên';
    default:
      return role;
  }
};

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  isLoading = false,
  onEdit,
  onDisable,
  onEnable,
  isDisabling = false,
  isEnabling = false,
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
                      : member.role === 'KITCHEN_STAFF'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {getRoleLabel(member.role)}
                </span>
              </td>
              <td className="py-3 px-4 text-center space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                >
                  Sửa
                </button>
                {member.isVerified === false ? (
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn kích hoạt lại tài khoản ${member.name}?`)) {
                        onEnable(member.id);
                      }
                    }}
                    disabled={isEnabling}
                    className="inline-block px-3 py-1 bg-green-200 text-green-700 rounded hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Kích hoạt
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản ${member.name}?`)) {
                        onDisable(member.id);
                      }
                    }}
                    disabled={isDisabling}
                    className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Vô hiệu hóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
