import { AddonsState } from '../types';

export const PRICE_CATALOG = {
  lineA: {
    matchaChoco: { id: 'matcha_choco', name: 'Matcha Choco Milk Bread', price: 35000, description: 'Artisan soft milk bread with rich matcha and chocolate chips', unitLabel: 'loaf' },
    matchaCreamCheese: { id: 'matcha_cream_cheese', name: 'Matcha Cream Cheese', price: 38000, description: 'Premium matcha dough filled with creamy sweet cheese', unitLabel: 'loaf' },
    ubeeMilkLoaf: { id: 'ubee_milk_loaf', name: 'Ubee Milk Loaf', price: 42000, description: 'Naturally purple sweet potato milk loaf with delicate crumb', unitLabel: 'loaf' },
  },
  lineB: {
    standardNasiBox: { id: 'standard_nasi_box', name: 'Standard Nasi Box', price: 47000, description: 'Complete balanced catering portion with aromatic rice and sides', unitLabel: 'porsi' },
  },
  addons: {
    cutleryPrice: 2000, // per pack
    premiumBesekPrice: 15000, // flat
    deliveryBufferPrice: 10000, // flat
  },
} as const;

export const MAX_CALCULATOR_PRICE = 10000000; // Rp 10.000.000
export const CATERING_BULK_THRESHOLD = 200; // > 200 portions

/**
 * Pure function: calculates Subtotal for Line A (Artisan Bakery)
 */
export function calcSubtotalLineA(quantities: Record<string, number>): number {
  let subtotal = 0;
  for (const item of Object.values(PRICE_CATALOG.lineA)) {
    const qty = Math.max(0, Math.floor(quantities[item.id] || 0));
    subtotal += qty * item.price;
  }
  return subtotal;
}

/**
 * Pure function: calculates Subtotal for Line B (Catering & Nasi Box)
 */
export function calcSubtotalLineB(nasiBoxQty: number): number {
  const qty = Math.max(0, Math.floor(nasiBoxQty || 0));
  return qty * PRICE_CATALOG.lineB.standardNasiBox.price;
}

/**
 * Pure function: calculates Total Add-ons (Cutlery + Flat options)
 */
export function calcTotalAddons(addons: AddonsState): number {
  const cutleryCount = Math.max(0, Math.floor(addons.cutleryQty || 0));
  const cutleryTotal = cutleryCount * PRICE_CATALOG.addons.cutleryPrice;
  const besekTotal = addons.premiumBesek ? PRICE_CATALOG.addons.premiumBesekPrice : 0;
  const deliveryTotal = addons.deliveryBuffer ? PRICE_CATALOG.addons.deliveryBufferPrice : 0;

  return cutleryTotal + besekTotal + deliveryTotal;
}

/**
 * Pure function: calculates Grand Total with cap guardrail
 */
export function calcGrandTotal(
  subtotalA: number,
  subtotalB: number,
  totalAddons: number
): { grandTotal: number; rawTotal: number; isCapped: boolean } {
  const rawTotal = subtotalA + subtotalB + totalAddons;
  const isCapped = rawTotal > MAX_CALCULATOR_PRICE;
  const grandTotal = isCapped ? MAX_CALCULATOR_PRICE : rawTotal;

  return { grandTotal, rawTotal, isCapped };
}

/**
 * Formats integer Rupiah using Intl.NumberFormat
 */
const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  const validInt = Math.floor(Number(amount) || 0);
  return idrFormatter.format(validInt);
}
