import api from "../../../core/api/client";

export const reviewService = {
  fetchPublicReviews: (limit = 6) =>
    api.get("/reviews/public", { params: { limit } }).then((r) => r.data),

  createReview: ({ venue_id, booking_id, rating, comment }) =>
    api
      .post("/reviews/", { venue_id, booking_id, rating, comment })
      .then((r) => r.data)
      .catch((err) => {
        const message =
          err?.message ||
          err?.response?.data?.detail ||
          "Could not submit review.";
        throw new Error(typeof message === "string" ? message : "Could not submit review.");
      }),

  fetchOwnerReviews: () =>
    api.get("/venue-owners/dashboard/reviews").then((r) => r.data),

  submitReply: (reviewId, replyText) =>
    api
      .post(`/reviews/${reviewId}/reply`, { reply_text: replyText })
      .then((r) => r.data),
};

export const { fetchOwnerReviews, submitReply, createReview } = reviewService;