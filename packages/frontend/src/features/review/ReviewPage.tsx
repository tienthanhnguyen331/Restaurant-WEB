import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewApi } from './services/review-api';
import { ReviewList } from './components/ReviewList';
import type { Review } from './types';

export const ReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const menuItemId = searchParams.get('menu_item_id') || '';
  const [reviews, setReviews] = useState<Review[]>([]);

  // Gọi API lấy danh sách khi trang vừa load
  useEffect(() => {
    reviewApi.getAll(menuItemId).then((data) => {
        // Kiểm tra an toàn để tránh lỗi nếu API trả về null
        if (Array.isArray(data)) {
            setReviews(data);
        } else {
            setReviews([]);
        }
    }).catch(err => console.error(err));
  }, [menuItemId]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đánh giá món ăn</h1>
      
      {/* Ở Commit 1: Chỉ hiển thị danh sách, chưa có Form nhập */}
      <ReviewList reviews={reviews} />
    </div>
  );
};
