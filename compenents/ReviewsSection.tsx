
import React, { useState } from 'react';
import { Star, CheckCircle, User, MessageSquarePlus } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'isVerified'>) => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;
    onAddReview(newReview);
    setNewReview({ userName: '', rating: 5, comment: '' });
    setIsFormOpen(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
      />
    ));
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <p className="text-gray-500 mt-1">What our community thinks about this piece.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-full font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <MessageSquarePlus size={18} />
          {isFormOpen ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-lg font-bold mb-6">Share your experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                required
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 h-[50px] items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      size={20}
                      className={star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
            <textarea
              required
              rows={4}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              placeholder="Tell us what you liked or disliked..."
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Submit Review
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
          <User className="mx-auto text-gray-300 mb-4" size={40} />
          <p className="text-gray-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 flex items-center gap-2">
                      {review.userName}
                      {/* FIX: Move title attribute to a wrapper span because Lucide components do not support title prop directly */}
                      {review.isVerified && (
                        <span title="Verified Buyer">
                          <CheckCircle size={14} className="text-emerald-500" />
                        </span>
                      )}
                    </h5>
                    <p className="text-xs text-gray-400 font-medium">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
