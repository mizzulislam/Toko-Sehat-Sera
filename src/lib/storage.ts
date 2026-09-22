const STORAGE_KEY = 'client_order_history';
const LOCAL_ORDERS_KEY = 'client_orders_cache';

export interface LocalOrderBackup {
  id: string;
  customer_name: string;
  customer_phone: string;
  selected_items: string;
  total_price: number;
  status: 'pending' | 'processed';
  created_at: string;
}

export function getStoredOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse client_order_history from localStorage:', err);
    return [];
  }
}

export function saveOrderId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getStoredOrderIds();
    if (!current.includes(id)) {
      const updated = [id, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Failed to save order ID to localStorage:', err);
  }
}

export function getLocalOrdersCache(): LocalOrderBackup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to read local orders cache:', err);
    return [];
  }
}

export function saveLocalOrderBackup(order: LocalOrderBackup): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOrdersCache();
    const filtered = current.filter((o) => o.id !== order.id);
    const updated = [order, ...filtered];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to cache local order backup:', err);
  }
}

export function updateLocalOrderStatus(id: string, status: 'pending' | 'processed'): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOrdersCache();
    const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to update local order status:', err);
  }
}
