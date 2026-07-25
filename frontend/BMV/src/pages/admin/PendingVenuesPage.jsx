import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../modules/admin/services/adminService";
import { AdminCard, AdminPageHeader } from "../../components/admin/AdminCard";

function RejectModal({ venue, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Reject venue</h3>
          <p className="text-sm text-slate-500 mt-1">
            Reject <span className="font-medium text-slate-700">{venue.name}</span>?
            You can leave a reason for the owner.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Rejection reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Incomplete photos, unclear location, pricing issues…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Rejecting…" : "Reject venue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  if (children == null || children === "") return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-700 break-words">{children}</dd>
    </div>
  );
}

function PendingVenueCard({ venue, actionId, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(true);
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

  const busy = actionId === venue.id;

  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-lg">{venue.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{venue.location}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
            <span>Owner: {venue.owner_name || "—"}</span>
            <span>₹{Number(venue.price_per_day).toLocaleString("en-IN")}/day</span>
            {venue.venue_type_name && <span>{venue.venue_type_name}</span>}
            {venue.capacity && <span>{venue.capacity} guests</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
          <button
            onClick={() => onApprove(venue.id)}
            disabled={busy}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(venue)}
            disabled={busy}
            className="px-4 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {photos.slice(0, 8).map((url, idx) => (
                <img
                  key={`${url}-${idx}`}
                  src={url}
                  alt={`${venue.name} ${idx + 1}`}
                  className="h-28 w-full object-cover rounded-xl border border-slate-100"
                />
              ))}
            </div>
          )}

          <dl className="space-y-2">
            <DetailRow label="Description">
              {venue.description || <span className="text-slate-400 italic">No description</span>}
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
              {venue.allow_pay_at_venue === false ? " · pay at venue off" : " · pay at venue allowed"}
            </DetailRow>
            <DetailRow label="Cancel policy">
              {venue.refund_50_days_before != null
                ? `${venue.refund_50_days_before} / ${venue.refund_25_days_before} / ${venue.cancel_cutoff_days_before} days (full / 50% / last cancel)`
                : "Not set"}
            </DetailRow>
            <DetailRow label="Submitted">
              {venue.created_at ? new Date(venue.created_at).toLocaleString() : "—"}
            </DetailRow>
          </dl>

          <Link
            to={`/admin/venues/${venue.id}`}
            className="inline-block text-xs text-blue-600 hover:underline font-medium"
          >
            Open full details →
          </Link>
        </div>
      )}
    </AdminCard>
  );
}

function PendingVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadVenues = () => {
    setLoading(true);
    adminService
      .getPendingVenues()
      .then(setVenues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    setError("");
    try {
      await adminService.approveVenue(id);
      loadVenues();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setActionId(rejectTarget.id);
    setError("");
    try {
      await adminService.rejectVenue(rejectTarget.id, reason);
      setRejectTarget(null);
      loadVenues();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Pending Venues"
        subtitle={`${venues.length} awaiting review`}
      />
      {error && <p className="text-rose-600 mb-4 text-sm">{error}</p>}

      {venues.length === 0 ? (
        <AdminCard>
          <p className="text-slate-400 text-sm text-center py-8">No pending venues. All caught up!</p>
        </AdminCard>
      ) : (
        <div className="grid gap-4">
          {venues.map((v) => (
            <PendingVenueCard
              key={v.id}
              venue={v}
              actionId={actionId}
              onApprove={handleApprove}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          venue={rejectTarget}
          busy={actionId === rejectTarget.id}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}

export default PendingVenuesPage;
