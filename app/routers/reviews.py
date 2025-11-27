from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from .. import models, schemas
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

@router.post("/", response_model=schemas.Review)
async def create_review(
    review: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_active_user),
):
    """Create a new review for a place."""
    # Check if user already reviewed this place
    existing = await models.Review.find_one(
        models.Review.user_id == current_user.id,
        models.Review.place_id == ObjectId(review.place_id)
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this place")
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    db_review = models.Review(
        user_id=current_user.id,
        place_id=ObjectId(review.place_id),
        rating=review.rating,
        comment=review.comment
    )
    await db_review.insert()
    return db_review

@router.get("/place/{place_id}", response_model=List[schemas.Review])
async def get_place_reviews(place_id: str):
    """Get all reviews for a specific place."""
    reviews = await models.Review.find(
        models.Review.place_id == ObjectId(place_id)
    ).sort(-models.Review.timestamp).to_list()
    return reviews

@router.get("/user", response_model=List[schemas.Review])
async def get_user_reviews(
    current_user: models.User = Depends(get_current_active_user),
):
    """Get all reviews by the current user."""
    reviews = await models.Review.find(
        models.Review.user_id == current_user.id
    ).sort(-models.Review.timestamp).to_list()
    return reviews

@router.put("/{review_id}", response_model=schemas.Review)
async def update_review(
    review_id: str,
    review_update: schemas.ReviewUpdate,
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a review (only by the review author)."""
    db_review = await models.Review.get(ObjectId(review_id))
    
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if db_review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this review")
    
    if review_update.rating is not None:
        if review_update.rating < 1 or review_update.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        db_review.rating = review_update.rating
    
    if review_update.comment is not None:
        db_review.comment = review_update.comment
    
    await db_review.save()
    return db_review

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: models.User = Depends(get_current_active_user),
):
    """Delete a review (only by the review author)."""
    db_review = await models.Review.get(ObjectId(review_id))
    
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if db_review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    await db_review.delete()
    return {"message": "Review deleted successfully"}

@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: str,
):
    """Mark a review as helpful (increment helpful count)."""
    db_review = await models.Review.get(ObjectId(review_id))
    
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db_review.helpful_count += 1
    await db_review.save()
    return {"helpful_count": db_review.helpful_count}
