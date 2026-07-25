import { useState } from "react";
import { createPlatformReview } from "../modules/reviews/services/reviewService";

function PlatformReviewForm({ bookingId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createPlatformReview({
        booking_id: bookingId,
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Could not submit platform review.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        Thank you for reviewing BookMyVenue! Your feedback may appear on our landing page.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Rate the BookMyVenue platform
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={loading}
              onClick={() => setRating(star)}
              className={`text-2xl transition ${
                star <= rating ? "text-amber-400" : "text-slate-200"
              } disabled:opacity-50`}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tell us about booking with BookMyVenue
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          maxLength={2000}
          disabled={loading}
          placeholder="How was the search, booking, payment, and check-in experience?"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || rating < 1}
        className="w-full rounded-xl bg-rose-700 py-2.5 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit platform review"}
      </button>
    </form>
  );
}

export default PlatformReviewForm;
