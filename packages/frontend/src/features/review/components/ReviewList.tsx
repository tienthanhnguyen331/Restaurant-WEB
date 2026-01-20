import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../types';

export const ReviewList: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (reviews.length === 0) return <p className="text-gray-500 py-4">Chưa có đánh giá nào.</p>;
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {review.user?.avatar ? (
                <img src={review.user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-500">
                  {(review.user?.displayName || review.user?.name || 'K').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="font-semibold">
              {review.user?.displayName || review.user?.name || 'Khách vãng lai'}
            </p>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(review.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};
