import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewApi } from './services/review-api';
import { getCurrentUser } from '../auth/hooks/useAuth';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';
import type { Review } from './types';

export const ReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const menuItemId = searchParams.get('menu_item_id') || '';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewApi.getAll(menuItemId);
      setReviews(data);

      if (menuItemId) {
        const avgData = await reviewApi.getAverageRating(menuItemId);
        setAverageRating(avgData.average_rating);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [menuItemId]);

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    if (!menuItemId) {
      alert('Không tìm thấy thông tin món ăn để đánh giá.');
      return;
    }
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        alert('Bạn cần đăng nhập để gửi đánh giá.');
        // Optional: Redirect to login
        return; 
      }
      
      console.log('Submitting review:', { 
        user_id: currentUser.id, 
        menu_item_id: menuItemId, 
        ...data 
      });

      await reviewApi.create({
        user_id: currentUser.id,
        menu_item_id: menuItemId,
        rating: data.rating,
        comment: data.comment,
      });
      alert('Đánh giá của bạn đã được gửi!');
      setShowForm(false);
      fetchReviews();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      alert(`Gửi thất bại: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đánh giá món ăn</h1>

      <div className="bg-blue-50 p-4 rounded mb-6">
        <div className="text-sm text-gray-600">Đánh giá trung bình</div>
        <div className="text-3xl font-bold text-blue-600">
          {averageRating.toFixed(1)} / 5.0
        </div>
        <div className="text-sm text-gray-500">{reviews.length} đánh giá</div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded mb-6 hover:bg-blue-700"
        >
          Viết đánh giá
        </button>
      ) : (
        <div className="mb-6 border p-4 rounded">
          <ReviewForm
            menuItemId={menuItemId}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ReviewList reviews={reviews} />
    </div>
  );
};