import { useState } from "react";

/**
 * Modal for venue owners to reject a booking with an optional reason.
 */
function RejectBookingModal({ open, onClose, onConfirm, loading = false }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm((reason || "").trim() || undefined);
  };

  const handleClose = () => {
    if (loading) return;
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Reject booking</h2>
          <p className="text-sm text-slate-500 mt-1">
            The customer will see this reason on their booking. You can leave it blank.
          </p>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          disabled={loading}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-50"
          placeholder="Reason for rejection (optional)"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Keep request
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? "Rejecting…" : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectBookingModal;
