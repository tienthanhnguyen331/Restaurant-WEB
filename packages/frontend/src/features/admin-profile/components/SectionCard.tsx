import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  isEditing: boolean;
  isLoading?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave?: () => void;
  isDisabled?: boolean;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  isEditing,
  isLoading = false,
  onEdit,
  onCancel,
  onSave,
  isDisabled = false,
  children,
}) => {
  return (
    <div
      className={`rounded-lg shadow transition-all ${
        isEditing
          ? 'bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={isDisabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu'
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 transition-all ${isEditing ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};
