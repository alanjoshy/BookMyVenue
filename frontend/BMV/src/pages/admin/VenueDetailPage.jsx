import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminService } from "../../modules/admin/services/adminService";
import {
  AdminFormLayout,
  AdminLoading,
} from "../../components/admin/AdminForm";
import { StatusBadge } from "../../components/admin/AdminCard";

function DetailRow({ label, children }) {
  if (children == null || children === "") return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
      <dt className="text-slate-400 font-medium">{label}</dt>
      <dd className="text-slate-800 break-words">{children}</dd>
    </div>
  );
}

function VenueDetailPage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService
      .getVenue(id)
      .then(setVenue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AdminLoading />;

  if (error || !venue) {
    return (
      <AdminFormLayout
        title="Venue details"
        backTo="/admin/venues"
        error={error || "Venue not found"}
      >
        <Link to="/admin/venues" className="text-sm text-blue-600 hover:underline">
          ← Back to venues
        </Link>
      </AdminFormLayout>
    );
  }

  const photos = venue.images?.length
    ? [...venue.images]
        .sort((a, b) => {
          if (Boolean(a.is_cover) !== Boolean(b.is_cover)) return a.is_cover ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
        .map((img) => img.url)
    : venue.image_url
      ? [venue.image_url]
      : [];

  return (
    <AdminFormLayout
      title={venue.name}
      subtitle={`Venue #${venue.id} · Owner: ${venue.owner_name || "—"}`}
      backTo="/admin/venues"
    >
      <div className="flex flex-wrap gap-2 mb-5">
        <StatusBadge status={venue.approval_status} />
        <StatusBadge status={venue.is_active ? "active" : "inactive"} />
      </div>

      {venue.approval_status === "rejected" && venue.rejection_reason && (
        <div className="mb-5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
          <span className="font-medium">Rejection reason:</span> {venue.rejection_reason}
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {photos.map((url, idx) => (
            <img
              key={`${url}-${idx}`}
              src={url}
              alt={`${venue.name} ${idx + 1}`}
              className="h-32 w-full object-cover rounded-xl border border-slate-100"
            />
          ))}
        </div>
      )}

      <dl>
        <DetailRow label="Location">{venue.location}</DetailRow>
        <DetailRow label="Type">{venue.venue_type_name || "—"}</DetailRow>
        <DetailRow label="Owner">{venue.owner_name || "—"}</DetailRow>
        <DetailRow label="Price / day">
          ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
        </DetailRow>
        <DetailRow label="Capacity">
          {venue.capacity != null ? `${venue.capacity} guests` : "—"}
        </DetailRow>
        <DetailRow label="Description">
          {venue.description || (
            <span className="text-slate-400 italic">No description</span>
          )}
        </DetailRow>
        <DetailRow label="Amenities">
          {venue.amenities?.length
            ? venue.amenities.map((a) => a.name).join(", ")
            : "—"}
        </DetailRow>
        <DetailRow label="Maps link">
          {venue.google_maps_url ? (
            <a
              href={venue.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {venue.google_maps_url}
            </a>
          ) : (
            "—"
          )}
        </DetailRow>
        <DetailRow label="Review link">
          {venue.google_review_url ? (
            <a
              href={venue.google_review_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {venue.google_review_url}
            </a>
          ) : (
            "—"
          )}
        </DetailRow>
        <DetailRow label="Advance">
          {venue.advance_percent != null ? `${venue.advance_percent}%` : "—"}
          {venue.allow_pay_at_venue === false
            ? " · pay at venue off"
            : " · pay at venue allowed"}
        </DetailRow>
        <DetailRow label="Cancel policy">
          {venue.refund_50_days_before != null
            ? `${venue.refund_50_days_before} / ${venue.refund_25_days_before} / ${venue.cancel_cutoff_days_before} days (full / 50% / last cancel)`
            : "Not set"}
        </DetailRow>
        <DetailRow label="Created">
          {venue.created_at ? new Date(venue.created_at).toLocaleString() : "—"}
        </DetailRow>
        <DetailRow label="Updated">
          {venue.updated_at ? new Date(venue.updated_at).toLocaleString() : "—"}
        </DetailRow>
      </dl>
    </AdminFormLayout>
  );
}

export default VenueDetailPage;
