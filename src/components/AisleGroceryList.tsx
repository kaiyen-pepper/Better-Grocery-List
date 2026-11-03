import React, { useState } from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { AisleCategory, GroceryItem, Recipe } from '../types/recipe';
import { formatQuantity } from '../utils/conversions';

interface AisleGroceryListProps {
  groceryItems: GroceryItem[];
  recipes: Recipe[];
  onToggleItemCheck: (itemId: string) => void;
  onClearChecked: () => void;
  onOpenExportModal: () => void;
}

const AISLE_ORDER: { category: AisleCategory; description: string }[] = [
  { category: 'Produce', description: 'Fresh vegetables, herbs, garlic, onions & citrus' },
  { category: 'Meat & Seafood', description: 'Poultry, beef, steak, fish & proteins' },
  { category: 'Dairy', description: 'Butter, heavy cream, milk, cheeses & eggs' },
  { category: 'Spices & Oils', description: 'Olive oil, cooking fats, salt & dried spices' },
  { category: 'Canned & Dry Goods', description: 'Canned beans, tomatoes, broths & stocks' },
  { category: 'Pantry', description: 'Grains, rice, sauces, honey & baking basics' },
  { category: 'Other', description: 'Specialty & miscellaneous goods' },
];

export const AisleGroceryList: React.FC<AisleGroceryListProps> = ({
  groceryItems,
  recipes,
  onToggleItemCheck,
  onClearChecked,
  onOpenExportModal,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('all');
  const [hideChecked, setHideChecked] = useState(false);

  const activeRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // Group items by aisle
  const itemsByAisle: Record<AisleCategory, GroceryItem[]> = {
    'Produce': [],
    'Meat & Seafood': [],
    'Dairy': [],
    'Spices & Oils': [],
    'Pantry': [],
    'Canned & Dry Goods': [],
    'Other': [],
  };

  groceryItems.forEach((item) => {
    if (itemsByAisle[item.category]) {
      itemsByAisle[item.category].push(item);
    } else {
      itemsByAisle['Other'].push(item);
    }
  });

  return (
    <section id="aisle-list" className="mb-14">
      {/* Aisle List Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b-2 border-[#000000]">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] text-[#000000]">
            Organized Store Aisles
          </h2>
          <p className="text-sm text-[#000000]/70 font-medium mt-1">
            Tap any recipe tab to highlight its ingredients. Unrelated aisle items dim to 30% without disappearing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideChecked(!hideChecked)}
            className="px-4 py-2 text-xs font-bold text-[#000000] bg-[#ffffff] border-2 border-[#000000] rounded-full hover:bg-[#f3f3f1] active:translate-y-0.5 cursor-pointer"
          >
            {hideChecked ? 'Show Checked' : 'Hide Checked'}
          </button>
          <button
            onClick={onClearChecked}
            className="px-4 py-2 text-xs font-bold text-[#000000] bg-[#ffffff] border-2 border-[#000000] rounded-full hover:bg-[#780016] hover:text-[#ffffff] active:translate-y-0.5 transition-colors cursor-pointer"
          >
            Reset Checks
          </button>
        </div>
      </div>

      {/* Multi-Recipe Navigation Tabs (Bento Pill Stickers) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        {/* 'ALL' Tab */}
        <button
          type="button"
          onClick={() => setSelectedRecipeId('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border-2 border-[#000000] active:translate-y-0.5 ${
            selectedRecipeId === 'all'
              ? 'bg-[#000000] text-[#ffffff]'
              : 'bg-[#ffffff] text-[#000000] hover:bg-[#ebffc5]'
          }`}
        >
          ALL RECIPES (NET AGGREGATED)
        </button>

        {/* Individual Recipe Tabs */}
        {recipes.map((recipe) => {
          const isSelected = selectedRecipeId === recipe.id;
          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setSelectedRecipeId(recipe.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border-2 border-[#000000] active:translate-y-0.5 ${
                isSelected
                  ? 'bg-[#d2e823] text-[#000000]'
                  : 'bg-[#ffffff] text-[#000000] hover:bg-[#f3f3f1]'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-[#000000] shrink-0"
                style={{ backgroundColor: recipe.colorTag.accent }}
              />
              <span className="truncate max-w-44 font-display font-extrabold">
                {recipe.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* When specific tab is selected: show active recipe context banner */}
      {selectedRecipeId !== 'all' && activeRecipe && (
        <div className="bg-[#ffffff] p-5 rounded-[32px] border-2 border-[#000000] mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-full border border-[#000000] shrink-0"
              style={{ backgroundColor: activeRecipe.colorTag.accent }}
            />
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#000000]">
                {activeRecipe.title} ({activeRecipe.servings} Servings)
              </h3>
              <span className="text-xs text-[#000000]/70 font-bold">
                {activeRecipe.channelTitle}
              </span>
            </div>
          </div>

          <a
            href={activeRecipe.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 text-xs font-extrabold text-[#000000] bg-[#ebffc5] border border-[#000000] rounded-full hover:bg-[#d2e823] flex items-center gap-1.5 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
          </a>
        </div>
      )}

      {/* Aisle Category Columns in Bento Cards */}
      <div className="space-y-6">
        {AISLE_ORDER.map(({ category, description }) => {
          let items = itemsByAisle[category] || [];
          if (items.length === 0) return null;

          if (hideChecked) {
            items = items.filter((i) => !i.isChecked);
            if (items.length === 0) return null;
          }

          const allCategoryItems = itemsByAisle[category] || [];
          const totalCategoryItems = allCategoryItems.length;
          const uncheckedCount = allCategoryItems.filter((i) => !i.isChecked).length;
          const isCategoryComplete = totalCategoryItems > 0 && uncheckedCount === 0;

          // Sort items dynamically:
          // If a specific recipe is selected, items used in this recipe jump to the top!
          const sortedItems = [...items].sort((a, b) => {
            if (selectedRecipeId !== 'all') {
              const aInRecipe = a.recipeBreakdown.some((r) => r.recipeId === selectedRecipeId);
              const bInRecipe = b.recipeBreakdown.some((r) => r.recipeId === selectedRecipeId);
              if (aInRecipe && !bInRecipe) return -1;
              if (!aInRecipe && bInRecipe) return 1;
            }
            if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
            return a.name.localeCompare(b.name);
          });

          return (
            <div
              key={category}
              className="bg-[#ffffff] rounded-[32px] p-6 border-2 border-[#000000] transition-all"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#000000]">
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-[#000000]">
                    {category}
                  </h3>
                  <span className="text-xs text-[#000000]/60 font-medium">
                    {description}
                  </span>
                </div>

                {isCategoryComplete ? (
                  <span className="text-xs font-extrabold bg-[#d2e823] text-[#000000] border-2 border-[#000000] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-none">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Completed
                  </span>
                ) : (
                  <span className="text-xs font-extrabold bg-[#f3f3f1] border-2 border-[#000000] px-3 py-1 rounded-full text-[#000000] shadow-none">
                    {uncheckedCount} {uncheckedCount === 1 ? 'item' : 'items'} left
                  </span>
                )}
              </div>

              {/* Items List in this Aisle */}
              <div className="divide-y border-[#000000]/10">
                {sortedItems.map((item) => {
                  const isInActiveRecipe =
                    selectedRecipeId === 'all' ||
                    item.recipeBreakdown.some((r) => r.recipeId === selectedRecipeId);

                  const activeRecipeContribution = item.recipeBreakdown.find(
                    (r) => r.recipeId === selectedRecipeId
                  );

                  // Opacity rule: Non-recipe items fade to 30% when a recipe tab is selected!
                  const isDimmed = selectedRecipeId !== 'all' && !isInActiveRecipe;

                  return (
                    <div
                      key={item.id}
                      className={`py-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDimmed ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      {/* Left: Checkbox + Name + Quantity calculation */}
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => onToggleItemCheck(item.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border-2 border-[#000000] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            item.isChecked
                              ? 'bg-[#000000] text-[#d2e823]'
                              : 'bg-[#ffffff] hover:bg-[#ebffc5]'
                          }`}
                        >
                          {item.isChecked && <Check className="w-4 h-4 stroke-[2.5]" />}
                        </button>

                        <div>
                          <div className="flex items-baseline gap-2.5 flex-wrap">
                            <span
                              className={`text-base sm:text-lg font-bold ${
                                isInActiveRecipe && selectedRecipeId !== 'all'
                                  ? 'font-extrabold text-[#000000]'
                                  : 'text-[#000000]'
                              } ${item.isChecked ? 'line-through opacity-40' : ''}`}
                            >
                              {item.name}
                            </span>

                            {/* Quantity Display Logic (always show quantity, strike-through when checked) */}
                            {selectedRecipeId === 'all' ? (
                              <span
                                className={`font-mono font-bold text-sm ${
                                  item.isChecked ? 'line-through opacity-40 text-[#000000]' : 'text-[#000000]'
                                }`}
                              >
                                {formatQuantity(item.netToBuy)} {item.unit}
                                {item.onHandAmount > 0 && (
                                  <span className="text-xs opacity-60 font-normal ml-1">
                                    (need {formatQuantity(item.totalNeeded)}, {formatQuantity(item.onHandAmount)} on-hand)
                                  </span>
                                )}
                              </span>
                            ) : isInActiveRecipe && activeRecipeContribution ? (
                              <span
                                className={`font-mono font-bold text-sm ${
                                  item.isChecked ? 'line-through opacity-40 text-[#000000]' : 'text-[#000000]'
                                }`}
                              >
                                {formatQuantity(activeRecipeContribution.amount)} {activeRecipeContribution.unit}
                              </span>
                            ) : (
                              <span className="font-mono text-xs opacity-50">
                                (other recipes)
                              </span>
                            )}
                          </div>

                          {/* Recipe Breakdown Pills */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {item.recipeBreakdown.map((b) => (
                              <span
                                key={b.recipeId}
                                className="text-[11px] font-bold text-[#000000] bg-[#f3f3f1] border border-[#000000] px-2 py-0.5 rounded-full flex items-center gap-1"
                              >
                                <span
                                  className="w-2 h-2 rounded-full border border-[#000000]"
                                  style={{ backgroundColor: b.colorTag.accent }}
                                />
                                <span>{b.recipeTitle.slice(0, 24)}...</span>
                              </span>
                            ))}

                            {item.isStapleDeducted && (
                              <span className="text-[11px] font-extrabold bg-[#ebffc5] border border-[#000000] px-2 py-0.5 rounded-full text-[#000000]">
                                In Pantry Vault
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Package estimate & Price */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right font-mono text-xs">
                        <span className="font-extrabold text-sm text-[#000000]">
                          ${item.registerCost.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#000000]/70 font-sans font-medium">
                          {item.packageCount} &times; {item.packageSize} {item.packageUnit} pack
                          {item.packageCount > 1 ? 's' : ''} (${item.usageCost.toFixed(2)} used)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
