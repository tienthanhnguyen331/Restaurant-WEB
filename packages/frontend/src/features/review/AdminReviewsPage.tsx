import React, { useEffect, useState } from 'react';
import { reviewApi } from './services/review-api';
import type { Review } from './types';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Gọi API lấy tất cả review (menuItemId = undefined), page hiện tại, limit = 10
      const response = await reviewApi.getAll(undefined, page, 10);
      // Kiểm tra: nếu là mảng thì dùng luôn, nếu là object phân trang thì lấy .data
      const reviewsData = Array.isArray(response) ? response : (response?.data || []);

      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
      } else {
        console.error('Data received is not an array:', response);
        setReviews([]);
      }

      // Cập nhật tổng số trang từ metadata
      if (!Array.isArray(response) && response?.meta) {
        setTotalPages(response.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách đánh giá...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Đánh giá</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Món ăn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có đánh giá nào.</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.menu_item?.name || `ID: ${review.menu_item_id.slice(0,8)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex text-yellow-500">
                      {'★'.repeat(review.rating)}
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={review.comment}>
                    {review.comment || (
                        <span className="italic text-gray-400">Không có nội dung</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="text-sm text-gray-700">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
