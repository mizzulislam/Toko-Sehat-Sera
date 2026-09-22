import React from 'react';
import { ProductCard } from './ProductCard';
import { PRICE_CATALOG, CATERING_BULK_THRESHOLD } from '../utils/pricing';

interface ProductSelectorProps {
  bakeryQuantities: Record<string, number>;
  onUpdateBakeryQty: (id: string, qty: number) => void;
  nasiBoxQty: number;
  onUpdateNasiBoxQty: (qty: number) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  bakeryQuantities,
  onUpdateBakeryQty,
  nasiBoxQty,
  onUpdateNasiBoxQty,
}) => {
  const isBulkCatering = nasiBoxQty > CATERING_BULK_THRESHOLD;

  return (
    <div className="space-y-8">
      {/* Line A: Artisan Bakery & Sourdough */}
      <section id="section-line-a" aria-labelledby="heading-line-a">
        <div className="mb-4">
          <h3 id="heading-line-a" className="text-lg font-bold text-neutral-900">
            Lini A: Artisan Bakery &amp; Sourdough
          </h3>
          <p className="text-sm text-neutral-600">
            Roti artisan segar dengan bahan berkualitas tinggi dan tekstur lembut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PRICE_CATALOG.lineA).map((item) => {
            const currentQty = bakeryQuantities[item.id] || 0;
            return (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                unitPrice={item.price}
                unitLabel={item.unitLabel}
                quantity={currentQty}
                onIncrement={() => onUpdateBakeryQty(item.id, currentQty + 1)}
                onDecrement={() => onUpdateBakeryQty(item.id, Math.max(0, currentQty - 1))}
                onChangeQty={(val) => onUpdateBakeryQty(item.id, val)}
              />
            );
          })}
        </div>
      </section>

      {/* Line B: Catering & Nasi Box */}
      <section id="section-line-b" aria-labelledby="heading-line-b">
        <div className="mb-4">
          <h3 id="heading-line-b" className="text-lg font-bold text-neutral-900">
            Lini B: Catering &amp; Nasi Box
          </h3>
          <p className="text-sm text-neutral-600">
            Paket konsumsi lengkap untuk rapat, acara keluarga, dan kebutuhan harian kantor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProductCard
            id={PRICE_CATALOG.lineB.standardNasiBox.id}
            name={PRICE_CATALOG.lineB.standardNasiBox.name}
            description={PRICE_CATALOG.lineB.standardNasiBox.description}
            unitPrice={PRICE_CATALOG.lineB.standardNasiBox.price}
            unitLabel={PRICE_CATALOG.lineB.standardNasiBox.unitLabel}
            quantity={nasiBoxQty}
            onIncrement={() => onUpdateNasiBoxQty(nasiBoxQty + 1)}
            onDecrement={() => onUpdateNasiBoxQty(Math.max(0, nasiBoxQty - 1))}
            onChangeQty={(val) => onUpdateNasiBoxQty(val)}
          />
        </div>

        {isBulkCatering && (
          <div
            id="bulk-catering-notice"
            className="mt-3 p-4 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-800"
          >
            <p className="font-semibold text-neutral-900 mb-1">
              Informasi Pemesanan Katering Jumlah Besar ({nasiBoxQty} Porsi)
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Untuk kebutuhan katering melebihi 200 porsi, silakan hubungi tim sales kami langsung untuk penawaran khusus korporat dan kustomisasi menu.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
