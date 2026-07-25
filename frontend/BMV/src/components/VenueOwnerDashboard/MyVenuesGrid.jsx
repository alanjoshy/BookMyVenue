import { Link } from "react-router-dom";
import { MapPin, Star, Users, IndianRupee } from "lucide-react";

const PLACEHOLDER_COLORS = ["#3b1f2b", "#1f2937", "#4a2c1a", "#1e3a3a", "#3a1e3a"];

const STATUS_BADGE = {
  approved: "bg-emerald-500 text-white",
  pending: "bg-amber-500 text-white",
  pending_approval: "bg-amber-500 text-white",
  rejected: "bg-rose-500 text-white",
};

const STATUS_LABEL = {
  approved: "Approved",
  pending: "Pending",
  pending_approval: "Pending",
  rejected: "Rejected",
};

function placeholderColorFor(id) {
  const index = Number(id) % PLACEHOLDER_COLORS.length;
  return PLACEHOLDER_COLORS[Number.isNaN(index) ? 0 : index];
}

function VenueCard({ venue }) {
  const placeholderColor = placeholderColorFor(venue.id);
  const hasRating = venue.average_rating != null && venue.average_rating > 0;
  const isRejected = venue.approval_status === "rejected";
  const isApproved = venue.approval_status === "approved";
  const cover =
    venue.images?.find((img) => img.is_cover)?.url ||
    venue.images?.[0]?.url ||
    venue.image_url ||
    null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div
        className="h-32 relative"
        style={
          cover
            ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(135deg, ${placeholderColor}, ${placeholderColor}cc)` }
        }
      >
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            STATUS_BADGE[venue.approval_status] || STATUS_BADGE.pending
          }`}
        >
          {STATUS_LABEL[venue.approval_status] || venue.approval_status}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-rose-900 leading-snug">{venue.name}</h4>
          <span className="flex items-center gap-1 shrink-0 mt-0.5">
            <Star size={13} className={hasRating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
            <span className={`text-xs font-medium ${hasRating ? "text-gray-700" : "text-gray-400"}`}>
              {hasRating ? venue.average_rating : "N/A"}
            </span>
          </span>
        </div>

        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <MapPin size={12} /> {venue.location}
        </p>

        {isRejected && (
          <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1.5 line-clamp-2">
            {venue.rejection_reason
              ? `Rejected: ${venue.rejection_reason}`
              : "Rejected — edit and request approval again."}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={13} /> {venue.capacity ?? "—"} Guests
          </span>
          <span className="flex items-center gap-0.5 font-semibold text-gray-700">
            <IndianRupee size={12} />
            {Number(venue.price_per_day).toLocaleString("en-IN")}/day
          </span>
        </div>

        <Link
          to={
            isApproved
              ? `/owner/venues/${venue.id}/manage`
              : `/owner/venues/${venue.id}/edit`
          }
          className="block w-full mt-3 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-xs font-semibold text-center transition-colors"
        >
          {isRejected ? "Edit & resubmit" : isApproved ? "Manage" : "Edit details"}
        </Link>
      </div>
    </div>
  );
}

function MyVenuesGrid({ venues, loading }) {
  const list = venues ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-rose-900">My Venues</h3>
        <Link to="/owner/venues" className="text-xs font-medium text-rose-700 hover:underline">
          View all venues
        </Link>
      </div>

      {!loading && list.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-500">No venues yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Add a venue from{" "}
            <Link to="/owner/venues" className="text-rose-700 hover:underline">
              My Venues
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-gray-50 animate-pulse" />
              ))
            : list.map((v) => <VenueCard key={v.id} venue={v} />)}
        </div>
      )}
    </div>
  );
}

export default MyVenuesGrid;
