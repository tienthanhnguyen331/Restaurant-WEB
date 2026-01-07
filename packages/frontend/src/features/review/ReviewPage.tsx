import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewApi } from './services/review-api';
import { ReviewList } from './components/ReviewList';
import type { Review } from './types';
import { ReviewForm } from './components/ReviewForm';

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

    {/* Dữ liệu giả để test tính năng đánh giá */}
      <ReviewForm 
  menuItemId={menuItemId} 
  onSubmit={(data) => {
    reviewApi.create({ 
      ...data, 
      menu_item_id: '41a67a2b-af69-4a71-a418-b2e3a026fedb', 
      user_id: '4ae74b8f-8402-41f7-8cd6-0a6145885601' 
    })
    .then((newReview) => {
       alert('Gửi thành công!'); // Báo để biết là chạy được
       setReviews((prev) => [newReview, ...prev]);
    })
    .catch(err => {
       console.error(err);
       alert('Lỗi rồi: Xem console để biết chi tiết');
    });
  }} 
/>
    </div>
  );
};
