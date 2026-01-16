import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi,type CreateStaffPayload,type StaffMember,type UpdateStaffPayload } from '../../../services/staffApi';
import { CreateStaffForm } from './CreateStaffForm';
import { StaffList } from './StaffList';
import { EditStaffModal } from './EditStaffModal';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export const StaffManagement: React.FC = () => {
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const queryClient = useQueryClient();

  // Fetch all staff
  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const response = await staffApi.getAllStaff();
      return response.data || [];
    },
  });

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStaffPayload) => staffApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      setToast({
        message: 'Tài khoản nhân viên đã được tạo thành công!',
        type: 'success',
      });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo tài khoản';
      setToast({ message: errorMsg, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: (params: { staffId: string; data: UpdateStaffPayload }) =>
      staffApi.updateStaff(params.staffId, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      setIsEditModalOpen(false);
      setEditingStaff(null);
      setToast({
        message: 'Thông tin nhân viên đã được cập nhật thành công!',
        type: 'success',
      });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật';
      setToast({ message: errorMsg, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: (staffId: string) => staffApi.deleteStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      setToast({
        message: 'Nhân viên đã được xoá thành công!',
        type: 'success',
      });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Lỗi khi xoá';
      setToast({ message: errorMsg, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const handleEditClick = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (staffId: string, data: UpdateStaffPayload) => {
    updateMutation.mutate({ staffId, data });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-lg font-medium ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Create Staff Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Tạo tài khoản nhân viên mới</h3>
        <CreateStaffForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>

      {/* Staff List Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Danh sách nhân viên</h3>
        <StaffList
          staff={(staffData as StaffMember[]) || []}
          isLoading={isLoadingStaff}
          onEdit={handleEditClick}
          onDelete={(staffId) => deleteMutation.mutate(staffId)}
          isDeleting={deleteMutation.isPending}
        />
      </div>

      {/* Edit Staff Modal */}
      <EditStaffModal
        staff={editingStaff}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};
