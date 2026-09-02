import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Sparkles } from 'lucide-react';
import { submitReview } from '../../services/firebase/reviews';
import { useStore } from '../../shared/context/StoreContext';
import { Product } from '../../shared/types';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess?: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { customerUser, customerProfile, showToast } = useStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState(customerProfile?.displayName || customerUser?.displayName || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await submitReview({
        productId: product.id,
        productName: product.name,
        userId: customerUser?.uid,
        userName: name.trim() || 'Verified Buyer',
        userEmail: customerUser?.email || '',
        rating,
        title: title.trim() || 'Great Product',
        comment: comment.trim(),
        verifiedPurchase: Boolean(customerUser),
      });

      showToast('Thank you! Your review has been submitted.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-none shadow-2xl border border-zinc-200 overflow-hidden z-10"
        >
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div>
              <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">Write a Review</span>
              <h3 className="text-base font-semibold text-zinc-900 truncate max-w-xs">{product.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-none text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 fill-zinc-100'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-medium text-zinc-600">
                  {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asad K."
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-none focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Headline / Review Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stunning build quality and soundstage"
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-none focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Detailed Review</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your hands-on experience with this ARC hardware..."
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-none focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-medium rounded-none transition-all shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
