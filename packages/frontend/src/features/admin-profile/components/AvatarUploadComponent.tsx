import React, { useState, useRef, useEffect } from 'react';

interface AvatarUploadComponentProps {
  currentAvatar?: string;
  onSubmit: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export const AvatarUploadComponent: React.FC<AvatarUploadComponentProps> = ({
  currentAvatar,
  onSubmit,
  isLoading = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync preview with currentAvatar (Cloudinary URL from API)
  // This ensures avatar persists after reload/re-login
  useEffect(() => {
    if (!file) {
      // Only update preview if no file is selected
      // This way, selected file preview is not overwritten by API data
      setPreview(currentAvatar || null);
    }
  }, [currentAvatar, file]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Chỉ hỗ trợ định dạng JPG, JPEG, PNG');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('Kích thước tệp không được vượt quá 2MB');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Vui lòng chọn một hình ảnh');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(file);
      // Clear file selection to allow preview to sync with API data
      setFile(null);
      setPreview(null); // Reset preview, will be updated by useEffect when API data arrives
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải lên avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Preview */}
      <div>
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-3xl">📷</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting || isLoading}
          className="hidden"
          id="avatar-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting || isLoading}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 font-medium"
        >
          Chọn Hình Ảnh
        </button>

        {file && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            <strong>Tệp được chọn:</strong> {file.name}
            <br />
            <strong>Kích thước:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </form>

      <p className="text-xs text-gray-500 text-center">
        Định dạng: JPG, JPEG, PNG | Kích thước tối đa: 2MB
      </p>
    </div>
  );
};
