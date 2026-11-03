import React, { useState, useEffect } from 'react';
import { DollarSign, RotateCcw, Plus, Search } from 'lucide-react';
import { PriceCatalogItem } from '../types/recipe';
import { DEFAULT_PRICE_CATALOG } from '../utils/sampleData';

interface PricingCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: PriceCatalogItem[];
  onUpdateCatalogItem: (item: PriceCatalogItem) => void;
  onAddCatalogItem: (item: Omit<PriceCatalogItem, 'id'>) => void;
  onResetCatalog: () => void;
}

export const PricingCatalogModal: React.FC<PricingCatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onUpdateCatalogItem,
  onAddCatalogItem,
  onResetCatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PriceCatalogItem['category']>('Produce');
  const [newItemPackageSize, setNewItemPackageSize] = useState<number>(1);
  const [newItemPackageUnit, setNewItemPackageUnit] = useState('item');
  const [newItemPrice, setNewItemPrice] = useState<number>(2.99);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Produce', 'Meat & Seafood', 'Dairy', 'Spices & Oils', 'Pantry', 'Canned & Dry Goods'];

  const filteredItems = catalog.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddCatalogItem({
      name: newItemName.trim(),
      category: newItemCategory,
      packageSize: Number(newItemPackageSize) || 1,
      packageUnit: newItemPackageUnit,
      packagePrice: Number(newItemPrice) || 0,
    });
    setNewItemName('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#000000]/60 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#ffffff] rounded-[32px] max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-[#000000] shadow-none overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-[#000000] bg-[#f3f3f1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#000000]">
                Local Price Catalog
              </h2>
              <p className="text-xs sm:text-sm text-[#000000]/70 font-medium mt-0.5">
                Customize package sizes and local prices. Stored locally without external trackers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onResetCatalog}
                className="px-4 py-2 text-xs font-bold text-[#000000] bg-[#ffffff] border-2 border-[#000000] rounded-full hover:bg-[#ebffc5] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-extrabold text-[#ffffff] bg-[#000000] border-2 border-[#000000] rounded-full hover:bg-[#333333] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#000000]/50" />
              <input
                type="text"
                placeholder="Search catalog items (e.g., chicken, garlic, rice)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-full focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-extrabold rounded-full whitespace-nowrap transition-colors cursor-pointer border-2 border-[#000000] ${
                    selectedCategory === cat
                      ? 'bg-[#000000] text-[#ffffff]'
                      : 'bg-[#ffffff] text-[#000000] hover:bg-[#ebffc5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          <div className="border-2 border-[#000000] rounded-2xl overflow-hidden bg-[#ffffff]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f3f3f1] border-b-2 border-[#000000] text-[#000000] uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Aisle Category</th>
                  <th className="py-3 px-4 text-center">Retail Pack Size</th>
                  <th className="py-3 px-4 text-center">Pack Unit</th>
                  <th className="py-3 px-4 text-right">Retail Pack Price ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[#000000]/10 font-mono">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f3f3f1]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#000000] font-sans">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-[11px] text-[#000000]/70 font-sans">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.packageSize}
                        onChange={(e) =>
                          onUpdateCatalogItem({
                            ...item,
                            packageSize: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="w-16 px-2 py-1 text-center bg-[#f3f3f1] border border-[#000000] rounded-lg text-xs font-bold"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="text"
                        value={item.packageUnit}
                        onChange={(e) =>
                          onUpdateCatalogItem({
                            ...item,
                            packageUnit: e.target.value,
                          })
                        }
                        className="w-16 px-2 py-1 text-center bg-[#f3f3f1] border border-[#000000] rounded-lg text-xs font-bold"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-[#f3f3f1] px-2 py-1 border border-[#000000] rounded-lg">
                        <span className="text-[#000000]/60">$</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={item.packagePrice}
                          onChange={(e) =>
                            onUpdateCatalogItem({
                              ...item,
                              packagePrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-16 text-right text-xs font-bold tabular-nums bg-transparent focus:outline-none"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Item Strip */}
          <form onSubmit={handleAddSubmit} className="mt-6 p-4 bg-[#f3f3f1] rounded-2xl border-2 border-[#000000]">
            <span className="block text-xs font-extrabold text-[#000000] mb-3 uppercase">
              Add Custom Item to Local Catalog
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <input
                type="text"
                placeholder="Item name (e.g. Tofu)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="px-3.5 py-2 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl font-medium"
                required
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-3 py-2 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl font-bold"
              >
                <option value="Produce">Produce</option>
                <option value="Meat & Seafood">Meat &amp; Seafood</option>
                <option value="Dairy">Dairy</option>
                <option value="Spices & Oils">Spices &amp; Oils</option>
                <option value="Pantry">Pantry</option>
                <option value="Canned & Dry Goods">Canned &amp; Dry Goods</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Pack Size"
                step="0.1"
                min="0.1"
                value={newItemPackageSize}
                onChange={(e) => setNewItemPackageSize(parseFloat(e.target.value) || 1)}
                className="px-3 py-2 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl text-center font-mono font-bold"
              />
              <input
                type="text"
                placeholder="Unit (e.g. oz, lb)"
                value={newItemPackageUnit}
                onChange={(e) => setNewItemPackageUnit(e.target.value)}
                className="px-3 py-2 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl text-center font-bold"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price ($)"
                  step="0.05"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-xl text-right font-mono font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d2e823] text-[#000000] border-2 border-[#000000] rounded-xl hover:bg-[#c2d718] text-xs font-extrabold flex items-center justify-center cursor-pointer active:translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
