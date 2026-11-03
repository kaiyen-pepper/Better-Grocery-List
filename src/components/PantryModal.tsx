import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Plus, Check } from 'lucide-react';
import { PantryItem, Recipe } from '../types/recipe';
import { formatQuantity } from '../utils/conversions';

interface PantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  staples: PantryItem[];
  onToggleStapleRunningLow: (stapleId: string) => void;
  onAddStaple: (item: Omit<PantryItem, 'id'>) => void;
  perishablesOnHand: Record<string, number>;
  onUpdatePerishableOnHand: (ingredientName: string, amount: number) => void;
  activeRecipes: Recipe[];
}

export const PantryModal: React.FC<PantryModalProps> = ({
  isOpen,
  onClose,
  staples,
  onToggleStapleRunningLow,
  onAddStaple,
  perishablesOnHand,
  onUpdatePerishableOnHand,
  activeRecipes,
}) => {
  const [activeTab, setActiveTab] = useState<'staples' | 'perishables'>('staples');
  const [newStapleName, setNewStapleName] = useState('');
  const [newStapleUnit, setNewStapleUnit] = useState('oz');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Aggregate perishable ingredients needed by current recipes
  const perishableNeedsMap: Record<string, { amount: number; unit: string; category: string }> = {};

  activeRecipes.forEach((recipe) => {
    const multiplier = recipe.servings / recipe.defaultServings;
    recipe.ingredients.forEach((ing) => {
      const isStaple = staples.some(
        (s) => s.name.toLowerCase() === ing.name.toLowerCase()
      );
      if (!isStaple) {
        const key = ing.name.toLowerCase();
        if (!perishableNeedsMap[key]) {
          perishableNeedsMap[key] = {
            amount: 0,
            unit: ing.unit,
            category: ing.category,
          };
        }
        perishableNeedsMap[key].amount += ing.amount * multiplier;
      }
    });
  });

  const perishableList = Object.entries(perishableNeedsMap).map(([key, data]) => {
    const onHand = perishablesOnHand[key] || 0;
    const netPurchase = Math.max(0, data.amount - onHand);
    return {
      name: key,
      category: data.category,
      unit: data.unit,
      needed: data.amount,
      onHand,
      netPurchase,
    };
  });

  const handleAddNewStaple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStapleName.trim()) return;
    onAddStaple({
      name: newStapleName.trim(),
      category: 'Pantry',
      onHandAmount: 1,
      unit: newStapleUnit,
      isStaple: true,
      isRunningLow: false,
    });
    setNewStapleName('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#000000]/60 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#ffffff] rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-[#000000] shadow-none overflow-hidden cursor-default"
      >
        {/* Modal Header */}
        <div className="p-6 border-b-2 border-[#000000] bg-[#f3f3f1]">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#000000]">
              Pantry Stock &amp; Staples Vault
            </h2>
          </div>

          {/* Segmented Tab Switch */}
          <div className="flex gap-2 mt-4 bg-[#ffffff] p-1.5 rounded-full border-2 border-[#000000]">
            <button
              onClick={() => setActiveTab('staples')}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                activeTab === 'staples'
                  ? 'bg-[#000000] text-[#ffffff]'
                  : 'text-[#000000] hover:bg-[#f3f3f1]'
              }`}
            >
              1. Persistent Staples ({staples.length})
            </button>
            <button
              onClick={() => setActiveTab('perishables')}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                activeTab === 'perishables'
                  ? 'bg-[#000000] text-[#ffffff]'
                  : 'text-[#000000] hover:bg-[#f3f3f1]'
              }`}
            >
              2. Fresh On-Hand ({perishableList.length})
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'staples' ? (
            <div>
              <div className="mb-5 text-xs sm:text-sm text-[#000000] flex items-start gap-2.5 bg-[#ebffc5] p-3.5 rounded-2xl border-2 border-[#000000]">
                <ShieldCheck className="w-5 h-5 text-[#000000] shrink-0 mt-0.5" />
                <p className="font-medium">
                  <strong>Staples Vault Rules:</strong> Items here automatically deduct from your grocery list so you never re-buy salt, pepper, or olive oil every week. If you're running low, toggle the button to add it to this week's list.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {staples.map((staple) => (
                  <div
                    key={staple.id}
                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#000000] bg-[#ffffff] hover:bg-[#f3f3f1] transition-colors"
                  >
                    <div>
                      <h4 className="font-display text-base sm:text-lg font-extrabold text-[#000000]">
                        {staple.name}
                      </h4>
                      <span className="text-xs font-bold text-[#000000]/60">
                        {staple.category} &middot; Base Unit: {staple.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStapleRunningLow(staple.id)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-2 border-[#000000] transition-transform active:translate-y-0.5 cursor-pointer ${
                        staple.isRunningLow
                          ? 'bg-[#e9c0e9] text-[#000000]'
                          : 'bg-[#d2e823] text-[#000000]'
                      }`}
                    >
                      {staple.isRunningLow ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-[#780016]" /> Running Low (On List)
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#000000]" /> In Stock (Deducted)
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Staple */}
              <form onSubmit={handleAddNewStaple} className="pt-4 border-t-2 border-[#000000]">
                <span className="block text-xs font-extrabold text-[#000000] mb-2 uppercase">
                  Add Custom Pantry Staple
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStapleName}
                    onChange={(e) => setNewStapleName(e.target.value)}
                    placeholder="e.g. Dijon Mustard, Apple Cider Vinegar"
                    className="flex-1 px-4 py-2.5 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d2e823]"
                  />
                  <select
                    value={newStapleUnit}
                    onChange={(e) => setNewStapleUnit(e.target.value)}
                    className="px-3 py-2.5 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl font-bold"
                  >
                    <option value="oz">oz</option>
                    <option value="tbsp">tbsp</option>
                    <option value="lb">lb</option>
                    <option value="item">item</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-[#d2e823] text-[#000000] border-2 border-[#000000] rounded-xl hover:bg-[#c2d718] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-xs sm:text-sm text-[#000000] bg-[#f3f3f1] p-3.5 rounded-2xl border-2 border-[#000000] font-medium">
                Check your fridge before shopping. Enter what you already have on hand to buy only the net amount.
              </div>

              {perishableList.length === 0 ? (
                <p className="text-sm text-[#000000]/60 text-center py-6 font-medium">
                  No active recipe ingredients found.
                </p>
              ) : (
                <div className="space-y-3">
                  {perishableList.map((item) => (
                    <div
                      key={item.name}
                      className="p-4 rounded-2xl border-2 border-[#000000] bg-[#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-display text-base sm:text-lg font-extrabold text-[#000000] capitalize">
                          {item.name}
                        </h4>
                        <span className="text-xs text-[#000000]/60 font-semibold">
                          {item.category} &middot; Total Demand: <strong>{formatQuantity(item.needed)} {item.unit}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[#f3f3f1] px-3 py-1.5 rounded-full border-2 border-[#000000]">
                          <span className="text-xs font-bold text-[#000000]/70 mr-1">
                            Have:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePerishableOnHand(
                                item.name,
                                Math.max(0, item.onHand - 1)
                              )
                            }
                            className="w-5 h-5 rounded-full border border-[#000000] flex items-center justify-center hover:bg-[#ffffff] text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.onHand || ''}
                            placeholder="0"
                            onChange={(e) =>
                              onUpdatePerishableOnHand(
                                item.name,
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="w-10 text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePerishableOnHand(item.name, item.onHand + 1)
                            }
                            className="w-5 h-5 rounded-full border border-[#000000] flex items-center justify-center hover:bg-[#ffffff] text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-xs text-[#000000]/70 font-bold ml-1">
                            {item.unit}
                          </span>
                        </div>

                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase border-2 border-[#000000] text-right min-w-28 ${
                            item.netPurchase <= 0
                              ? 'bg-[#d2e823] text-[#000000]'
                              : 'bg-[#e9c0e9] text-[#000000]'
                          }`}
                        >
                          {item.netPurchase <= 0
                            ? '0 to buy'
                            : `Buy ${formatQuantity(item.netPurchase)} ${item.unit}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f3f3f1] border-t-2 border-[#000000] flex items-center justify-between text-xs text-[#000000]/70 font-medium">
          <span>Deductions sync immediately with your grocery list.</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-[#d2e823] text-[#000000] rounded-full border-2 border-[#000000] hover:bg-[#c2d718] active:translate-y-0.5 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
