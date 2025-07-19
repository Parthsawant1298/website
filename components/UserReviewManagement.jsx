"use client"

import { AlertCircle, Edit, Plus, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function UserReviewManagement() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    fetchUserReviews()
  }, [])

  const fetchUserReviews = async () => {
    try {
      const response = await fetch('/api/user/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/user/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReviews(reviews.filter(review => review._id !== reviewId))
        alert('Review deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const handleEditSubmit = async (reviewId, updatedData) => {
    try {
      const response = await fetch(`/api/user/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(reviews.map(review => 
          review._id === reviewId ? data.review : review
        ))
        setEditingReview(null)
        alert('Review updated successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update review')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Failed to update review')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-20 bg-gray-200 rounded mb-3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <Link
          href="/products"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h2>
          <p className="text-gray-500 mb-6">Start reviewing products you've purchased</p>
          <Link
            href="/products"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
              isEditing={editingReview?._id === review._id}
              onEditSubmit={handleEditSubmit}
              onCancelEdit={() => setEditingReview(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review, onEdit, onDelete, isEditing, onEditSubmit, onCancelEdit }) {
  const [editForm, setEditForm] = useState({
    rating: review.rating,
    comment: review.comment,
    editReason: ''
  })

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ))
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    if (editForm.comment.trim().length < 10) {
      alert('Comment must be at least 10 characters long')
      return
    }
    onEditSubmit(review._id, editForm)
  }

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={review.product.mainImage || '/placeholder-product.jpg'}
              alt={review.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{review.product.name}</h3>
              <p className="text-gray-600">₹{review.product.price}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditForm({...editForm, rating: star})}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={star <= editForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Comment
            </label>
            <textarea
              value={editForm.comment}
              onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows="4"
              required
              minLength="10"
            />
          </div>

          {/* Display existing review images in edit mode */}
          {review.images && review.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Review Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                {review.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Note: Image editing is not yet supported. To change images, please delete and create a new review.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Edit (Optional)
            </label>
            <input
              type="text"
              value={editForm.editReason}
              onChange={(e) => setEditForm({...editForm, editReason: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Fixed typo, Updated experience..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Update Review
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <img
            src={review.product.mainImage || '/placeholder-product.jpg'}
            alt={review.product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{review.product.name}</h3>
            <p className="text-gray-600">₹{review.product.price}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">{renderStars(review.rating)}</div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(review)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit review"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(review._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete review"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Display review images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Review Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Review image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => window.open(image.url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {review.isEdited && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Edit size={14} />
          <span>Edited on {new Date(review.lastEditedAt).toLocaleDateString()}</span>
        </div>
      )}

      {review.aiAnalysis && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">AI Analysis:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              // Check both nested and root level agentApproval (compatibility fix)
              (() => {
                const agentApproval = review.aiAnalysis.agentApproval || review.agentApproval;
                if (agentApproval) {
                  return agentApproval.displayIndicator === 'green' ? 'bg-green-100 text-green-800' :
                         agentApproval.displayIndicator === 'red' ? 'bg-red-100 text-red-800' :
                         'bg-yellow-100 text-yellow-800';
                } else {
                  // Fallback to classification if no agentApproval
                  return review.aiAnalysis.classification === 'genuine' ? 'bg-green-100 text-green-800' :
                         review.aiAnalysis.classification === 'suspicious' ? 'bg-red-100 text-red-800' :
                         'bg-yellow-100 text-yellow-800';
                }
              })()
            }`}>
              {/* Display the user-friendly status */}
              {(() => {
                const agentApproval = review.aiAnalysis.agentApproval || review.agentApproval;
                return agentApproval ? 
                  (agentApproval.userDisplayStatus || review.aiAnalysis.classification) : 
                  review.aiAnalysis.classification;
              })()}
            </span>
            {review.aiAnalysis.needsManualReview && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={14} />
                <span className="text-xs">Under Review</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
