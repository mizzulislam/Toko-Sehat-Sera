import React from 'react';
import { CustomerInfo, FormErrors } from '../types';
import { validateName, validatePhoneNumber } from '../utils/validation';

interface ContactFormProps {
  customerInfo: CustomerInfo;
  errors: FormErrors;
  onChange: (info: CustomerInfo) => void;
  onErrorsChange: (errors: FormErrors) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  customerInfo,
  errors,
  onChange,
  onErrorsChange,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({ ...customerInfo, name: val });

    // Real-time validation
    const result = validateName(val);
    onErrorsChange({
      ...errors,
      name: result.isValid ? undefined : result.error,
    });
  };

  const handleNameBlur = () => {
    const result = validateName(customerInfo.name);
    onErrorsChange({
      ...errors,
      name: result.isValid ? undefined : result.error,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({ ...customerInfo, phone: val });

    // Real-time validation
    const result = validatePhoneNumber(val);
    onErrorsChange({
      ...errors,
      phone: result.isValid ? undefined : result.error,
    });
  };

  const handlePhoneBlur = () => {
    const result = validatePhoneNumber(customerInfo.phone);
    onErrorsChange({
      ...errors,
      phone: result.isValid ? undefined : result.error,
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...customerInfo, notes: e.target.value });
  };

  return (
    <section id="section-contact" aria-labelledby="heading-contact" className="space-y-4 pt-2">
      <div>
        <h3 id="heading-contact" className="text-lg font-bold text-neutral-900">
          Data Pemesan &amp; Kontak WhatsApp
        </h3>
        <p className="text-sm text-neutral-600">
          Informasi ini digunakan untuk memformat konfirmasi pesanan dan konfirmasi pembayaran di WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label htmlFor="customer-name-input" className="block text-sm font-semibold text-neutral-900 mb-1.5">
            Nama Lengkap <span className="text-neutral-500 font-normal">*</span>
          </label>
          <input
            id="customer-name-input"
            type="text"
            required
            autoComplete="name"
            placeholder="Contoh: Budi Santoso"
            value={customerInfo.name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className={`w-full h-11 px-3.5 text-neutral-900 bg-white rounded-lg border text-sm focus:outline-none transition-colors ${
              errors.name
                ? 'border-neutral-900 ring-1 ring-neutral-900'
                : 'border-neutral-300 focus:border-neutral-900'
            }`}
          />
          {errors.name && (
            <p id="customer-name-error" className="mt-1 text-xs text-neutral-700 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* WhatsApp Phone */}
        <div>
          <label htmlFor="customer-phone-input" className="block text-sm font-semibold text-neutral-900 mb-1.5">
            Nomor WhatsApp Aktif <span className="text-neutral-500 font-normal">*</span>
          </label>
          <input
            id="customer-phone-input"
            type="tel"
            inputMode="numeric"
            required
            autoComplete="tel"
            placeholder="Contoh: 081234567890"
            value={customerInfo.phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            className={`w-full h-11 px-3.5 text-neutral-900 bg-white rounded-lg border text-sm focus:outline-none transition-colors ${
              errors.phone
                ? 'border-neutral-900 ring-1 ring-neutral-900'
                : 'border-neutral-300 focus:border-neutral-900'
            }`}
          />
          {errors.phone ? (
            <p id="customer-phone-error" className="mt-1 text-xs text-neutral-700 font-medium">
              {errors.phone}
            </p>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">
              Gunakan 9 hingga 14 digit angka tanpa simbol atau spasi.
            </p>
          )}
        </div>
      </div>

      {/* Special Instructions (Optional) */}
      <div>
        <label htmlFor="customer-notes-input" className="block text-sm font-semibold text-neutral-900 mb-1.5">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          id="customer-notes-input"
          rows={3}
          placeholder="Tuliskan catatan khusus, waktu pengiriman yang diinginkan, atau permintaan kartu ucapan..."
          value={customerInfo.notes}
          onChange={handleNotesChange}
          className="w-full p-3 text-neutral-900 bg-white rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
        />
      </div>
    </section>
  );
};
