import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatRupiah } from '../utils/pricing';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unitLabel: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeQty?: (val: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  unitPrice,
  unitLabel,
  quantity,
  onIncrement,
  onDecrement,
  onChangeQty,
}) => {
  const isSelected = quantity > 0;

  return (
    <div
      id={`card-${id}`}
      className={`p-5 rounded-lg transition-colors flex flex-col justify-between ${
        isSelected
          ? 'border-2 border-neutral-900 bg-white'
          : 'border border-neutral-200 bg-neutral-50 hover:bg-white'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-base font-semibold text-neutral-900 leading-snug">{name}</h4>
          <span className="shrink-0 text-sm font-semibold text-neutral-900">
            {formatRupiah(unitPrice)}
            <span className="text-xs font-normal text-neutral-500">/{unitLabel}</span>
          </span>
        </div>
        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-200/80 mt-auto">
        <span className="text-xs font-medium text-neutral-600">
          Subtotal: <strong className="text-neutral-900 font-semibold">{formatRupiah(quantity * unitPrice)}</strong>
        </span>

        <div className="flex items-center gap-1.5" role="group" aria-label={`Jumlah ${name}`}>
          <button
            type="button"
            id={`btn-dec-${id}`}
            onClick={onDecrement}
            disabled={quantity <= 0}
            className="h-11 w-11 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label={`Kurangi ${name}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="number"
            id={`input-qty-${id}`}
            min="0"
            value={quantity}
            onChange={(e) => {
              if (onChangeQty) {
                const parsed = parseInt(e.target.value, 10);
                onChangeQty(isNaN(parsed) || parsed < 0 ? 0 : parsed);
              }
            }}
            className="h-11 w-14 text-center font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
            aria-label={`Jumlah porsi ${name}`}
          />

          <button
            type="button"
            id={`btn-inc-${id}`}
            onClick={onIncrement}
            className="h-11 w-11 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label={`Tambah ${name}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
