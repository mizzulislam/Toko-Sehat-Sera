export function sanitizePhoneNumber(phone: string): string {
  // Strip all non-digit characters
  return phone.replace(/\D/g, '');
}

export function validateName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Nama wajib diisi' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Nama minimal terdiri dari 2 karakter' };
  }
  return { isValid: true };
}

export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; cleanPhone: string } {
  const cleanPhone = sanitizePhoneNumber(phone);
  if (cleanPhone.length === 0) {
    return { isValid: false, error: 'Nomor WhatsApp wajib diisi', cleanPhone };
  }
  if (cleanPhone.length < 9) {
    return { isValid: false, error: 'Nomor WhatsApp minimal 9 digit', cleanPhone };
  }
  if (cleanPhone.length > 14) {
    return { isValid: false, error: 'Nomor WhatsApp maksimal 14 digit', cleanPhone };
  }
  return { isValid: true, cleanPhone };
}

export function validateOrderForm(
  name: string,
  phone: string,
  grandTotal: number
): {
  isValid: boolean;
  errors: { name?: string; phone?: string; total?: string };
  cleanPhone: string;
} {
  const nameValidation = validateName(name);
  const phoneValidation = validatePhoneNumber(phone);
  const errors: { name?: string; phone?: string; total?: string } = {};

  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  if (grandTotal <= 0) {
    errors.total = 'Silakan pilih minimal satu produk sebelum melanjutkan';
  }

  const isValid = nameValidation.isValid && phoneValidation.isValid && grandTotal > 0;
  return { isValid, errors, cleanPhone: phoneValidation.cleanPhone };
}
