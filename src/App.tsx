import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { AddonsState, CustomerInfo, FormErrors, SupabaseOrderRecord, OrderHistoryState, SelectedItemSummary } from './types';
import {
  PRICE_CATALOG,
  calcSubtotalLineA,
  calcSubtotalLineB,
  calcTotalAddons,
  calcGrandTotal,
  formatRupiah,
} from './utils/pricing';
import { validateOrderForm } from './utils/validation';
import { constructWhatsAppMessage, createWhatsAppUrl, openWhatsAppLink } from './utils/whatsapp';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  getStoredOrderIds,
  saveOrderId,
  getLocalOrdersCache,
  saveLocalOrderBackup,
  updateLocalOrderStatus,
} from './lib/storage';

import { ProductSelector } from './components/ProductSelector';
import { AddonSelector } from './components/AddonSelector';
import { ContactForm } from './components/ContactForm';
import { PriceSummary } from './components/PriceSummary';
import { OrderHistory } from './components/OrderHistory';
import { AdminToggle } from './components/AdminToggle';

export default function App() {
  // State for Bakery Items (Line A)
  const [bakeryQuantities, setBakeryQuantities] = useState<Record<string, number>>({
    matcha_choco: 0,
    matcha_cream_cheese: 0,
    ubee_milk_loaf: 0,
  });

  // State for Catering / Nasi Box (Line B)
  const [nasiBoxQty, setNasiBoxQty] = useState<number>(0);

  // State for Addons
  const [addons, setAddons] = useState<AddonsState>({
    cutleryQty: 0,
    premiumBesek: false,
    deliveryBuffer: false,
  });

  // State for Customer Contact
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    notes: '',
  });

  // Form errors and feedback
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [failSafeNotice, setFailSafeNotice] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Admin View State via URLSearchParams
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'admin';
    }
    return false;
  });

  // Order History State
  const [orderHistoryState, setOrderHistoryState] = useState<OrderHistoryState>('loading');
  const [orders, setOrders] = useState<SupabaseOrderRecord[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Sync admin state with browser history / popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsAdmin(params.get('view') === 'admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update Line A quantity
  const handleUpdateBakeryQty = (id: string, qty: number) => {
    setBakeryQuantities((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
    if (submitError) setSubmitError(undefined);
  };

  // Update Line B quantity
  const handleUpdateNasiBoxQty = (qty: number) => {
    setNasiBoxQty(Math.max(0, qty));
    if (submitError) setSubmitError(undefined);
  };

  // Calculations (Pure deterministic integers)
  const subtotalA = useMemo(() => calcSubtotalLineA(bakeryQuantities), [bakeryQuantities]);
  const subtotalB = useMemo(() => calcSubtotalLineB(nasiBoxQty), [nasiBoxQty]);
  const totalAddons = useMemo(() => calcTotalAddons(addons), [addons]);
  const { grandTotal, isCapped } = useMemo(
    () => calcGrandTotal(subtotalA, subtotalB, totalAddons),
    [subtotalA, subtotalB, totalAddons]
  );

  // Fetch Order History from Supabase or Local Fallback
  const fetchOrders = useCallback(async () => {
    setOrderHistoryState('loading');
    const storedIds = getStoredOrderIds();

    // If client mode and user has never created an order on this browser
    if (!isAdmin && storedIds.length === 0) {
      const localBackups = getLocalOrdersCache();
      if (localBackups.length > 0) {
        setOrders(localBackups);
        setOrderHistoryState('data');
      } else {
        setOrders([]);
        setOrderHistoryState('empty');
      }
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Supabase is not configured yet, fallback to local order backups
      const localBackups = getLocalOrdersCache();
      if (isAdmin) {
        if (localBackups.length > 0) {
          setOrders(localBackups);
          setOrderHistoryState('data');
        } else {
          setOrders([]);
          setOrderHistoryState('empty');
        }
      } else {
        const filtered = localBackups.filter((b) => storedIds.includes(b.id));
        if (filtered.length > 0) {
          setOrders(filtered);
          setOrderHistoryState('data');
        } else {
          setOrders([]);
          setOrderHistoryState('empty');
        }
      }
      return;
    }

    try {
      let query = supabase.from('orders').select('*');

      if (isAdmin) {
        // Admin mode fetches latest 50 orders
        query = query.order('created_at', { ascending: false }).limit(50);
      } else {
        // Customer mode isolates to locally stored order IDs
        query = query.in('id', storedIds).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetch error, checking local cache:', error.message);
        const localBackups = getLocalOrdersCache();
        const fallbackList = isAdmin
          ? localBackups
          : localBackups.filter((b) => storedIds.includes(b.id));

        if (fallbackList.length > 0) {
          setOrders(fallbackList);
          setOrderHistoryState('data');
        } else {
          setOrderHistoryState('error');
        }
        return;
      }

      if (data && data.length > 0) {
        setOrders(data as SupabaseOrderRecord[]);
        setOrderHistoryState('data');
      } else {
        // Check if there are local backups
        const localBackups = getLocalOrdersCache();
        const fallbackList = isAdmin
          ? localBackups
          : localBackups.filter((b) => storedIds.includes(b.id));

        if (fallbackList.length > 0) {
          setOrders(fallbackList);
          setOrderHistoryState('data');
        } else {
          setOrders([]);
          setOrderHistoryState('empty');
        }
      }
    } catch (err) {
      console.warn('Network exception while fetching orders:', err);
      const localBackups = getLocalOrdersCache();
      const fallbackList = isAdmin
        ? localBackups
        : localBackups.filter((b) => storedIds.includes(b.id));

      if (fallbackList.length > 0) {
        setOrders(fallbackList);
        setOrderHistoryState('data');
      } else {
        setOrderHistoryState('error');
      }
    }
  }, [isAdmin]);

  // Initial fetch on mount or when admin mode toggles
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Mark as Processed (Admin Action)
  const handleMarkProcessed = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    updateLocalOrderStatus(orderId, 'processed');

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'processed' })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Failed to update status in Supabase:', err);
      }
    }

    await fetchOrders();
    setUpdatingOrderId(null);
  };

  // Compile active selected items list
  const getSelectedItemsBreakdown = () => {
    const items: SelectedItemSummary[] = [];

    // Line A items
    for (const item of Object.values(PRICE_CATALOG.lineA)) {
      const qty = bakeryQuantities[item.id] || 0;
      if (qty > 0) {
        items.push({
          item: item.name,
          qty,
          unit_price: item.price,
          subtotal: qty * item.price,
        });
      }
    }

    // Line B items
    if (nasiBoxQty > 0) {
      const nasiBox = PRICE_CATALOG.lineB.standardNasiBox;
      items.push({
        item: nasiBox.name,
        qty: nasiBoxQty,
        unit_price: nasiBox.price,
        subtotal: nasiBoxQty * nasiBox.price,
      });
    }

    const addonList: Array<{ name: string; price: number }> = [];
    if (addons.cutleryQty > 0) {
      addonList.push({
        name: `${addons.cutleryQty}x Eco-Friendly Cutlery Set`,
        price: addons.cutleryQty * PRICE_CATALOG.addons.cutleryPrice,
      });
    }
    if (addons.premiumBesek) {
      addonList.push({
        name: 'Premium Besek & Gift Packaging',
        price: PRICE_CATALOG.addons.premiumBesekPrice,
      });
    }
    if (addons.deliveryBuffer) {
      addonList.push({
        name: 'Delivery Handling Buffer',
        price: PRICE_CATALOG.addons.deliveryBufferPrice,
      });
    }

    return { items, addonList };
  };

  // Submit Order to Supabase and WhatsApp
  const handleSubmitOrder = async () => {
    setSubmitError(undefined);
    setFailSafeNotice(undefined);

    // Validate Form Fields & Non-zero Grand Total
    const validation = validateOrderForm(customerInfo.name, customerInfo.phone, grandTotal);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      if (validation.errors.total) {
        setSubmitError(validation.errors.total);
      } else if (validation.errors.name) {
        setSubmitError(validation.errors.name);
      } else if (validation.errors.phone) {
        setSubmitError(validation.errors.phone);
      }
      return;
    }

    setIsSubmitting(true);

    const { items, addonList } = getSelectedItemsBreakdown();
    const serializedItems = JSON.stringify(items);

    // Generate UUID for the order (browser native crypto.randomUUID or clean fallback)
    let generatedId: string;
    try {
      generatedId = crypto.randomUUID();
    } catch {
      generatedId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    let insertSucceeded = false;

    // Step A: Attempt Supabase Insert
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              id: generatedId,
              customer_name: customerInfo.name.trim(),
              customer_phone: validation.cleanPhone,
              selected_items: serializedItems,
              total_price: grandTotal,
              status: 'pending',
            },
          ])
          .select();

        if (!error && data && data.length > 0) {
          generatedId = data[0].id;
          insertSucceeded = true;
        } else if (error) {
          console.warn('Supabase insert failed, continuing to fail-safe:', error.message);
        }
      } catch (err) {
        console.warn('Network exception while contacting Supabase, continuing to fail-safe:', err);
      }
    }

    // Fail-safe storage: Always save to local browser storage
    saveOrderId(generatedId);
    saveLocalOrderBackup({
      id: generatedId,
      customer_name: customerInfo.name.trim(),
      customer_phone: validation.cleanPhone,
      selected_items: serializedItems,
      total_price: grandTotal,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (!insertSucceeded) {
      setFailSafeNotice('Pesanan berhasil disimpan di browser Anda. Mengalihkan ke WhatsApp...');
    }

    // Step B: Construct WhatsApp Message
    const waMessage = constructWhatsAppMessage({
      customerName: customerInfo.name.trim(),
      customerPhone: validation.cleanPhone,
      notes: customerInfo.notes,
      orderId: generatedId,
      items,
      addons: addonList,
      totalPrice: grandTotal,
    });

    const waUrl = createWhatsAppUrl(waMessage);

    // Step C: Redirect to WhatsApp
    openWhatsAppLink(waUrl);

    // Refresh history so the newly submitted order displays in table
    await fetchOrders();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      {/* Top Header */}
      <header
        id="app-header"
        className="w-full bg-white border-b border-neutral-200 sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 leading-tight">
                Artisan Bakery &amp; Catering
              </h1>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Kalkulator Harga Transparan &amp; Pemesanan WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminToggle isAdmin={isAdmin} onToggle={(newVal) => setIsAdmin(newVal)} />
          </div>
        </div>
      </header>

      {/* Admin Mode Alert Notice */}
      {isAdmin && (
        <aside
          id="admin-mode-banner"
          aria-label="Pemberitahuan Mode Admin"
          className="bg-neutral-50 border-b border-neutral-300 py-2.5 px-4 text-xs text-neutral-800"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span>
              <strong>Mode Admin Aktif:</strong> Anda sedang melihat data pesanan masuk dari database. Klik tombol pada tabel di bawah untuk menandai pesanan sebagai &quot;Processed&quot;.
            </span>
            <button
              type="button"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                window.history.pushState({}, '', url.toString());
                setIsAdmin(false);
              }}
              className="underline font-semibold ml-3 hover:text-neutral-900"
            >
              Kembali ke Tampilan Pembeli
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Selection & Contact Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-800">
                  Estimasi Instan
                </span>
                <span className="text-xs text-neutral-500">
                  Pilih menu di bawah ini untuk melihat total biaya
                </span>
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                Pilih Menu &amp; Paket Pesanan
              </h2>
            </div>

            {/* Product Selector (Line A & Line B) */}
            <ProductSelector
              bakeryQuantities={bakeryQuantities}
              onUpdateBakeryQty={handleUpdateBakeryQty}
              nasiBoxQty={nasiBoxQty}
              onUpdateNasiBoxQty={handleUpdateNasiBoxQty}
            />

            {/* Optional Addons */}
            <AddonSelector addons={addons} onChange={setAddons} />

            {/* Customer Contact Form */}
            <ContactForm
              customerInfo={customerInfo}
              errors={formErrors}
              onChange={setCustomerInfo}
              onErrorsChange={setFormErrors}
            />
          </div>

          {/* Right Column: Sticky Price Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            <PriceSummary
              subtotalA={subtotalA}
              subtotalB={subtotalB}
              totalAddons={totalAddons}
              grandTotal={grandTotal}
              isCapped={isCapped}
              isSubmitting={isSubmitting}
              onSubmitOrder={handleSubmitOrder}
              submitError={submitError}
              failSafeNotice={failSafeNotice}
            />
          </div>
        </div>

        {/* Dedicated Order History Section */}
        <div className="mt-14 pt-8 border-t border-neutral-200">
          <OrderHistory
            state={orderHistoryState}
            orders={orders}
            isAdmin={isAdmin}
            onRetry={fetchOrders}
            onMarkProcessed={handleMarkProcessed}
            isUpdatingStatusId={updatingOrderId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="w-full bg-neutral-50 border-t border-neutral-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Artisan Bakery &amp; Catering. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span>Kalkulator Harga &amp; WhatsApp Lead Closer</span>
            <span>&bull;</span>
            <span>Clean White Design System</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Bar (Visible on mobile if items selected) */}
      <div
        id="mobile-bottom-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-neutral-200 z-20 flex items-center justify-between gap-3 shadow-sm"
      >
        <div>
          <span className="block text-[10px] uppercase font-bold text-neutral-500">Total Estimasi</span>
          <span className="text-lg font-black text-neutral-900 leading-tight">
            {formatRupiah(grandTotal)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={grandTotal === 0 || isSubmitting}
          className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
        >
          {isSubmitting ? 'Memproses...' : 'Pesan di WhatsApp'}
        </button>
      </div>
    </div>
  );
}
