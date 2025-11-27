import React from 'react';
import { Star, ThumbsUp, User as UserIcon } from 'lucide-react';

interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    helpful_count: number;
    timestamp: string;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

interface ReviewCardProps {
    review: Review;
    onMarkHelpful?: (reviewId: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onMarkHelpful }) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {review.user?.avatar_url ? (
                        <img
                            src={review.user.avatar_url}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                            {review.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700 text-sm mb-3">{review.comment}</p>

                    {onMarkHelpful && (
                        <button
                            onClick={() => onMarkHelpful(review.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({review.helpful_count})</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
