import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  fetchBookingDetailAsync,
  cancelBookingAsync,
  manualCheckoutAsync,
} from "../modules/bookings/bookingSlice";
import StatusBadge from "../components/shared/StatusBadge";
import BookingQrCode from "../components/BookingQrCode";
import ReviewForm from "../components/ReviewForm";
import PlatformReviewForm from "../components/PlatformReviewForm";
import { formatBookingPeriod } from "../utils/bookingFormat";
import { formatPolicyDate } from "../utils/cancellationPolicy";
import {
  resolveCustomerBookingStatus,
  canCustomerPay,
} from "../utils/bookingStatus";

const PAYMENT_OPTION_LABELS = {
  full: "Paid in full",
  advance: "Advance paid",
  pay_at_venue: "Pay at venue",
};

function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((state) => state.bookings);

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingDetailAsync(Number(id)));
  }, [dispatch, id]);

  const displayStatus = current ? resolveCustomerBookingStatus(current) : null;
  const awaitingOwnerApproval = displayStatus === "awaiting_approval";
  const awaitingCheckIn =
    current?.show_check_in_qr &&
    current?.check_in_token &&
    !current?.checked_in_at;

  useEffect(() => {
    if (!awaitingOwnerApproval && !awaitingCheckIn) return undefined;
    const interval = setInterval(() => {
      dispatch(fetchBookingDetailAsync(Number(id)));
    }, 10000);
    return () => clearInterval(interval);
  }, [awaitingOwnerApproval, awaitingCheckIn, dispatch, id]);

  const handleCancel = async () => {
    setCancelling(true);
    const result = await dispatch(
      cancelBookingAsync({ id: Number(id), reason }),
    );
    setCancelling(false);
    if (cancelBookingAsync.fulfilled.match(result)) {
      setShowModal(false);
      setReason("");
    }
  };

  const handleTestCheckout = async () => {
    if (
      !window.confirm(
        "Mark this booking as checked out now? (Testing only — unlocks reviews early.)",
      )
    ) {
      return;
    }
    setCheckingOut(true);
    await dispatch(manualCheckoutAsync(Number(id)));
    setCheckingOut(false);
  };

  if (loading && !current) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-rose-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !current) {
    return (
      <div className="max-w-xl">
        <p className="text-rose-600">{error}</p>
        <Link to="/order-history" className="text-sm text-rose-800 mt-2 inline-block hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }
  if (!current) return null;

  const canCancel =
    current.can_cancel ??
    (current.status !== "cancelled" && current.status !== "completed");
  const policy = current.cancellation_policy;
  const refundPreviewPercent = current.refund_percent_if_cancelled ?? 0;
  const refundPreviewAmount = current.refund_amount_if_cancelled ?? 0;
  const canPay = canCustomerPay(current);
  const isRejected = displayStatus === "rejected";
  const canManualCheckout = current.can_manual_checkout === true;

  return (
    <div className="max-w-xl space-y-4">
      <Link to="/order-history" className="text-sm text-rose-800 hover:underline">
        ← My bookings
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {current.venue_name || `Venue #${current.venue_id}`}
            </h1>
            {current.venue_location && (
              <p className="text-sm text-slate-400">{current.venue_location}</p>
            )}
          </div>
          <StatusBadge status={displayStatus} />
        </div>

        {awaitingOwnerApproval && (
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            Booking request sent. Payment unlocks after the venue owner accepts.
            This page updates automatically.
          </p>
        )}

        {canPay && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Owner accepted your request. Pay the full amount or an advance to confirm.
          </p>
        )}

        {isRejected && (
          <div className="text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-red-700 font-medium text-xs mb-1">Rejected by venue owner</p>
            <p className="text-red-600">
              {current.cancellation_reason || "No reason was provided."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Row label="Order ID" value={`#${current.id}`} />
          <Row label="Amount" value={`₹${Number(current.amount).toLocaleString("en-IN")}`} />
          <Row label="Period" value={formatBookingPeriod(current)} className="col-span-2" />
          {current.num_days > 1 && <Row label="Duration" value={`${current.num_days} days`} />}
          {current.payment_status && <Row label="Payment" value={current.payment_status} />}
          {current.payment_option && (
            <Row
              label="Payment plan"
              value={PAYMENT_OPTION_LABELS[current.payment_option] ?? current.payment_option}
            />
          )}
          {Number(current.amount_paid) > 0 && (
            <Row label="Paid" value={`₹${Number(current.amount_paid).toLocaleString("en-IN")}`} />
          )}
          {current.status !== "cancelled" && Number(current.balance_due) > 0 && (
            <Row label="Balance due" value={`₹${Number(current.balance_due).toLocaleString("en-IN")}`} />
          )}
          {current.payment?.paid_at && (
            <Row
              label="Paid at"
              value={new Date(current.payment.paid_at).toLocaleString("en-IN")}
            />
          )}
          {current.checked_out_at && (
            <Row
              label="Checked out"
              value={`${new Date(current.checked_out_at).toLocaleString("en-IN")} (testing)`}
              className="col-span-2"
            />
          )}
        </div>

        {current.notes && (
          <div className="text-sm bg-slate-50 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Notes</p>
            <p className="text-slate-700">{current.notes}</p>
          </div>
        )}

        {!isRejected && current.cancellation_reason && (
          <div className="text-sm bg-rose-50 rounded-xl p-3">
            <p className="text-rose-400 text-xs mb-1">Cancellation reason</p>
            <p className="text-rose-700">{current.cancellation_reason}</p>
          </div>
        )}

        {current.status === "cancelled" && !isRejected && (
          <div className="text-sm bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-1">
            <p className="text-emerald-800 text-xs font-medium">Refund status</p>
            {current.refund_status && (current.refund_amount_if_cancelled ?? 0) > 0 ? (
              <>
                <p className="text-emerald-700">
                  {(current.refund_percent_if_cancelled ?? 0)}% refund of ₹
                  {Number(current.refund_amount_if_cancelled).toLocaleString("en-IN")}
                </p>
                <p className="text-emerald-600 text-xs capitalize">
                  Status: {String(current.refund_status).replace(/_/g, " ")}
                </p>
              </>
            ) : (
              <p className="text-slate-600">
                No refund was issued for this cancellation.
              </p>
            )}
          </div>
        )}

        {policy && current.status !== "cancelled" && (
          <div className="text-sm bg-slate-50 rounded-xl p-3 space-y-2">
            <p className="text-slate-500 text-xs font-medium">Cancellation policy</p>
            <ul className="text-slate-700 space-y-1 text-xs">
              <li>100% refund if cancelled on or before {formatPolicyDate(policy.refund_50_deadline)}</li>
              <li>50% refund if cancelled on or before {formatPolicyDate(policy.refund_25_deadline)}</li>
              <li>25% refund if cancelled on or before {formatPolicyDate(policy.last_cancel_date)}</li>
            </ul>
            {!canCancel && (
              <p className="text-rose-600 text-xs pt-1">
                The last day to cancel this booking has passed.
              </p>
            )}
            {canCancel && refundPreviewPercent > 0 && (
              <p className="text-emerald-700 text-xs pt-1">
                If you cancel now: {refundPreviewPercent}% refund (₹{Number(refundPreviewAmount).toLocaleString("en-IN")})
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2 flex-wrap">
          {canPay && (
            <button
              type="button"
              onClick={() => navigate(`/checkout/${current.id}`)}
              className="flex-1 min-w-[140px] bg-rose-900 hover:bg-rose-950 text-white py-2.5 rounded-xl text-sm font-medium"
            >
              Pay now
            </button>
          )}
          {canCancel && !isRejected && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex-1 min-w-[140px] border border-rose-200 text-rose-600 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-50"
            >
              Cancel order
            </button>
          )}
        </div>

        {canManualCheckout && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Testing
            </p>
            <p className="text-xs text-amber-700">
              Manually mark checkout now to complete this booking early and unlock the review form.
              The checkout date/time will be recorded as now.
            </p>
            <button
              type="button"
              onClick={handleTestCheckout}
              disabled={checkingOut || loading}
              className="w-full border border-amber-400 text-amber-900 bg-white hover:bg-amber-100 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {checkingOut ? "Checking out…" : "Mark checkout (testing)"}
            </button>
          </div>
        )}
      </div>

      {current.show_check_in_qr && current.check_in_token && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Venue check-in</h2>
          {current.checked_in_at ? (
            <div className="space-y-2">
              <p className="text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 font-medium">
                Checked in at {new Date(current.checked_in_at).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500">
                Check-in code used:{" "}
                <code className="font-mono text-slate-700">{current.check_in_token}</code>
              </p>
            </div>
          ) : (
            <BookingQrCode token={current.check_in_token} />
          )}
        </div>
      )}

      {canPay && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          Complete payment (full or advance) to unlock your check-in QR code.
        </div>
      )}

      {current.can_review && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Rate your experience</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              How was your event at {current.venue_name || "this venue"}?
            </p>
          </div>
          <ReviewForm
            venueId={current.venue_id}
            bookingId={current.id}
            googleMapsUrl={current.google_maps_url}
            googleReviewUrl={current.google_review_url}
            onSuccess={() => dispatch(fetchBookingDetailAsync(Number(id)))}
          />
        </div>
      )}

      {current.can_platform_review && (
        <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Step 2 of 2
            </p>
            <h2 className="text-lg font-semibold text-slate-800 mt-1">
              Review BookMyVenue
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              You reviewed the venue. Now tell us about your experience using our platform.
            </p>
          </div>
          <PlatformReviewForm
            bookingId={current.id}
            onSuccess={() => dispatch(fetchBookingDetailAsync(Number(id)))}
          />
        </div>
      )}

      {current.has_review && !current.can_platform_review && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-800">
          {current.has_platform_review
            ? "You reviewed both the venue and BookMyVenue. Thank you for your feedback!"
            : "Your venue review was submitted. Thank you for your feedback!"}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Cancel order</h2>
            {refundPreviewPercent > 0 ? (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                Estimated refund: <span className="font-semibold">{refundPreviewPercent}%</span>
                {" "}(₹{Number(refundPreviewAmount).toLocaleString("en-IN")})
              </p>
            ) : current.status === "booked" ? (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                No refund applies for cancellation at this time.
              </p>
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                Payment has not been completed — no refund will be processed.
              </p>
            )}
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
            )}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              placeholder="Reason for cancellation (optional)"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm hover:bg-slate-50"
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className={`bg-slate-50 rounded-xl p-3 ${className}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

export default BookingDetailPage;
