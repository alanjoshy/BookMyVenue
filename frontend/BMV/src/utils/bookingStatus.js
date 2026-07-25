/**
 * Resolve the customer-facing booking status label key.
 * Owner rejection is stored as status=cancelled + owner_status=rejected.
 */
export function resolveCustomerBookingStatus(booking) {
  if (!booking) return "unknown";
  if (booking.owner_status === "rejected") return "rejected";
  if (booking.status === "completed") return "completed";
  if (booking.checked_in_at) return "checked_in";
  if (booking.status === "pending_payment" && booking.owner_status === "pending") {
    return "awaiting_approval";
  }
  if (booking.status === "pending_payment" && booking.owner_status === "accepted") {
    return "pending_payment";
  }
  return booking.status;
}

export function canCustomerPay(booking) {
  return (
    booking?.status === "pending_payment" && booking?.owner_status === "accepted"
  );
}
