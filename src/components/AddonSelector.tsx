import React from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { AddonsState } from '../types';
import { PRICE_CATALOG, formatRupiah } from '../utils/pricing';

interface AddonSelectorProps {
  addons: AddonsState;
  onChange: (updated: AddonsState) => void;
}

export const AddonSelector: React.FC<AddonSelectorProps> = ({ addons, onChange }) => {
  const handleCutleryChange = (delta: number) => {
    const nextVal = Math.max(0, addons.cutleryQty + delta);
    onChange({ ...addons, cutleryQty: nextVal });
  };

  const handleCutleryDirect = (val: number) => {
    onChange({ ...addons, cutleryQty: Math.max(0, val) });
  };

  const toggleBesek = () => {
    onChange({ ...addons, premiumBesek: !addons.premiumBesek });
  };

  const toggleDelivery = () => {
    onChange({ ...addons, deliveryBuffer: !addons.deliveryBuffer });
  };

  return (
    <section id="section-addons" aria-labelledby="heading-addons" className="space-y-4">
      <div>
        <h3 id="heading-addons" className="text-lg font-bold text-neutral-900">
          Pilihan Tambahan &amp; Kemasan (Opsional)
        </h3>
        <p className="text-sm text-neutral-600">
          Lengkapi pesanan Anda dengan peralatan makan ramah lingkungan atau kemasan hadiah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cutlery Stepper */}
        <div
          id="addon-cutlery-card"
          className={`p-4 rounded-lg flex flex-col justify-between transition-colors ${
            addons.cutleryQty > 0
              ? 'border-2 border-neutral-900 bg-white'
              : 'border border-neutral-200 bg-neutral-50 hover:bg-white'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-neutral-900">Eco-Friendly Cutlery Set</h4>
              <span className="text-xs font-semibold text-neutral-900 shrink-0">
                {formatRupiah(PRICE_CATALOG.addons.cutleryPrice)}/pack
              </span>
            </div>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Sendok, garpu, dan tisu berbahan serat kayu terurai.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 mt-auto">
            <span className="text-xs font-medium text-neutral-600">
              Total: {formatRupiah(addons.cutleryQty * PRICE_CATALOG.addons.cutleryPrice)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="btn-dec-cutlery"
                onClick={() => handleCutleryChange(-1)}
                disabled={addons.cutleryQty <= 0}
                className="h-11 w-11 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Kurangi cutlery"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                id="input-qty-cutlery"
                min="0"
                value={addons.cutleryQty}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleCutleryDirect(isNaN(val) || val < 0 ? 0 : val);
                }}
                className="h-11 w-12 text-center font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                aria-label="Jumlah cutlery"
              />
              <button
                type="button"
                id="btn-inc-cutlery"
                onClick={() => handleCutleryChange(1)}
                className="h-11 w-11 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label="Tambah cutlery"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Premium Besek Toggle */}
        <div
          id="addon-besek-card"
          onClick={toggleBesek}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              toggleBesek();
            }
          }}
          className={`p-4 rounded-lg flex flex-col justify-between cursor-pointer select-none transition-colors ${
            addons.premiumBesek
              ? 'border-2 border-neutral-900 bg-white'
              : 'border border-neutral-200 bg-neutral-50 hover:bg-white'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-neutral-900">Premium Besek &amp; Gift Packaging</h4>
              <span className="text-xs font-semibold text-neutral-900 shrink-0">
                {formatRupiah(PRICE_CATALOG.addons.premiumBesekPrice)} flat
              </span>
            </div>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Anyaman bambu tradisional elegan dengan pita dan kartu ucapan.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 mt-auto">
            <span className="text-xs text-neutral-600">Biaya flat satu pesanan</span>
            <div
              className={`h-11 w-11 flex items-center justify-center rounded-lg border transition-colors ${
                addons.premiumBesek
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Delivery Handling Buffer Toggle */}
        <div
          id="addon-delivery-card"
          onClick={toggleDelivery}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              toggleDelivery();
            }
          }}
          className={`p-4 rounded-lg flex flex-col justify-between cursor-pointer select-none transition-colors ${
            addons.deliveryBuffer
              ? 'border-2 border-neutral-900 bg-white'
              : 'border border-neutral-200 bg-neutral-50 hover:bg-white'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-neutral-900">Delivery Handling Buffer</h4>
              <span className="text-xs font-semibold text-neutral-900 shrink-0">
                {formatRupiah(PRICE_CATALOG.addons.deliveryBufferPrice)} flat
              </span>
            </div>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Proteksi termal dan pengemasan ekstra agar suhu makanan tetap terjaga.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 mt-auto">
            <span className="text-xs text-neutral-600">Biaya flat penanganan</span>
            <div
              className={`h-11 w-11 flex items-center justify-center rounded-lg border transition-colors ${
                addons.deliveryBuffer
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
