import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Star, User, Send, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', image: '' });
  const [submitting, setSubmitting] = useState(false);

  // 🔥 1. Real-time Reviews Fetching
  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by latest (Javascript mein sorting safe rehti hai)
      reviewsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setReviews(reviewsData);
    });

    return () => unsubscribe();
  }, [productId]);

  // 🔥 2. Submit Review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
        toast.error("Please login to write a review!");
        return;
    }
    if (!newReview.comment.trim()) {
        toast.error("Please write something...");
        return;
    }
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous User",
        userAvatar: currentUser.photoURL,
        rating: newReview.rating,
        comment: newReview.comment,
        image: newReview.image, // Review Image URL
        createdAt: serverTimestamp()
      });

      setNewReview({ rating: 5, comment: '', image: '' }); // Form Reset
      toast.success("Review Added! 🌟");

    } catch (error) {
      console.error(error);
      toast.error("Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Average Rating Calculate karna
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      
      {/* HEADER: Average Rating */}
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} />
                    ))}
                </div>
                <span className="font-bold text-gray-700">{averageRating} out of 5</span>
                <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
            </div>
        </div>
      </div>

      {/* REVIEW FORM (Sirf Login wale users ke liye) */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl mb-10 border border-gray-200">
            <h3 className="font-bold mb-4">Write a Review</h3>
            
            {/* Star Selection */}
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star} 
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`transition-transform hover:scale-110 ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        <Star size={28} fill="currentColor" />
                    </button>
                ))}
            </div>

            {/* Comment Input */}
            <textarea 
                placeholder="How was the product? Share your experience..." 
                className="w-full p-4 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-violet-500"
                rows="3"
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            ></textarea>

            {/* Image URL Input (Abhi ke liye URL) */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <ImageIcon size={18} className="absolute top-3 left-3 text-gray-400"/>
                    <input 
                        type="url" 
                        placeholder="Paste image link (optional)" 
                        className="w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                        value={newReview.image}
                        onChange={(e) => setNewReview({...newReview, image: e.target.value})}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-violet-700 disabled:opacity-50"
                >
                    {submitting ? "Posting..." : <><Send size={18}/> Post Review</>}
                </button>
            </div>
        </form>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-center">
            Please <b>Login</b> to write a review.
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
        ) : (
            reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        {review.userAvatar ? (
                            <img src={review.userAvatar} alt="User" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                                <User size={20}/>
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                            <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                             {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                    
                    {/* Review Image (Agar hai to dikhao) */}
                    {review.image && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border bg-gray-50">
                            <img src={review.image} alt="Review attachment" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"/>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>

    </div>
  );
};

export default ProductReviews;