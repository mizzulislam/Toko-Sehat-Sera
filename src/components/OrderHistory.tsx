import React from 'react';
import { RotateCw, CheckCircle } from 'lucide-react';
import { SupabaseOrderRecord, OrderHistoryState } from '../types';
import { formatRupiah } from '../utils/pricing';

interface OrderHistoryProps {
  state: OrderHistoryState;
  orders: SupabaseOrderRecord[];
  isAdmin: boolean;
  onRetry: () => void;
  onMarkProcessed: (orderId: string) => Promise<void>;
  isUpdatingStatusId?: string | null;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  state,
  orders,
  isAdmin,
  onRetry,
  onMarkProcessed,
  isUpdatingStatusId,
}) => {
  const parseItemsSummary = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((i) => {
            if (i.qty && i.item) return `${i.qty}x ${i.item}`;
            if (i.name) return i.name;
            return '';
          })
          .filter(Boolean)
          .join(', ');
      }
      return raw;
    } catch {
      return raw || '-';
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <section id="section-order-history" aria-labelledby="heading-order-history" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 id="heading-order-history" className="text-lg font-bold text-neutral-900">
            {isAdmin ? 'Panel Riwayat Pesanan (Mode Admin)' : 'Riwayat Pesanan Anda'}
          </h3>
          <p className="text-sm text-neutral-600">
            {isAdmin
              ? 'Menampilkan seluruh pesanan masuk terbaru dari database Supabase.'
              : 'Daftar pesanan yang telah Anda buat melalui browser ini.'}
          </p>
        </div>

        <button
          type="button"
          id="btn-refresh-history"
          onClick={onRetry}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto h-11 px-3.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-50 transition-colors"
          aria-label="Segarkan riwayat pesanan"
        >
          <RotateCw className={`w-3.5 h-3.5 ${state === 'loading' ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* State 1: Empty State */}
      {state === 'empty' && (
        <div
          id="order-history-empty"
          className="border border-neutral-200 rounded-lg p-8 text-center bg-white"
        >
          <p className="text-sm text-neutral-600">
            No past orders found on this browser. Orders created through the calculator will appear here.
          </p>
        </div>
      )}

      {/* State 2: Loading State (3 skeleton rows) */}
      {state === 'loading' && (
        <div id="order-history-loading" className="space-y-3">
          <div className="h-14 bg-neutral-100 animate-pulse rounded-lg w-full" />
          <div className="h-14 bg-neutral-100 animate-pulse rounded-lg w-full" />
          <div className="h-14 bg-neutral-100 animate-pulse rounded-lg w-full" />
        </div>
      )}

      {/* State 3: Error State */}
      {state === 'error' && (
        <div
          id="order-history-error"
          className="border border-neutral-200 bg-neutral-50 rounded-lg p-6 text-center space-y-3"
        >
          <p className="text-sm text-neutral-700 font-medium">
            Unable to load previous orders due to a connection issue.
          </p>
          <button
            type="button"
            id="btn-retry-orders"
            onClick={onRetry}
            className="inline-flex items-center justify-center border border-neutral-300 bg-white hover:bg-neutral-100 rounded-lg h-11 px-4 text-sm font-semibold text-neutral-800 transition-colors"
          >
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* State 4: Data State (Table) */}
      {state === 'data' && orders.length > 0 && (
        <div
          id="order-history-table-container"
          className="border border-neutral-200 rounded-lg overflow-x-auto bg-white"
        >
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">Tanggal</th>
                <th scope="col" className="py-3 px-4">Nama Pelanggan</th>
                <th scope="col" className="py-3 px-4">Ringkasan Item</th>
                <th scope="col" className="py-3 px-4 text-right">Total Harga</th>
                <th scope="col" className="py-3 px-4 text-center">Status</th>
                {isAdmin && <th scope="col" className="py-3 px-4 text-center">Tindakan Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.map((order) => {
                const isProcessed = order.status === 'processed';
                const isRowUpdating = isUpdatingStatusId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                      {order.customer_name}
                      <span className="block text-xs font-normal text-neutral-500">
                        {order.customer_phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 max-w-xs truncate" title={parseItemsSummary(order.selected_items)}>
                      {parseItemsSummary(order.selected_items)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 text-right whitespace-nowrap">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isProcessed ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Processed</span>
                        </span>
                      ) : (
                        <span className="bg-neutral-100 text-neutral-800 rounded-lg px-2.5 py-1 text-xs font-medium inline-block">
                          Pending
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {!isProcessed ? (
                          <button
                            type="button"
                            id={`btn-mark-processed-${order.id}`}
                            disabled={isRowUpdating}
                            onClick={() => onMarkProcessed(order.id)}
                            className="h-9 px-3 text-xs font-semibold rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-800 disabled:opacity-50 transition-colors"
                          >
                            {isRowUpdating ? 'Memproses...' : 'Mark as Processed'}
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
