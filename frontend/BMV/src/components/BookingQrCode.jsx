import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildCheckInQrValue } from "../utils/checkInQr";

function BookingQrCode({ token, size = 180 }) {
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <QRCodeSVG value={buildCheckInQrValue(token)} size={size} level="M" />
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
          Check-in code
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-center font-mono text-sm tracking-wider bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 break-all">
            {token}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center">
          Show this QR code or tell the venue staff your check-in code.
        </p>
      </div>
    </div>
  );
}

export default BookingQrCode;
