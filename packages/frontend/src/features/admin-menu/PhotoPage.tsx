import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { photoApi } from '../../services/photoApi';

export const PhotoPage: React.FC = () => {
  const params = useParams<{ itemId: string }>();
  
  // MẸO: Thay chuỗi UUID dưới đây bằng 1 ID món ăn THẬT trong DB của bạn
  const itemId = params.itemId || "a890a720-4a06-4fc2-80be-6f7b08708b40"; 
  
  const [photos, setPhotos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const data = await photoApi.getByItem(itemId);
      setPhotos(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPhotos(); }, [itemId]);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        await photoApi.upload(itemId, e.target.files);
        alert("Import hình ảnh thành công!");
        fetchPhotos(); // Load lại ảnh mới
      } catch (err) { alert("Lỗi khi import!"); }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div 
        onClick={handleImportClick}
        className="w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all"
      >
        <span className="text-4xl mb-2">📸</span>
        <span className="text-indigo-600 font-semibold text-lg">Nhấn để Import hình ảnh</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          className="hidden" 
          accept="image/*" 
        />
      </div>

      {/* Hiển thị danh sách ảnh đã import */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {photos.map(p => (
          <div key={p.id} className="relative aspect-square border rounded-lg overflow-hidden group">
            <img src={`http://localhost:3000${p.url}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};