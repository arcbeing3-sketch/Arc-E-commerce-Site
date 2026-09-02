import React, { useState, useEffect } from 'react';
import { Review } from '../../shared/types';
import { subscribeToAllReviews, updateReviewStatus, deleteReview } from '../../services/firebase/reviews';
import { formatDateShort } from '../../shared/utils/formatters';
import { Star, CheckCircle2, XCircle, Trash2, MessageSquare, ShieldCheck } from 'lucide-react';

interface AdminReviewsPageProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ showToast }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllReviews((revs) => {
      setReviews(revs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      showToast(`Review marked as ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update review status.', 'error');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await deleteReview(reviewId);
        showToast('Review removed.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete review.', 'error');
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs">
        <h2 className="text-xl font-bold text-zinc-900">Customer Feedback & Reviews</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Moderate verified buyer ratings, reviews, and customer satisfaction feedback.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
          <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800">No customer reviews yet</h3>
          <p className="text-xs text-zinc-500">Reviews submitted by buyers on product pages will appear here for moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-100'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{rev.title}</h4>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="font-semibold text-zinc-700">{rev.userName}</span>
                  <span>{formatDateShort(rev.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
