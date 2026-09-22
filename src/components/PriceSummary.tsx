import React from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatRupiah, MAX_CALCULATOR_PRICE } from '../utils/pricing';

interface PriceSummaryProps {
  subtotalA: number;
  subtotalB: number;
  totalAddons: number;
  grandTotal: number;
  isCapped: boolean;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  submitError?: string;
  failSafeNotice?: string;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  subtotalA,
  subtotalB,
  totalAddons,
  grandTotal,
  isCapped,
  isSubmitting,
  onSubmitOrder,
  submitError,
  failSafeNotice,
}) => {
  const isZero = grandTotal === 0;

  return (
    <div
      id="price-summary-panel"
      className="p-6 bg-white border border-neutral-200 rounded-lg shadow-none space-y-5"
    >
      <div>
        <h3 className="text-base font-bold text-neutral-900">Ringkasan Estimasi Pesanan</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Kalkulasi deterministik instan tanpa biaya tersembunyi.</p>
      </div>

      {/* Line Item Breakdown */}
      <div className="space-y-2.5 text-sm border-t border-b border-neutral-200 py-4">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Subtotal Lini A (Artisan Bakery)</span>
          <span className="font-medium text-neutral-900">{formatRupiah(subtotalA)}</span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>Subtotal Lini B (Catering &amp; Nasi Box)</span>
          <span className="font-medium text-neutral-900">{formatRupiah(subtotalB)}</span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>Total Pilihan Tambahan (Add-ons)</span>
          <span className="font-medium text-neutral-900">{formatRupiah(totalAddons)}</span>
        </div>

        {isCapped && (
          <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-700">
            Total melebihi batas batas kalkulator publik ({formatRupiah(MAX_CALCULATOR_PRICE)}). Estimasi ditampilkan pada batas maksimum.
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Grand Total Estimasi
          </span>
          <span className="text-xs text-neutral-500">Harga final dikonfirmasi di WhatsApp</span>
        </div>
        <div className="text-right">
          <span
            id="grand-total-amount"
            className="text-2xl font-black text-neutral-900 tracking-tight"
          >
            {formatRupiah(grandTotal)}
          </span>
        </div>
      </div>

      {/* Fail safe notice banner */}
      {failSafeNotice && (
        <div
          id="fail-safe-banner"
          className="p-3 bg-neutral-50 border border-neutral-300 rounded-lg flex items-start gap-2.5 text-xs text-neutral-800"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>{failSafeNotice}</p>
        </div>
      )}

      {/* Error display if validation or blocker */}
      {submitError && (
        <div
          id="submit-error-banner"
          className="p-3 bg-neutral-50 border border-neutral-400 rounded-lg flex items-start gap-2.5 text-xs text-neutral-900"
        >
          <AlertCircle className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <p className="font-medium">{submitError}</p>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        type="button"
        id="btn-send-whatsapp"
        onClick={onSubmitOrder}
        disabled={isZero || isSubmitting}
        className="w-full h-11 px-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-none"
        aria-label="Kirim Pesanan ke WhatsApp"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Menyimpan Pesanan...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Kirim Pesanan ke WhatsApp</span>
          </>
        )}
      </button>

      {isZero && (
        <p className="text-xs text-center text-neutral-500">
          Silakan pilih minimal 1 produk di atas untuk mengaktifkan tombol pemesanan.
        </p>
      )}
    </div>
  );
};
