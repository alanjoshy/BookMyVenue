import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  initiatePaymentAsync,
  confirmPaymentAsync,
  resetPayment,
  clearPaymentError,
} from "../modules/payments/paymentSlice";
import { fetchBookingDetailAsync } from "../modules/bookings/bookingSlice";
import { canCustomerPay } from "../utils/bookingStatus";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector((state) => state.payments);
  const { current: booking, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentOption, setPaymentOption] = useState("full");
  const [orderReady, setOrderReady] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingDetailAsync(Number(bookingId)));
    return () => {
      dispatch(resetPayment());
    };
  }, [dispatch, bookingId]);

  const bookingReady =
    booking && Number(booking.id) === Number(bookingId);
  const canPay = bookingReady && canCustomerPay(booking);
  const total = bookingReady ? Number(booking.amount) : 0;
  const advancePct = bookingReady ? Number(booking.advance_percent ?? 30) : 30;
  const advanceAmount = Math.round((total * advancePct) / 100 * 100) / 100;

  const startPayment = useCallback(
    (option) => {
      setLocalError("");
      dispatch(clearPaymentError());
      setOrderReady(false);
      dispatch(
        initiatePaymentAsync({
          bookingId: Number(bookingId),
          paymentOption: option,
        }),
      ).then((action) => {
        if (initiatePaymentAsync.fulfilled.match(action)) {
          setOrderReady(true);
        }
      });
    },
    [bookingId, dispatch],
  );

  const handleRazorpayPay = useCallback(async () => {
    if (!current?.gateway_order_id) {
      setLocalError("Payment order is not ready. Please try again.");
      return;
    }

    setLocalError("");
    dispatch(clearPaymentError());
    setPaying(true);

    try {
      await loadRazorpayScript();
    } catch (err) {
      setLocalError(err.message || "Could not load Razorpay");
      setPaying(false);
      return;
    }

    const key = current.key_id;
    if (!key) {
      setLocalError("Razorpay key is not configured on the server.");
      setPaying(false);
      return;
    }

    const options = {
      key,
      amount: Math.round(Number(current.amount) * 100),
      currency: current.currency || "INR",
      order_id: current.gateway_order_id,
      name: "BookMyVenue",
      description: `Booking #${bookingId}`,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone_number || "",
      },
      theme: { color: "#881337" },
      handler: async (response) => {
        const result = await dispatch(
          confirmPaymentAsync({
            payment_id: current.payment_id,
            gateway_order_id: response.razorpay_order_id,
            gateway_payment_id: response.razorpay_payment_id,
            gateway_signature: response.razorpay_signature,
          }),
        );
        setPaying(false);
        if (confirmPaymentAsync.fulfilled.match(result)) {
          setTimeout(() => navigate(`/bookings/${bookingId}`), 1200);
        }
      },
      modal: {
        ondismiss: () => {
          setPaying(false);
          setLocalError("Payment cancelled. You can try again when ready.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (resp) => {
      setPaying(false);
      setLocalError(resp.error?.description || "Payment failed at Razorpay.");
    });
    razorpay.open();
  }, [bookingId, current, dispatch, navigate, user]);

  const displayError = localError || error;
  const amountInr = current ? Number(current.amount).toLocaleString("en-IN") : null;

  return (
    <div className="max-w-lg space-y-4">
      <Link to={`/bookings/${bookingId}`} className="text-sm font-medium text-rose-800 hover:underline">
        ← Back to booking
      </Link>
      <p className="text-sm text-slate-500">Pay for booking #{bookingId}</p>

      {(bookingLoading && !bookingReady) && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-rose-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {bookingReady && !canPay && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl">
          {booking.owner_status === "pending"
            ? "Payment unlocks after the venue owner accepts your booking request."
            : booking.owner_status === "rejected"
              ? "This booking was rejected — payment is not available."
              : "This booking is not awaiting payment."}
        </p>
      )}

      {bookingReady && canPay && !orderReady && (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Total booking amount:{" "}
            <span className="font-semibold text-slate-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Choose how to pay
            </p>
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                paymentOption === "full"
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="full"
                checked={paymentOption === "full"}
                onChange={() => setPaymentOption("full")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">Pay in full</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  ₹{total.toLocaleString("en-IN")} now
                </span>
              </span>
            </label>
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                paymentOption === "advance"
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="advance"
                checked={paymentOption === "advance"}
                onChange={() => setPaymentOption("advance")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Pay {advancePct}% advance
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  ₹{advanceAmount.toLocaleString("en-IN")} now · remaining at venue
                </span>
              </span>
            </label>
          </div>

          {displayError && (
            <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{displayError}</p>
          )}

          <button
            type="button"
            onClick={() => startPayment(paymentOption)}
            disabled={loading}
            className="w-full rounded-xl bg-rose-900 py-3 text-sm font-semibold text-white hover:bg-rose-950 disabled:opacity-50"
          >
            {loading ? "Preparing order…" : "Continue to payment"}
          </button>
        </div>
      )}

      {displayError && orderReady && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{displayError}</p>
      )}

      {current && orderReady && (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Plan</span>
            <span className="capitalize text-slate-700">
              {current.payment_type === "advance" ? `${advancePct}% advance` : "Full payment"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment ID</span>
            <span className="font-mono text-slate-700">{current.payment_id}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-500">Pay now</span>
            <span className="text-2xl font-bold text-slate-900">₹{amountInr}</span>
          </div>
          {current.balance_due != null && Number(current.balance_due) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Balance after this payment</span>
              <span className="text-slate-700">
                ₹{Number(current.balance_due).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {current.status === "paid" ? (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              Payment successful. Redirecting to your booking — your check-in QR is ready.
            </p>
          ) : current.status === "failed" ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                Payment failed. Please try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrderReady(false);
                  dispatch(resetPayment());
                }}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Choose payment option again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRazorpayPay}
                disabled={loading || paying || !current.gateway_order_id}
                className="w-full rounded-xl bg-rose-900 py-3 text-sm font-semibold text-white hover:bg-rose-950 disabled:opacity-50"
              >
                {paying || loading ? "Opening Razorpay..." : "Pay with Razorpay"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderReady(false);
                  dispatch(resetPayment());
                }}
                className="w-full text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                Change payment option
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
