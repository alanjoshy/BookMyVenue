import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  CalendarCheck,
  CreditCard,
  IndianRupee,
  MapPin,
  ArrowRight,
  Clock,
} from "lucide-react";
import { fetchMyBookingsAsync } from "../modules/bookings/bookingSlice";
import StatusBadge from "../components/shared/StatusBadge";
import EmptyState from "../components/shared/EmptyState";
import { formatBookingPeriod } from "../utils/bookingFormat";
import {
  resolveCustomerBookingStatus,
  canCustomerPay,
} from "../utils/bookingStatus";

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-500",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`inline-flex p-2 rounded-xl ${tones[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const { list: bookings, loading: bookingsLoading, error: bookingsError } = useSelector(
    (state) => state.bookings,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyBookingsAsync({ limit: 20 }));
  }, [dispatch]);

  const bookingList = Array.isArray(bookings) ? bookings : [];

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = bookingList.filter((b) => {
      if (b.status === "cancelled" || b.status === "rejected") return false;
      const end = b.check_out_date || b.booking_date;
      return end && new Date(end) >= today;
    });

    const pendingPayment = bookingList.filter((b) => canCustomerPay(b));
    const awaitingApproval = bookingList.filter(
      (b) => resolveCustomerBookingStatus(b) === "awaiting_approval",
    );
    const totalSpent = bookingList
      .filter((b) => b.status === "booked" || b.status === "completed")
      .reduce((sum, b) => sum + Number(b.amount_paid || b.amount || 0), 0);

    return {
      upcoming: upcoming.length,
      pendingPayment: pendingPayment.length,
      awaitingApproval: awaitingApproval.length,
      total: bookingList.length,
      totalSpent,
      recent: bookingList.slice(0, 6),
      firstPending: pendingPayment[0],
      firstAwaiting: awaitingApproval[0],
    };
  }, [bookingList]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Overview of your bookings and activity
        </p>
      </div>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Upcoming" value={stats.upcoming} tone="rose" />
        <StatCard icon={CreditCard} label="Pending pay" value={stats.pendingPayment} tone="amber" />
        <StatCard icon={MapPin} label="Total bookings" value={stats.total} />
        <StatCard
          icon={IndianRupee}
          label="Total spent"
          value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
          tone="emerald"
        />
      </section>

      {(stats.firstAwaiting || stats.firstPending) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.firstAwaiting && (
            <Link
              to={`/bookings/${stats.firstAwaiting.id}`}
              className="group flex items-start justify-between gap-4 bg-white border border-blue-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
                  <Clock size={14} />
                  Awaiting approval
                </div>
                <p className="font-semibold text-slate-800 truncate">
                  {stats.firstAwaiting.venue_name || "Your booking"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Waiting for the venue owner to accept your request.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-blue-400 group-hover:text-blue-700 shrink-0 mt-1"
              />
            </Link>
          )}

          {stats.firstPending && (
            <Link
              to={`/bookings/${stats.firstPending.id}`}
              className="group flex items-start justify-between gap-4 bg-white border border-amber-100 rounded-2xl p-5 hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
                  <CreditCard size={14} />
                  Payment pending
                </div>
                <p className="font-semibold text-slate-800 truncate">
                  {stats.firstPending.venue_name || "Your booking"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Owner accepted — pay full or advance · ₹
                  {Number(stats.firstPending.amount).toLocaleString("en-IN")}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-amber-400 group-hover:text-amber-700 shrink-0 mt-1"
              />
            </Link>
          )}
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800">Recent bookings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your latest orders</p>
            </div>
            <Link
              to="/order-history"
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-800 hover:underline"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-5">
            {bookingsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : bookingsError ? (
              <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{bookingsError}</p>
            ) : stats.recent.length === 0 ? (
              <EmptyState
                title="No bookings yet"
                description="Browse venues and book your first event."
                actionLabel="Browse venues"
                actionTo="/venues"
              />
            ) : (
              <div className="divide-y divide-slate-100 -my-1">
                {stats.recent.map((b) => (
                  <Link
                    key={b.id}
                    to={`/bookings/${b.id}`}
                    className="flex items-start justify-between gap-4 py-4 first:pt-1 last:pb-1 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {b.venue_name || `Venue #${b.venue_id}`}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{formatBookingPeriod(b)}</p>
                      <p className="text-xs text-slate-400 mt-1">Order #{b.id}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1.5">
                      <StatusBadge status={resolveCustomerBookingStatus(b)} />
                      <p className="text-sm font-bold text-slate-800">
                        ₹{Number(b.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Account</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center text-sm font-bold">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{user?.name || "Your account"}</p>
                <p className="text-sm text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-rose-800 hover:underline"
            >
              View &amp; edit profile
              <ArrowRight size={12} />
            </Link>
          </div>

          <Link
            to="/venues"
            className="block bg-gradient-to-br from-rose-900 to-rose-800 rounded-2xl p-5 text-white hover:from-rose-950 hover:to-rose-900 transition-colors"
          >
            <p className="text-xs uppercase tracking-wide text-rose-200">Explore</p>
            <p className="font-semibold mt-1">Browse venues</p>
            <p className="text-sm text-rose-100/90 mt-1">Find and book your next event space</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium mt-4 text-white">
              Search venues
              <ArrowRight size={12} />
            </span>
          </Link>

          <Link
            to="/order-history"
            className="block bg-white rounded-2xl border border-slate-100 p-5 hover:border-rose-200 hover:shadow-sm transition-all"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wide">Orders</p>
            <p className="font-semibold text-slate-800 mt-1">My bookings</p>
            <p className="text-sm text-slate-400 mt-1">
              Filter by status, pay, cancel, or leave reviews
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
