import React from 'react';
import { ShoppingBag, Receipt } from 'lucide-react';
import { PackagingMode } from '../types/recipe';

interface PricingSummaryBarProps {
  packagingMode: PackagingMode;
  onTogglePackagingMode: (mode: PackagingMode) => void;
  registerTotal: number;
  usageExpense: number;
  totalItemsCount: number;
  netItemsToBuyCount: number;
}

export const PricingSummaryBar: React.FC<PricingSummaryBarProps> = ({
  packagingMode,
  onTogglePackagingMode,
  registerTotal,
  usageExpense,
  totalItemsCount,
  netItemsToBuyCount,
}) => {
  const pantryInvestment = Math.max(0, registerTotal - usageExpense);

  return (
    <div className="bg-[#ffffff] rounded-[32px] p-6 border-2 border-[#000000] mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Packaging Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#000000]">
              Grocery Estimation
            </h3>
            <p className="text-xs text-[#000000]/70 font-medium">
              Gauge total costs for grocery list
            </p>
          </div>

          <div className="inline-flex bg-[#f3f3f1] p-1.5 rounded-full border-2 border-[#000000]">
            <button
              type="button"
              onClick={() => onTogglePackagingMode('minimum')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                packagingMode === 'minimum'
                  ? 'bg-[#000000] text-[#ffffff]'
                  : 'text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              Minimum Needed (Loose)
            </button>
            <button
              type="button"
              onClick={() => onTogglePackagingMode('bulk')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                packagingMode === 'bulk'
                  ? 'bg-[#000000] text-[#ffffff]'
                  : 'text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              Bulk Packaging (Retail Packs)
            </button>
          </div>
        </div>

        {/* Right: Bento Metrics Tiles */}
        <div className="flex flex-wrap items-center gap-4">
          {/* 1. Register Total (Lime Spark / Leaf Wash tile) */}
          <div className="bg-[#ebffc5] px-5 py-4 rounded-[24px] border-2 border-[#000000] min-w-44 flex-1 sm:flex-initial">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> Register Total
              </span>
              <span className="text-[10px] bg-[#ffffff] border border-[#000000] px-2 py-0.5 rounded-full font-bold">
                Cash
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#000000]">
              ${registerTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#000000]/70 font-medium mt-0.5">
              Out-of-pocket store cost
            </div>
          </div>

          {/* 2. Usage Expense (Lavender Mist tile) */}
          <div className="bg-[#e9c0e9] px-5 py-4 rounded-[24px] border-2 border-[#000000] min-w-44 flex-1 sm:flex-initial">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" /> Usage Expense
              </span>
              <span className="text-[10px] bg-[#ffffff] border border-[#000000] px-2 py-0.5 rounded-full font-bold">
                Batch
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#000000]">
              ${usageExpense.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#000000]/70 font-medium mt-0.5">
              Consumed recipe food cost
            </div>
          </div>

          {/* 3. Leftover Pantry Equity */}
          {pantryInvestment > 0.05 && packagingMode === 'bulk' && (
            <div className="bg-[#f3f3f1] px-4 py-3 rounded-[24px] border-2 border-[#000000] max-w-48 text-xs font-medium text-[#000000]">
              <span className="font-extrabold block text-sm">
                +${pantryInvestment.toFixed(2)} Surplus
              </span>
              Stock stays in pantry for future preps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
