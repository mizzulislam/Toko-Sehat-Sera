import { formatRupiah } from './pricing';

export interface WhatsAppMessagePayload {
  customerName: string;
  customerPhone: string;
  notes?: string;
  orderId: string;
  items: Array<{ item: string; qty: number; subtotal: number }>;
  addons: Array<{ name: string; price: number }>;
  totalPrice: number;
}

export function constructWhatsAppMessage(payload: WhatsAppMessagePayload): string {
  const lines: string[] = [];

  lines.push('Halo Artisan Bakery & Catering, saya ingin memesan:');
  lines.push('');
  lines.push(`Nama: ${payload.customerName}`);
  lines.push(`Nomor WhatsApp: ${payload.customerPhone}`);

  if (payload.notes && payload.notes.trim().length > 0) {
    lines.push(`Catatan: ${payload.notes.trim()}`);
  }

  lines.push('');
  lines.push('Rincian Pesanan:');
  for (const item of payload.items) {
    lines.push(`- ${item.qty}x ${item.item} (${formatRupiah(item.subtotal)})`);
  }

  if (payload.addons.length > 0) {
    lines.push('');
    lines.push('Add-ons:');
    for (const addon of payload.addons) {
      lines.push(`- ${addon.name} (${formatRupiah(addon.price)})`);
    }
  }

  lines.push('');
  lines.push(`Total Estimasi: ${formatRupiah(payload.totalPrice)}`);
  lines.push(`ID Pesanan: ${payload.orderId}`);
  lines.push('');
  lines.push('Mohon konfirmasi ketersediaan dan nomor rekening untuk pembayaran. Terima kasih.');

  return lines.join('\n');
}

export function getBusinessWhatsAppNumber(): string {
  const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (envNumber && typeof envNumber === 'string') {
    const cleaned = envNumber.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      return cleaned;
    }
  }
  return '6281234567890';
}

export function createWhatsAppUrl(message: string): string {
  const businessNumber = getBusinessWhatsAppNumber();
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${businessNumber}?text=${encodedText}`;
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const userAgent = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isMobileScreen = window.innerWidth < 768;
  return isMobileUA || isMobileScreen;
}

export function openWhatsAppLink(waUrl: string): void {
  if (isMobileDevice()) {
    window.location.href = waUrl;
  } else {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
}
