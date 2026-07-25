import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { fetchMyBookingsAsync } from "../modules/bookings/bookingSlice";
import StatusBadge from "../components/shared/StatusBadge";
import EmptyState from "../components/shared/EmptyState";
import { formatBookingPeriod } from "../utils/bookingFormat";
import {
  resolveCustomerBookingStatus,
  canCustomerPay,
} from "../utils/bookingStatus";

const FILTERS = [
  { key: "", label: "All" },
  { key: "awaiting_approval", label: "Awaiting approval" },
  { key: "pending_payment", label: "Pending payment" },
  { key: "booked", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 10;

function OrderHistoryPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading, error } = useSelector((state) => state.bookings);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    dispatch(fetchMyBookingsAsync({ status: filter, page, limit: PAGE_SIZE }));
  }, [dispatch, filter, page]);

  const bookings = Array.isArray(list) ? list : [];
  const totalItems = pagination?.total_items ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = pagination?.page || page;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track upcoming, pending, and past orders
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-rose-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {pagination && (
          <span className="text-sm text-slate-400 shrink-0">{totalItems} orders</span>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100">
          <EmptyState
            title="No orders found"
            description="Try a different filter or browse venues to book."
            actionLabel="Browse venues"
            actionTo="/venues"
          />
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
          {bookings.map((b) => {
            const displayStatus = resolveCustomerBookingStatus(b);
            const showPay = canCustomerPay(b);
            return (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 truncate">
                      {b.venue_name || `Venue #${b.venue_id}`}
                    </p>
                    <StatusBadge status={displayStatus} />
                  </div>
                  {b.venue_location && (
                    <p className="text-sm text-slate-400 flex items-center gap-1 truncate">
                      <MapPin size={13} className="shrink-0" />
                      {b.venue_location}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-2">{formatBookingPeriod(b)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Order #{b.id} · {new Date(b.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 space-y-1.5">
                  <p className="text-lg font-bold text-slate-800">
                    ₹{Number(b.amount).toLocaleString("en-IN")}
                  </p>
                  {b.payment_status && (
                    <p className="text-xs text-slate-400 capitalize">Payment: {b.payment_status}</p>
                  )}
                  {displayStatus === "awaiting_approval" && (
                    <p className="text-xs text-blue-700 font-medium">Waiting for owner</p>
                  )}
                  {showPay && (
                    <p className="text-xs text-rose-800 font-medium">Pay now</p>
                  )}
                  {displayStatus === "rejected" && (
                    <p className="text-xs text-red-600 font-medium">Rejected by owner</p>
                  )}
                  {displayStatus === "checked_in" && (
                    <p className="text-xs text-teal-700 font-medium">Checked in at venue</p>
                  )}
                  {b.can_review && (
                    <p className="text-xs text-rose-800 font-medium">Write review</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    Details
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && totalItems > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 px-4 py-3">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
