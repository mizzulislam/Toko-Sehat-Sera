export interface ProductItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number; // in integer Rupiah
  unitLabel: string;
  line: 'A' | 'B';
}

export interface SelectedItemSummary {
  item: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface AddonsState {
  cutleryQty: number; // Rp 2.000 per pack
  premiumBesek: boolean; // Rp 15.000 flat
  deliveryBuffer: boolean; // Rp 10.000 flat
}

export interface CustomerInfo {
  name: string;
  phone: string;
  notes: string;
}

export interface FormErrors {
  name?: string;
  phone?: string;
}

export interface SupabaseOrderRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  selected_items: string; // JSON serialized
  total_price: number;
  status: 'pending' | 'processed';
  created_at: string;
}

export type OrderHistoryState = 'empty' | 'loading' | 'error' | 'data';
