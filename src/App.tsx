/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  PlusCircle,
  ShoppingBag,
  Package,
  Send,
  Copy,
  Youtube,
  Sparkles,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Layers,
  Check,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  Edit2,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  FileText,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import {
  GroceryItem,
  PackagingMode,
  PantryItem,
  PriceCatalogItem,
  Recipe,
  AisleCategory
} from './types/recipe';
import {
  DEFAULT_PRICE_CATALOG,
  DEFAULT_STAPLES_VAULT,
  RECIPE_COLOR_PALETTES,
  SAMPLE_RECIPE_PRESETS,
} from './utils/sampleData';
import { normalizeToCatalogUnit } from './utils/conversions';

/**
 * Tooltip wrapper that detects if the text is truncated / overflowing
 * and renders a floating receipt tooltip on hover.
 */
function TruncatedGroceryItemName({
  name,
  isChecked,
  isActiveRecipe,
  isAllTab,
  category,
  neededAmount,
  unit,
}: {
  name: string;
  isChecked?: boolean;
  isActiveRecipe?: boolean;
  isAllTab?: boolean;
  category?: string;
  neededAmount?: number;
  unit?: string;
}) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const checkOverflow = () => {
    if (spanRef.current) {
      // scrollWidth > clientWidth identifies if the text is not fully visible
      const hasOverflow = spanRef.current.scrollWidth > spanRef.current.clientWidth;
      setIsTruncated(hasOverflow);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [name]);

  return (
    <div
      className="relative min-w-0 max-w-full inline-flex items-center"
      onMouseEnter={() => {
        checkOverflow();
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
      title={isTruncated ? name : undefined}
    >
      <span
        ref={spanRef}
        className={`truncate block ${
          isChecked ? 'line-through text-[#9C968A]' : ''
        } ${isActiveRecipe && !isAllTab ? 'font-bold underline' : ''}`}
      >
        {name}
      </span>

      {/* Floating tooltip displayed when text is truncated on hover */}
      {showTooltip && isTruncated && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 pointer-events-none animate-fadeIn">
          <div className="bg-[#1C1A18] text-[#FBF9F5] text-xs font-mono px-3 py-1.5 rounded shadow-2xl border border-[#3A3835] whitespace-nowrap max-w-xs sm:max-w-md">
            <div className="font-bold text-[#F5F2EC]">{name}</div>
            {category && (
              <div className="text-[10px] text-[#A8A296] font-normal mt-0.5">
                {category} {neededAmount !== undefined && unit ? `• Need: ${neededAmount} ${unit}` : ''}
              </div>
            )}
            <div className="w-2 h-2 bg-[#1C1A18] border-r border-b border-[#3A3835] rotate-45 absolute left-3 -bottom-1"></div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function App() {
  // Navigation: 5 views from mockup
  const [activeView, setActiveView] = useState<'add_recipe' | 'pantry' | 'grocery' | 'catalog' | 'sms'>('grocery');
  const [selectedRecipeTab, setSelectedRecipeTab] = useState<string>('ALL'); // 'ALL' or recipe.id

  // Data State
  const [recipes, setRecipes] = useState<Recipe[]>([
    SAMPLE_RECIPE_PRESETS[0],
    SAMPLE_RECIPE_PRESETS[1],
  ]);
  const [staples, setStaples] = useState<PantryItem[]>(DEFAULT_STAPLES_VAULT);
  const [perishablesOnHand, setPerishablesOnHand] = useState<Record<string, number>>({
    'garlic': 2,
    'yellow onion': 1,
  });
  const [catalog, setCatalog] = useState<PriceCatalogItem[]>(DEFAULT_PRICE_CATALOG);
  const [packagingMode, setPackagingMode] = useState<'loose' | 'bulk'>('bulk');
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(new Set());

  // Quick Load Recipes toggle state (recipe extraction page)
  const [showQuickLoadRecipes, setShowQuickLoadRecipes] = useState<boolean>(true);

  // Input States for Recipe Extraction
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Validation & Error states for recipe extraction
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  const [extractionAlert, setExtractionAlert] = useState<{
    message: string;
    reason?: string | null;
    videoTitle?: string | null;
    thumbnailUrl?: string | null;
    needsFallback?: boolean;
  } | null>(null);
  const [showManualFallback, setShowManualFallback] = useState<boolean>(false);

  // Sidebar Open/Collapse Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // SMS State
  const [smsPhone, setSmsPhone] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Custom addition & editing states for Pantry & Catalog
  const [newStapleName, setNewStapleName] = useState('');
  const [newStapleUnit, setNewStapleUnit] = useState('oz');
  const [newStapleCategory, setNewStapleCategory] = useState<AisleCategory>('Pantry');
  const [editingStapleId, setEditingStapleId] = useState<string | null>(null);
  const [editingStapleUnit, setEditingStapleUnit] = useState('');
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogPrice, setNewCatalogPrice] = useState('2.99');
  const [newCatalogSize, setNewCatalogSize] = useState('1');
  const [newCatalogUnit, setNewCatalogUnit] = useState('lb');
  const [newCatalogCategory, setNewCatalogCategory] = useState<AisleCategory>('Produce');

  // Catalog search & filtering state
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Catalog item editing & closest-item matching states
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    packagePrice: string;
    packageSize: string;
    packageUnit: string;
    category: AisleCategory;
  }>({
    name: '',
    packagePrice: '2.99',
    packageSize: '1',
    packageUnit: 'lb',
    category: 'Produce',
  });
  // Toggle / dropdown state for adding new catalog item
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);

  // Trigger floating toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- RECIPE MANAGEMENT ---
  const handleAddRecipe = (recipe: Recipe) => {
    const colorTag =
      recipe.colorTag ||
      RECIPE_COLOR_PALETTES[recipes.length % RECIPE_COLOR_PALETTES.length];

    setRecipes((prev) => [
      ...prev,
      {
        ...recipe,
        id: recipe.id || `recipe-${Date.now()}`,
        defaultServings: recipe.defaultServings || recipe.servings || 4,
        colorTag,
      },
    ]);
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipeTab === recipeId) {
      setSelectedRecipeTab('ALL');
    }
    triggerToast('Removed recipe from queue');
  };

  const handleUpdateServings = (recipeId: string, delta: number) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const newServings = Math.max(1, r.servings + delta);
          return { ...r, servings: newServings };
        }
        return r;
      })
    );
  };

  // Move selected recipe to the front of the recipe tabs list and select it
  const handleSelectRecipeTab = (recId: string) => {
    setSelectedRecipeTab(recId);
    setRecipes((prev) => {
      const index = prev.findIndex((r) => r.id === recId);
      if (index <= 0) return prev;
      const target = prev[index];
      const remaining = prev.filter((r) => r.id !== recId);
      return [target, ...remaining];
    });
  };

  // Domain Validation helper: Matches hostname against valid YouTube domains
  const validateYouTubeUrl = (urlStr: string): { isValid: boolean; error?: string } => {
    if (!urlStr || !urlStr.trim()) {
      return { isValid: false, error: 'Please enter a YouTube video URL.' };
    }
    const trimmed = urlStr.trim();
    try {
      const urlObj = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
      const hostname = urlObj.hostname.toLowerCase();
      const validYouTubeHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
      if (!validYouTubeHosts.includes(hostname)) {
        return {
          isValid: false,
          error: 'Only YouTube URLs are supported in this prototype. Please paste a standard YouTube video link.',
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'Only YouTube URLs are supported in this prototype. Please paste a standard YouTube video link.',
      };
    }
  };

  // --- REAL GEMINI RECIPE EXTRACTION ---
  const handleExtractRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() && !rawText.trim()) {
      triggerToast('Please provide a YouTube URL or paste recipe ingredients.');
      return;
    }

    // 1. Handling Non-YouTube URLs (Domain Validation)
    if (youtubeUrl.trim()) {
      const domainCheck = validateYouTubeUrl(youtubeUrl);
      if (!domainCheck.isValid) {
        const errorMsg = 'Only YouTube URLs are supported in this prototype. Please paste a standard YouTube video link.';
        setUrlValidationError(errorMsg);
        triggerToast(errorMsg);
        return;
      }
    }

    setUrlValidationError(null);
    setExtractionAlert(null);
    setIsExtracting(true);

    try {
      const res = await fetch('/api/youtube/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl.trim() || undefined,
          rawText: rawText.trim() || undefined,
          manualTitle: manualTitle.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Failed to extract recipe.';
        if (errorMsg.includes('Only YouTube URLs are supported')) {
          setUrlValidationError(errorMsg);
        }
        triggerToast(errorMsg);
        return;
      }

      // 2 & 3. Content Validation & Error Handling UI State
      // Reject Queue Addition if not a recipe or if ingredients were not detected
      if (data.is_recipe === false || !data.success) {
        const alertMsg = 'No ingredients could be detected in this video. If the description is missing them, try pasting the recipe text manually.';
        triggerToast(alertMsg);
        setExtractionAlert({
          message: alertMsg,
          reason: data.confidence_reason || null,
          videoTitle: data.title || manualTitle || null,
          thumbnailUrl: data.thumbnailUrl || null,
          needsFallback: true,
        });
        // Automatically surface manual paste fallback
        setShowManualFallback(true);
        return;
      }

      if (data.recipe) {
        handleAddRecipe(data.recipe);
        setYoutubeUrl('');
        setRawText('');
        setManualTitle('');
        setUrlValidationError(null);
        setExtractionAlert(null);
        setShowManualFallback(false);
        setActiveView('grocery');
        triggerToast('Extracted & normalized recipe!');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Recipe extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Preset YouTube Links helper
  const loadPreset = (title: string, url: string, text: string) => {
    setYoutubeUrl(url);
    setRawText(text);
    setManualTitle(title);
    triggerToast(`Loaded preset: ${title}`);
  };

  // Quick-add tested sample presets directly
  const quickAddPreset = (index: number) => {
    const preset = SAMPLE_RECIPE_PRESETS[index];
    if (preset) {
      handleAddRecipe(preset);
      setActiveView('grocery');
      triggerToast(`Added: ${preset.title}`);
    }
  };

  // --- PANTRY ACTIONS & HANDLERS ---
  const togglePantryStatus = (id: string) => {
    setStaples((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRunningLow: !item.isRunningLow } : item
      )
    );
  };

  const handleRemoveStaple = (id: string, name: string) => {
    setStaples((prev) => prev.filter((item) => item.id !== id));
    if (editingStapleId === id) {
      setEditingStapleId(null);
    }
    triggerToast(`Removed ${name} from pantry vault`);
  };

  const handleStartEditStapleUnit = (item: PantryItem) => {
    setEditingStapleId(item.id);
    setEditingStapleUnit(item.unit || 'oz');
  };

  const handleSaveStapleUnit = (id: string) => {
    const updatedUnit = editingStapleUnit.trim() || 'item';
    setStaples((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit: updatedUnit } : item
      )
    );
    setEditingStapleId(null);
    triggerToast(`Updated staple unit to "${updatedUnit}"`);
  };

  const handleAddCustomStaple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStapleName.trim()) return;
    const finalUnit = newStapleUnit.trim() || 'item';
    const newItem: PantryItem = {
      id: `staple-${Date.now()}`,
      name: newStapleName.trim(),
      category: newStapleCategory,
      onHandAmount: 1,
      unit: finalUnit,
      isStaple: true,
      isRunningLow: false,
    };
    setStaples((prev) => [...prev, newItem]);
    setNewStapleName('');
    setNewStapleUnit('oz');
    triggerToast(`Added ${newItem.name} (${finalUnit}) to pantry vault`);
  };

  const handleResetStaples = () => {
    setStaples(DEFAULT_STAPLES_VAULT);
    setEditingStapleId(null);
    triggerToast('Reset pantry staples to default vault');
  };

  const handleRemovePerishable = (nameKey: string) => {
    setPerishablesOnHand((prev) => {
      const next = { ...prev };
      delete next[nameKey];
      return next;
    });
    triggerToast(`Removed ${nameKey} from on-hand pantry`);
  };

  // --- CATALOG ACTIONS & EDITING ---
  const startEditCatalogItem = (item: PriceCatalogItem) => {
    setEditingCatalogId(item.id);
    setEditDraft({
      name: item.name,
      packagePrice: item.packagePrice.toString(),
      packageSize: item.packageSize.toString(),
      packageUnit: item.packageUnit,
      category: (item.category as AisleCategory) || 'Produce',
    });
  };

  const handleSaveCatalogEdit = (id: string) => {
    if (!editDraft.name.trim()) {
      triggerToast('Item name cannot be empty');
      return;
    }
    const updatedPrice = parseFloat(editDraft.packagePrice) || 0;
    const updatedSize = parseFloat(editDraft.packageSize) || 1;

    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: editDraft.name.trim(),
              packagePrice: updatedPrice,
              packageSize: updatedSize,
              packageUnit: editDraft.packageUnit.trim() || item.packageUnit,
              category: editDraft.category,
            }
          : item
      )
    );
    setEditingCatalogId(null);
    triggerToast(`Updated ${editDraft.name.trim()} in price catalog`);
  };

  const handleDeleteCatalogItem = (id: string, name: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    if (editingCatalogId === id) {
      setEditingCatalogId(null);
    }
    triggerToast(`Removed ${name} from price catalog`);
  };

  const handleAddCustomCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCatalogName.trim() || catalogSearchQuery.trim();
    if (!trimmedName) return;

    const newItem: PriceCatalogItem = {
      id: `cat-${Date.now()}`,
      name: trimmedName,
      category: newCatalogCategory,
      packagePrice: parseFloat(newCatalogPrice) || 2.99,
      packageSize: parseFloat(newCatalogSize) || 1,
      packageUnit: newCatalogUnit.trim() || 'lb',
    };

    setCatalog((prev) => [newItem, ...prev]);
    setNewCatalogName('');
    if (catalogSearchQuery.trim()) {
      setCatalogSearchQuery('');
    }

    triggerToast(`Added "${newItem.name}" to price catalog`);
  };

  // Filtered catalog list based on search bar query
  const filteredCatalog = useMemo(() => {
    const query = catalogSearchQuery.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.packageUnit.toLowerCase().includes(query)
      );
    });
  }, [catalog, catalogSearchQuery]);

  // --- IN-STORE SHOPPING CHECKMARKS ---
  const handleToggleItemCheck = (itemId: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // --- GROCERY AGGREGATION & PRICE CALCULATIONS ---
  const { aggregatedIngredients, financialTotals } = useMemo(() => {
    const itemMap: Record<
      string,
      {
        name: string;
        category: AisleCategory;
        unit: string;
        totalNeeded: number;
        recipeBreakdown: Record<string, number>;
      }
    > = {};

    // 1. Accumulate demand across all recipes scaled by servings
    recipes.forEach((rec) => {
      const multiplier = (rec.defaultServings && rec.defaultServings > 0)
        ? rec.servings / rec.defaultServings
        : 1;

      rec.ingredients.forEach((ing) => {
        const canonicalName = ing.name.trim();
        const key = canonicalName.toUpperCase();
        const scaledAmount = Number((ing.amount * multiplier).toFixed(2));

        if (!itemMap[key]) {
          itemMap[key] = {
            name: canonicalName,
            category: ing.category,
            unit: ing.unit,
            totalNeeded: 0,
            recipeBreakdown: {},
          };
        }
        itemMap[key].totalNeeded += scaledAmount;
        itemMap[key].recipeBreakdown[rec.id] = (itemMap[key].recipeBreakdown[rec.id] || 0) + scaledAmount;
      });
    });

    let runningRegisterTotal = 0;
    let runningUsageTotal = 0;

    // 2. Pantry Deduplication & Pricing
    const list = Object.values(itemMap).map((item) => {
      const lowerKey = item.name.toLowerCase();

      // Check persistent staples vault
      const stapleMatch = staples.find(
        (s) => s.name.toLowerCase() === lowerKey || lowerKey.includes(s.name.toLowerCase())
      );
      const isPantryStocked = stapleMatch ? !stapleMatch.isRunningLow : false;

      // On-hand check
      const perishableOnHand = perishablesOnHand[lowerKey] || 0;
      const onHand = isPantryStocked ? item.totalNeeded : perishableOnHand;
      const netNeeded = Math.max(0, Number((item.totalNeeded - onHand).toFixed(2)));

      // Find in price catalog
      const catalogItem = catalog.find(
        (c) =>
          c.name.toLowerCase() === lowerKey ||
          lowerKey.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(lowerKey)
      ) || {
        id: `fallback-${item.name}`,
        name: item.name,
        category: item.category,
        packageSize: 1,
        packageUnit: item.unit,
        packagePrice: 2.50,
      };

      const normalizedDemand = normalizeToCatalogUnit(
        netNeeded,
        item.unit,
        catalogItem.packageUnit,
        item.name
      );

      const pkgSize = catalogItem.packageSize > 0 ? catalogItem.packageSize : 1;
      const unitCost = catalogItem.packagePrice / pkgSize;

      const usageCost = normalizedDemand * unitCost;
      let registerCost = usageCost;
      let packagesToBuy = normalizedDemand;

      if (packagingMode === 'bulk' && pkgSize > 0) {
        packagesToBuy = netNeeded > 0 ? Math.ceil(normalizedDemand / pkgSize) : 0;
        registerCost = packagesToBuy * catalogItem.packagePrice;
      }

      runningRegisterTotal += registerCost;
      runningUsageTotal += usageCost;

      return {
        id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        category: item.category,
        unit: item.unit,
        totalAmount: Number(item.totalNeeded.toFixed(2)),
        netNeeded,
        isPantryStocked,
        usageCost,
        registerCost,
        packagesToBuy,
        recipeBreakdown: item.recipeBreakdown,
        unitCost,
        pkgName: `${catalogItem.packageSize} ${catalogItem.packageUnit} Package`,
        isChecked: checkedItemIds.has(`item-${item.name.toLowerCase().replace(/\s+/g, '-')}`),
      };
    });

    return {
      aggregatedIngredients: list,
      financialTotals: {
        registerTotal: runningRegisterTotal,
        usageTotal: runningUsageTotal,
      },
    };
  }, [recipes, staples, perishablesOnHand, catalog, packagingMode, checkedItemIds]);

  // Grouped by store aisle
  const groupedByAisle = useMemo(() => {
    const categories: AisleCategory[] = [
      'Produce',
      'Meat & Seafood',
      'Dairy',
      'Spices & Oils',
      'Pantry',
      'Canned & Dry Goods',
      'Other',
    ];
    const grouped: Record<string, typeof aggregatedIngredients> = {};
    categories.forEach((c) => (grouped[c] = []));

    aggregatedIngredients.forEach((item) => {
      const cat = grouped[item.category] ? item.category : 'Other';
      grouped[cat].push(item);
    });

    return grouped;
  }, [aggregatedIngredients]);

  // --- SMS TEXT GENERATOR ---
  const generateSmsText = () => {
    let text = "🛒 MEAL PREP GROCERY LIST\n";
    text += "-------------------------\n";

    Object.entries(groupedByAisle).forEach(([aisle, items]) => {
      const neededItems = items.filter((i) => i.netNeeded > 0);
      if (neededItems.length > 0) {
        text += `\n[ ${aisle.toUpperCase()} ]\n`;
        neededItems.forEach((i) => {
          text += `• [ ] ${i.name}: ${i.netNeeded} ${i.unit}\n`;
        });
      }
    });

    text += "\n-------------------------\n";
    text += "RECIPE REFERENCES:\n";
    recipes.forEach((r) => {
      text += `• ${r.title}: ${r.youtubeUrl || 'Custom Recipe'}\n`;
    });

    return text;
  };

  const copySmsToClipboard = () => {
    const content = generateSmsText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content);
    } else {
      const el = document.createElement('textarea');
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    triggerToast('Copied list to clipboard!');
  };

  return (
    <div className="flex h-screen bg-[#F4F1EA] text-[#1C1A18] font-mono select-none overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1C1A18] text-[#FBF9F5] px-4 py-3 rounded shadow-2xl flex items-center space-x-2 text-xs border border-amber-900/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Backdrop when sidebar is open on small viewports */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity"
        />
      )}

      {/* Floating Toggle Sidebar Icon Button (visible when sidebar is collapsed) */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2.5 bg-[#141414] hover:bg-[#22211F] text-[#E5E0D8] border border-[#2E2C29] rounded shadow-2xl flex items-center space-x-2 transition-all cursor-pointer group hover:border-amber-500/50"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8BBAA] pr-0.5">
            SIDEBAR
          </span>
        </button>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR - Hotel Folio / Luxury Minimal Aesthetic */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`bg-[#141414] text-[#E5E0D8] flex flex-col justify-between border-r border-[#2A2927] relative z-30 shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'w-80 opacity-100'
            : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
        }`}
      >
        <div className="w-80 h-full flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header Title Branding & Collapse Icon Button */}
            <div className="p-7 border-b border-[#262523]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-serif italic text-3xl font-light tracking-wide text-[#F5F2EC]">
                    Meal Prep
                  </h1>
                  <h2 className="font-serif italic text-2xl font-light tracking-wide text-[#C8BBAA] -mt-1">
                    Grocery Engine
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 -mr-1.5 -mt-1 rounded text-[#8E8A83] hover:text-[#F5F2EC] hover:bg-[#262523] border border-transparent hover:border-[#383531] transition cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-5 h-5 text-[#8E8A83] hover:text-[#F5F2EC]" />
                </button>
              </div>

              <p className="mt-5 text-[11px] leading-relaxed text-[#8E8A83] font-mono tracking-normal">
                Paste YouTube cooking videos or tap presets below. Ingredients normalize across recipes, deduct pantry stock, and group by aisle.
              </p>
            </div>

            {/* Sidebar Menu Items */}
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveView('add_recipe')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all cursor-pointer ${
                  activeView === 'add_recipe'
                    ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                    : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <PlusCircle className="w-4 h-4" />
                  <span>ADD RECIPE</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#55514A]" />
              </button>

              <button
                onClick={() => setActiveView('pantry')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all cursor-pointer ${
                  activeView === 'pantry'
                    ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                    : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4" />
                  <span>CURRENT PANTRY</span>
                </div>
                <span className="text-[10px] bg-[#2C2A28] px-2 py-0.5 rounded text-[#B8AF9F]">
                  {staples.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('grocery')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all cursor-pointer ${
                  activeView === 'grocery'
                    ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                    : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>GROCERY LIST</span>
                </div>
                <span className="text-[10px] bg-[#2C2A28] px-2 py-0.5 rounded text-[#B8AF9F]">
                  {recipes.length} RECIPES
                </span>
              </button>

              <button
                onClick={() => setActiveView('catalog')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all cursor-pointer ${
                  activeView === 'catalog'
                    ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                    : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4" />
                  <span>PRICE CATALOG</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#55514A]" />
              </button>

              <button
                onClick={() => setActiveView('sms')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all cursor-pointer ${
                  activeView === 'sms'
                    ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                    : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Send className="w-4 h-4" />
                  <span>SMS HANDOFF</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#55514A]" />
              </button>
            </nav>
          </div>

          {/* Footer Meta / Status */}
          <div className="p-6 border-t border-[#262523] text-[10px] text-[#6E6A62] space-y-2">
            <div className="flex justify-between items-center">
              <span>LOCAL ENGINE:</span>
              <span className="text-[#A09B90]">ACTIVE (OFFLINE)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>LLM PARSER:</span>
              <span className="text-[#A09B90]">GEMINI 3.8 FLASH</span>
            </div>
            <div className="pt-2 text-[9px] text-[#4E4B45] text-center border-t border-[#1F1E1C]">
              FOLIO SYSTEM • REVISION 2.4
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER - PAPER RECEIPT CANVAS */}
      {/* ---------------------------------------------------- */}
      <main className={`flex-1 overflow-y-auto flex justify-center items-start ${activeView === 'sms' ? 'p-3 sm:p-6' : 'p-4 sm:p-8 md:p-12'}`}>
        {/* Receipt Container Wrapper */}
        <div className={`w-full max-w-3xl bg-[#FBF9F5] text-[#1C1A18] shadow-2xl border border-[#E2DDD3] rounded-sm relative flex flex-col transition-all duration-300 ${activeView === 'sms' ? 'min-h-0' : 'min-h-[85vh]'}`}>
          {/* Decorative Receipt Serrated Top Edge */}
          <div className="h-2 w-full receipt-edge opacity-40"></div>

          <div className={`flex-1 flex flex-col justify-between ${activeView === 'sms' ? 'p-4 sm:p-6' : 'p-6 sm:p-10'}`}>
            <div>
              {/* Receipt Top Header */}
              <div className={`text-center border-b border-dashed border-[#D4CEBF] ${activeView === 'sms' ? 'pb-3 sm:pb-4' : 'pb-6'}`}>
                <h3 className="font-serif italic text-2xl font-normal tracking-wide text-[#2B2927]">
                  {activeView === 'add_recipe' && 'Recipe Extraction'}
                  {activeView === 'pantry' && 'Pantry Staples Vault'}
                  {activeView === 'grocery' && 'Master Grocery List'}
                  {activeView === 'catalog' && 'Local Price Catalog'}
                  {activeView === 'sms' && 'SMS Handoff'}
                </h3>
                <p className="mt-1 text-[10px] sm:text-[11px] tracking-widest text-[#8C867A] uppercase font-mono">
                  {activeView === 'sms'
                    ? 'COPY GROCERY LIST TO CLIPBOARD OR SEND DIRECTLY TO YOUR PHONE'
                    : 'OFFICIAL ITEMIZATION STATEMENT'}
                </p>
              </div>

              {/* ==================================================== */}
              {/* VIEW 1: ADD RECIPE VIEW */}
              {/* ==================================================== */}
              {activeView === 'add_recipe' && (
                <div className="mt-8 space-y-8">
                  {/* Preset Quick Loader with Toggle */}
                  <div className="border border-[#E0DACB] bg-[#F7F4EC] rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Youtube className="w-4 h-4 text-red-700" />
                        <span className="text-[11px] text-[#1C1A18] font-bold uppercase tracking-wider">
                          Quick Load Recipes (4 Tested Demos)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickLoadRecipes((prev) => !prev)}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-[#D4CEBF] bg-[#FBF9F5] hover:bg-[#EFEADF] text-[#1C1A18] flex items-center space-x-1.5 transition cursor-pointer"
                        title={showQuickLoadRecipes ? 'Hide quick load recipe demos' : 'Show quick load recipe demos'}
                      >
                        <span>{showQuickLoadRecipes ? 'TOGGLE OFF' : 'TOGGLE ON'}</span>
                        {showQuickLoadRecipes ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {showQuickLoadRecipes ? (
                      <div className="pt-2 border-t border-dashed border-[#D4CEBF] space-y-3">
                        <p className="text-[10px] text-[#7A7468]">
                          Select a tested YouTube meal prep preset to populate video URL, sample transcript, and ingredient parser:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              loadPreset(
                                SAMPLE_RECIPE_PRESETS[0].title,
                                SAMPLE_RECIPE_PRESETS[0].youtubeUrl,
                                'Chicken breast, chipotle in adobo, garlic, lime, extra virgin olive oil, basmati rice, black beans, cilantro, kosher salt'
                              )
                            }
                            className="p-3 border border-[#E0DACB] bg-[#FBF9F5] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition cursor-pointer"
                          >
                            <div className="flex items-center text-red-700 font-bold space-x-1">
                              <Youtube className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Ethan Chlebowski - Meal Prep Bowls</span>
                            </div>
                            <div className="text-[10px] text-[#7E786D]">
                              Extracts: Chicken Breast, Chipotle, Rice, Beans...
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              loadPreset(
                                SAMPLE_RECIPE_PRESETS[1].title,
                                SAMPLE_RECIPE_PRESETS[1].youtubeUrl,
                                'Cannellini beans, vegetable broth, baby spinach, yellow onion, garlic, olive oil, diced tomatoes, lemon'
                              )
                            }
                            className="p-3 border border-[#E0DACB] bg-[#FBF9F5] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition cursor-pointer"
                          >
                            <div className="flex items-center text-red-700 font-bold space-x-1">
                              <Youtube className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Rainbow Plant Life - Tuscan Soup</span>
                            </div>
                            <div className="text-[10px] text-[#7E786D]">
                              Extracts: Cannellini Beans, Broth, Spinach, Onion...
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              loadPreset(
                                SAMPLE_RECIPE_PRESETS[2].title,
                                SAMPLE_RECIPE_PRESETS[2].youtubeUrl,
                                'Sirloin steak, russet potatoes, unsalted butter, garlic, olive oil, soy sauce, salt, black pepper'
                              )
                            }
                            className="p-3 border border-[#E0DACB] bg-[#FBF9F5] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition cursor-pointer"
                          >
                            <div className="flex items-center text-red-700 font-bold space-x-1">
                              <Youtube className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Pro Home Cooks - Steak Bites</span>
                            </div>
                            <div className="text-[10px] text-[#7E786D]">
                              Extracts: Sirloin Steak, Russet Potatoes, Butter...
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              loadPreset(
                                SAMPLE_RECIPE_PRESETS[3].title,
                                SAMPLE_RECIPE_PRESETS[3].youtubeUrl,
                                'Chicken thighs, jasmine rice, soy sauce, clover honey, garlic, bell peppers, yellow onion, sesame seeds'
                              )
                            }
                            className="p-3 border border-[#E0DACB] bg-[#FBF9F5] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition cursor-pointer"
                          >
                            <div className="flex items-center text-red-700 font-bold space-x-1">
                              <Youtube className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Joshua Weissman - Honey Soy Prep</span>
                            </div>
                            <div className="text-[10px] text-[#7E786D]">
                              Extracts: Chicken Thighs, Jasmine Rice, Honey, Soy...
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#8C867A] flex items-center justify-between pt-1">
                        <span>Demo presets are toggled off.</span>
                        <button
                          type="button"
                          onClick={() => setShowQuickLoadRecipes(true)}
                          className="font-bold underline hover:text-[#1C1A18] cursor-pointer"
                        >
                          Show Presets (4)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Content Validation Notice / Alert Banner */}
                  {extractionAlert && (
                    <div className="border-2 border-dashed border-amber-600/70 bg-[#F5EFE1] p-4 sm:p-5 rounded text-xs space-y-3.5 animate-fadeIn">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-[#8C2E0B] tracking-wider uppercase text-[11px] flex items-center space-x-2">
                              <span>Content Validation Notice</span>
                              <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-normal">
                                Guardrail Active
                              </span>
                            </div>
                            <div className="text-[#3A332B] font-medium leading-relaxed text-xs">
                              {extractionAlert.message}
                            </div>
                            {extractionAlert.reason && (
                              <div className="text-[10px] text-[#6E6355] font-mono mt-1.5 bg-[#EAE1CE] px-2.5 py-1 rounded inline-block border border-[#D8CEBC]">
                                <span className="font-bold">Log:</span> {extractionAlert.reason}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExtractionAlert(null)}
                          className="text-[#8C867A] hover:text-[#1C1A18] p-1 rounded hover:bg-[#EAE1CE] transition cursor-pointer"
                          title="Dismiss notice"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Manual Fallback Action Link */}
                      <div className="pt-2.5 border-t border-dashed border-[#D8CEBC] flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] text-[#6E6355]">
                          Ingredients spoken aloud in the video? Use manual audio transcript fallback:
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowManualFallback(true);
                            const el = document.getElementById('manual-transcript-input');
                            if (el) el.focus();
                          }}
                          className="px-3 py-1.5 bg-[#8C2E0B] hover:bg-[#6D2409] text-[#FBF9F5] font-bold text-[10px] uppercase tracking-wider rounded transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open Transcript Fallback</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Extraction Form formatted as a receipt block */}
                  <form
                    onSubmit={handleExtractRecipe}
                    className="border border-[#DCD6C8] bg-[#F7F4EC] p-6 rounded space-y-5"
                  >
                    <div>
                      <label className="text-[11px] text-[#55514A] font-bold block mb-1 uppercase tracking-wider">
                        1. YOUTUBE VIDEO URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value);
                          if (urlValidationError) setUrlValidationError(null);
                        }}
                        className={`w-full bg-[#FBF9F5] border px-3 py-2 text-xs text-[#1C1A18] rounded focus:outline-none transition ${
                          urlValidationError
                            ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                            : 'border-[#D4CEBF] focus:border-[#1C1A18]'
                        }`}
                      />
                      {urlValidationError && (
                        <div className="mt-1.5 flex items-start space-x-1.5 text-[11px] text-red-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{urlValidationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Paste Fallback Accordion / Drawer */}
                    <div className="border border-[#DCD6C8] bg-[#F3EFE6] rounded p-3.5 sm:p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 items-start">
                        <div className="flex items-start space-x-2.5">
                          <FileText className="w-4 h-4 text-[#55514A] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-[#1C1A18] font-bold uppercase tracking-wider block">
                              Manual Transcript / Recipe Text Fallback
                            </span>
                            <span className="text-[10px] text-[#7E786D] block leading-snug">
                              For videos with spoken ingredients or descriptions lacking recipe text
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowManualFallback((prev) => !prev)}
                          className="w-full sm:w-auto px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border border-[#D4CEBF] bg-[#FBF9F5] hover:bg-[#EAE4D7] text-[#1C1A18] flex items-center justify-center space-x-1.5 transition cursor-pointer shrink-0"
                        >
                          <span>{showManualFallback ? 'HIDE FALLBACK' : 'PASTE TRANSCRIPT'}</span>
                          {showManualFallback ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {showManualFallback && (
                        <div className="pt-3 border-t border-dashed border-[#D4CEBF] space-y-3 animate-fadeIn">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <label className="text-[10px] text-[#55514A] font-bold uppercase tracking-wider">
                              Spoken Audio Transcript or Raw Ingredients Text:
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setRawText(
                                  "Ethan Chlebowski Spoken Transcript Demo:\nHey everyone, today we are prepping 4 high-protein chicken burrito bowls. You will need 2 pounds of boneless skinless chicken breasts, 2 tablespoons chipotle peppers in adobo sauce, 4 cloves fresh minced garlic, juice of 1 lime, 2 tablespoons extra virgin olive oil, and 1 teaspoon kosher salt. Cook 2 cups dry basmati rice in 3 cups vegetable broth, then fold in 1 can rinsed black beans, 1 diced red onion, and 1/2 cup fresh cilantro. Divide into 4 meal prep containers."
                                );
                                if (!manualTitle) {
                                  setManualTitle("Chipotle Chicken Meal Prep Bowls");
                                }
                                triggerToast("Loaded sample spoken audio transcript demo");
                              }}
                              className="text-[9px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer text-left sm:text-right"
                            >
                              Load Sample Spoken Transcript Demo
                            </button>
                          </div>
                          <textarea
                            id="manual-transcript-input"
                            rows={4}
                            placeholder="Paste spoken transcript lines, YouTube auto-generated captions, or raw recipe text here..."
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            className="w-full bg-[#FBF9F5] border border-[#D4CEBF] p-3 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18] font-mono leading-relaxed"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] text-[#55514A] font-bold block mb-1 uppercase tracking-wider">
                        2. RECIPE TITLE (OPTIONAL OVERRIDE)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Honey Garlic Sheet Pan Chicken"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isExtracting}
                      className="w-full bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] py-3 rounded text-xs font-bold tracking-widest uppercase transition flex justify-center items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isExtracting ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                          <span>EXTRACTING INGREDIENTS WITH GEMINI...</span>
                        </>
                      ) : (
                        <>
                          <span>PROCESS & PARSE RECIPE</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Active Recipes Queue Itemization & Controls */}
                  {recipes.length > 0 && (
                    <div className="pt-4 border-t border-dashed border-[#D4CEBF] space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A62]">
                        Active Recipes In Current Prep ({recipes.length}):
                      </div>
                      <div className="space-y-2">
                        {recipes.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-3 bg-[#F7F4EC] border border-[#E0DACB] rounded flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5 truncate mr-3">
                              <div className="font-bold text-[#1C1A18] truncate flex items-center space-x-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      typeof rec.colorTag === 'string'
                                        ? rec.colorTag
                                        : rec.colorTag?.accent || '#d2e823',
                                  }}
                                ></span>
                                <span>{rec.title}</span>
                              </div>
                              <div className="text-[10px] text-[#7E786D]">
                                {rec.channelTitle || 'Chef'} • {rec.ingredients.length} items
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <div className="flex items-center border border-[#D4CEBF] rounded bg-[#FBF9F5] px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateServings(rec.id, -1)}
                                  className="w-4 h-4 flex items-center justify-center hover:bg-[#EAE4D7] rounded cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="px-1.5 font-bold text-[11px]">
                                  {rec.servings}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateServings(rec.id, 1)}
                                  className="w-4 h-4 flex items-center justify-center hover:bg-[#EAE4D7] rounded cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveRecipe(rec.id)}
                                className="text-red-700 hover:text-red-900 p-1 hover:bg-[#F2D7D5] rounded transition cursor-pointer"
                                title="Remove recipe"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 2: CURRENT PANTRY */}
              {/* ==================================================== */}
              {activeView === 'pantry' && (
                <div className="mt-8 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xs text-[#7A7468] leading-relaxed">
                      Items marked as <span className="font-bold text-[#1C1A18]">IN STOCK</span> are automatically deducted from your aggregated grocery total. Toggle items to <span className="font-bold text-amber-800">RUNNING LOW</span> when you need to re-up.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetStaples}
                      className="text-[10px] text-[#55514A] hover:text-[#1C1A18] flex items-center space-x-1 underline cursor-pointer shrink-0"
                      title="Reset staples vault to defaults"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Vault</span>
                    </button>
                  </div>

                  {/* Staples Vault List */}
                  <div className="divide-y divide-dashed divide-[#D4CEBF]">
                    {staples.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#8C867A] space-y-2">
                        <p>No pantry staples currently in vault.</p>
                        <button
                          type="button"
                          onClick={handleResetStaples}
                          className="px-3 py-1.5 bg-[#1C1A18] text-[#FBF9F5] text-[10px] font-bold rounded uppercase cursor-pointer hover:bg-[#33302C]"
                        >
                          Restore Default Vault
                        </button>
                      </div>
                    ) : (
                      staples.map((item) => {
                        const isInStock = !item.isRunningLow;
                        const isEditingThis = editingStapleId === item.id;

                        return (
                          <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[#2B2927] truncate">{item.name}</div>
                              <div className="text-[10px] text-[#8C867A] flex items-center flex-wrap gap-x-2 mt-0.5">
                                <span>CATEGORY: {item.category}</span>
                                <span>•</span>
                                {isEditingThis ? (
                                  <span className="inline-flex items-center space-x-1 bg-[#FBF9F5] px-1.5 py-0.5 border border-[#D4CEBF] rounded">
                                    <span className="text-[9px] uppercase font-bold text-[#55514A]">UNIT:</span>
                                    <input
                                      type="text"
                                      value={editingStapleUnit}
                                      onChange={(e) => setEditingStapleUnit(e.target.value)}
                                      className="w-16 px-1 py-0.2 text-[10px] bg-white border border-[#C5BFA5] rounded font-mono text-[#1C1A18] focus:outline-none"
                                      placeholder="unit"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveStapleUnit(item.id);
                                        if (e.key === 'Escape') setEditingStapleId(null);
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveStapleUnit(item.id)}
                                      className="p-0.5 text-green-700 hover:text-green-900 cursor-pointer"
                                      title="Save unit"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStapleId(null)}
                                      className="p-0.5 text-[#8C867A] hover:text-[#1C1A18] cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1">
                                    <span>BASE UNIT: <strong className="font-mono text-[#1C1A18]">{item.unit}</strong></span>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditStapleUnit(item)}
                                      className="text-[#8C867A] hover:text-[#1C1A18] p-0.5 rounded cursor-pointer transition"
                                      title="Edit unit for this staple"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePantryStatus(item.id)}
                                className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition cursor-pointer ${
                                  isInStock
                                    ? 'bg-[#2E4A3E] text-[#E2F0D9] hover:bg-[#233A30]'
                                    : 'bg-[#7A3E2D] text-[#FCEBE6] hover:bg-[#613023]'
                                }`}
                              >
                                {isInStock ? '✓ IN STOCK' : '! RUNNING LOW'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveStaple(item.id, item.name)}
                                className="p-1.5 text-[#8C867A] hover:text-red-700 hover:bg-[#F2D7D5] rounded transition cursor-pointer"
                                title={`Remove ${item.name} from pantry`}
                                aria-label={`Remove ${item.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Custom Staple Form with Editable Unit */}
                  <form
                    onSubmit={handleAddCustomStaple}
                    className="pt-6 border-t border-dashed border-[#D4CEBF] space-y-3"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#55514A]">
                      + Add New Pantry Staple
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <label className="text-[9px] uppercase font-bold text-[#8C867A] block mb-1">
                          Staple Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sriracha, White Vinegar..."
                          value={newStapleName}
                          onChange={(e) => setNewStapleName(e.target.value)}
                          className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] uppercase font-bold text-[#8C867A] block mb-1">
                          Base Unit
                        </label>
                        <input
                          type="text"
                          list="staple-unit-options"
                          placeholder="e.g. oz, cup, tbsp"
                          value={newStapleUnit}
                          onChange={(e) => setNewStapleUnit(e.target.value)}
                          className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 text-xs font-mono text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18]"
                        />
                        <datalist id="staple-unit-options">
                          <option value="oz" />
                          <option value="lb" />
                          <option value="g" />
                          <option value="cup" />
                          <option value="tbsp" />
                          <option value="tsp" />
                          <option value="item" />
                          <option value="clove" />
                          <option value="bottle" />
                          <option value="can" />
                          <option value="bunch" />
                        </datalist>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] uppercase font-bold text-[#8C867A] block mb-1">
                          Category
                        </label>
                        <select
                          value={newStapleCategory}
                          onChange={(e) => setNewStapleCategory(e.target.value as AisleCategory)}
                          className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2 py-2 text-xs rounded text-[#1C1A18] focus:outline-none focus:border-[#1C1A18]"
                        >
                          <option value="Spices & Oils">Spices & Oils</option>
                          <option value="Pantry">Pantry</option>
                          <option value="Canned & Dry Goods">Canned & Dry Goods</option>
                          <option value="Produce">Produce</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Meat & Seafood">Meat & Seafood</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex items-end">
                        <button
                          type="submit"
                          className="w-full bg-[#1C1A18] text-[#FBF9F5] py-2 text-xs font-bold rounded uppercase cursor-pointer hover:bg-[#33302C] transition flex items-center justify-center"
                          title="Add new staple"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* On-Hand Fresh / Perishable Ingredients Section */}
                  {Object.keys(perishablesOnHand).length > 0 && (
                    <div className="pt-6 border-t border-dashed border-[#D4CEBF] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#55514A]">
                          On-Hand Perishables & Produce ({Object.keys(perishablesOnHand).length})
                        </div>
                        <span className="text-[10px] text-[#8C867A]">
                          Subtracted from recipe demand
                        </span>
                      </div>
                      <div className="divide-y divide-dashed divide-[#D4CEBF]">
                        {Object.entries(perishablesOnHand).map(([name, amount]) => (
                          <div key={name} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#2B2927] capitalize">{name}</span>
                              <span className="text-[10px] text-[#8C867A] ml-2">
                                In Stock: {amount} on hand
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleRemovePerishable(name)}
                                className="p-1.5 text-[#8C867A] hover:text-red-700 hover:bg-[#F2D7D5] rounded transition cursor-pointer"
                                title={`Remove ${name} from on-hand pantry`}
                                aria-label={`Remove ${name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 3: GROCERY LIST (PRIMARY DASHBOARD) */}
              {/* ==================================================== */}
              {activeView === 'grocery' && (
                <div className="mt-6">
                  {/* Multi-Recipe Dynamic Tabs */}
                  <div className="flex items-center space-x-2 border-b border-[#D4CEBF] pb-3 overflow-x-auto">
                    <button
                      onClick={() => setSelectedRecipeTab('ALL')}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition shrink-0 cursor-pointer ${
                        selectedRecipeTab === 'ALL'
                          ? 'bg-[#1C1A18] text-[#FBF9F5]'
                          : 'bg-[#EAE4D7] text-[#55514A] hover:bg-[#DFD8C7]'
                      }`}
                    >
                      ALL RECIPES (NET TOTAL)
                    </button>

                    {recipes.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => handleSelectRecipeTab(rec.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                          selectedRecipeTab === rec.id
                            ? 'bg-[#1C1A18] text-[#FBF9F5]'
                            : 'bg-[#EAE4D7] text-[#55514A] hover:bg-[#DFD8C7]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              typeof rec.colorTag === 'string'
                                ? rec.colorTag
                                : rec.colorTag?.accent || '#d2e823',
                          }}
                        ></span>
                        <span className="truncate max-w-[140px]">{rec.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Packaging Controls Toggle */}
                  <div className="flex justify-between items-center bg-[#F2EDE2] p-3 rounded my-5 text-xs">
                    <div className="flex items-center space-x-2 text-[#6E6A62]">
                      <Layers className="w-4 h-4" />
                      <span className="font-bold">PACKAGING MODE:</span>
                    </div>

                    <div className="flex bg-[#E2DDD3] p-0.5 rounded text-[11px]">
                      <button
                        onClick={() => setPackagingMode('loose')}
                        className={`px-3 py-1 rounded transition cursor-pointer ${
                          packagingMode === 'loose'
                            ? 'bg-[#1C1A18] text-[#FBF9F5] font-bold'
                            : 'text-[#55514A]'
                        }`}
                      >
                        MINIMUM NEEDED (LOOSE)
                      </button>
                      <button
                        onClick={() => setPackagingMode('bulk')}
                        className={`px-3 py-1 rounded transition cursor-pointer ${
                          packagingMode === 'bulk'
                            ? 'bg-[#1C1A18] text-[#FBF9F5] font-bold'
                            : 'text-[#55514A]'
                        }`}
                      >
                        BULK PACKAGING (RETAIL)
                      </button>
                    </div>
                  </div>

                  {/* Grocery List Grouped by Store Aisle */}
                  <div className="space-y-6">
                    {Object.entries(groupedByAisle).map(([aisle, items]) => {
                      if (items.length === 0) return null;

                      // Sorting rule: if specific tab selected, active items come first
                      const sortedItems = [...items].sort((a, b) => {
                        if (selectedRecipeTab === 'ALL') return 0;
                        const aInRec = a.recipeBreakdown[selectedRecipeTab] ? 1 : 0;
                        const bInRec = b.recipeBreakdown[selectedRecipeTab] ? 1 : 0;
                        return bInRec - aInRec;
                      });

                      return (
                        <div key={aisle} className="space-y-2">
                          <div className="text-[11px] font-bold text-[#8C867A] uppercase tracking-widest border-b border-[#E2DDD3] pb-1 flex justify-between items-center">
                            <span>SECTION: {aisle}</span>
                            <span className="text-[10px] font-normal lowercase text-[#9C968A]">
                              {items.filter((i) => i.netNeeded > 0).length} to buy
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {sortedItems.map((item) => {
                              // Dynamic tab logic
                              const isAllTab = selectedRecipeTab === 'ALL';
                              const recAmount = item.recipeBreakdown[selectedRecipeTab] || 0;
                              const isItemInActiveRecipe = isAllTab || recAmount > 0;
                              const isFaded = !isAllTab && !isItemInActiveRecipe;

                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-baseline justify-between text-xs transition-opacity duration-200 py-1 ${
                                    isFaded ? 'opacity-30' : 'opacity-100'
                                  }`}
                                >
                                  {/* Left: Interactive Checkbox, Item Name & Dot Leaders */}
                                  <div className="flex-1 flex items-baseline mr-4 min-w-0 relative">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleItemCheck(item.id)}
                                      className={`mr-2 w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer transition ${
                                        item.isChecked
                                          ? 'bg-[#1C1A18] border-[#1C1A18] text-[#FBF9F5]'
                                          : 'border-[#C5BFA5] hover:border-[#1C1A18] bg-transparent'
                                      }`}
                                      title={item.isChecked ? 'Mark unbought' : 'Mark bought'}
                                    >
                                      {item.isChecked && <Check className="w-2.5 h-2.5" />}
                                    </button>

                                    <TruncatedGroceryItemName
                                      name={item.name}
                                      isChecked={item.isChecked}
                                      isActiveRecipe={isItemInActiveRecipe}
                                      isAllTab={isAllTab}
                                      category={item.category}
                                      neededAmount={item.netNeeded}
                                      unit={item.unit}
                                    />

                                    {/* Recipe indicators */}
                                    <span className="inline-flex items-center space-x-1 ml-1.5 shrink-0">
                                      {recipes
                                        .filter((r) => (item.recipeBreakdown[r.id] || 0) > 0)
                                        .map((r) => (
                                          <button
                                            key={r.id}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSelectRecipeTab(r.id);
                                            }}
                                            className="w-2 h-2 rounded-full hover:ring-2 hover:ring-[#1C1A18] transition cursor-pointer"
                                            style={{
                                              backgroundColor:
                                                typeof r.colorTag === 'string'
                                                  ? r.colorTag
                                                  : r.colorTag?.accent || '#d2e823',
                                            }}
                                            title={`Recipe: ${r.title} (Click to view)`}
                                            aria-label={`Select ${r.title}`}
                                          />
                                        ))}
                                    </span>

                                    {item.isPantryStocked && (
                                      <span className="ml-2 text-[9px] text-[#2E4A3E] font-bold bg-[#E2F0D9] px-1.5 py-0.5 rounded shrink-0">
                                        PANTRY STOCKED
                                      </span>
                                    )}

                                    <span className="flex-1 border-b border-dotted border-[#C5BFA5] mx-2"></span>
                                  </div>

                                  {/* Right: Quantity & Display Breakdown */}
                                  <div className="text-right whitespace-nowrap">
                                    {isAllTab ? (
                                      <span className="font-bold">
                                        {item.netNeeded > 0
                                          ? `${item.netNeeded} ${item.unit}`
                                          : `0 ${item.unit}`}
                                      </span>
                                    ) : (
                                      <span>
                                        <span className="font-bold text-[#1C1A18]">
                                          {recAmount} {item.unit}
                                        </span>
                                        {recAmount > 0 && (
                                          <span className="text-[10px] text-[#7A7468] ml-1">
                                            ({item.totalAmount} total)
                                          </span>
                                        )}
                                      </span>
                                    )}

                                    {/* Cost metric display */}
                                    <span className="ml-4 text-[#6E6A62] text-[11px]">
                                      $
                                      {(packagingMode === 'bulk'
                                        ? item.registerCost
                                        : item.usageCost
                                      ).toFixed(2)}
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
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 4: PRICE CATALOG */}
              {/* ==================================================== */}
              {activeView === 'catalog' && (
                <div className="mt-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#7A7468]">
                      Local pricing catalog engine. Customize or edit unit rates and bulk packaging specifications for exact out-of-pocket estimations.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalog(DEFAULT_PRICE_CATALOG);
                        setEditingCatalogId(null);
                        triggerToast('Reset pricing catalog to defaults');
                      }}
                      className="text-[10px] text-[#55514A] hover:text-[#1C1A18] flex items-center space-x-1 underline cursor-pointer shrink-0 ml-4"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* Search Bar for Finding Existing Price Catalog Ingredients */}
                  <div className="space-y-2">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-[#7A7468] absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search existing catalog ingredients (e.g. steak, wagyu, garlic, rice)..."
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        className="w-full bg-[#FBF9F5] border border-[#D4CEBF] focus:border-[#1C1A18] rounded pl-9 pr-8 py-2 text-xs placeholder:text-[#9B9589] text-[#1C1A18] focus:outline-none transition shadow-sm"
                      />
                      {catalogSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCatalogSearchQuery('')}
                          className="absolute right-2.5 text-[#7A7468] hover:text-[#1C1A18] p-1 rounded cursor-pointer"
                          title="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#7A7468] px-0.5">
                      <span>
                        {catalogSearchQuery ? (
                          <>
                            SHOWING <strong className="text-[#1C1A18]">{filteredCatalog.length}</strong> OF {catalog.length} INGREDIENTS FOR &ldquo;{catalogSearchQuery}&rdquo;
                          </>
                        ) : (
                          <>
                            ALL <strong className="text-[#1C1A18]">{catalog.length}</strong> INGREDIENTS IN CATALOG
                          </>
                        )}
                      </span>
                      {catalogSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCatalogSearchQuery('')}
                          className="underline hover:no-underline text-[#55514A] hover:text-[#1C1A18] cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Empty state when search yields no matches */}
                  {filteredCatalog.length === 0 ? (
                    <div className="py-8 px-4 text-center border border-dashed border-[#D4CEBF] rounded bg-[#F7F4EC] space-y-2.5">
                      <p className="text-xs text-[#55514A]">
                        No existing catalog ingredients found matching &ldquo;<span className="font-bold text-[#1C1A18]">{catalogSearchQuery}</span>&rdquo;.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCatalogName(catalogSearchQuery);
                          setCatalogSearchQuery('');
                          setIsAddCatalogOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 bg-[#1C1A18] text-[#FBF9F5] px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#33302C] cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add &ldquo;{catalogSearchQuery}&rdquo; to catalog</span>
                      </button>
                    </div>
                  ) : (
                    /* Catalog Items List with Inline Edit Mode */
                    <div className="divide-y divide-dashed divide-[#D4CEBF]">
                      {filteredCatalog.map((info) => {
                        const isEditing = editingCatalogId === info.id;

                        if (isEditing) {
                          return (
                            <div
                              key={info.id}
                              className="py-3.5 px-3 bg-[#F4EFE4] border border-[#D4CEBF] rounded my-2 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-1.5">
                                <span className="text-[10px] font-bold tracking-wider text-[#55514A] uppercase">
                                  Edit Catalog Item: {info.name}
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCatalogEdit(info.id)}
                                    className="flex items-center space-x-1 bg-[#1C1A18] text-[#FBF9F5] px-2.5 py-1 rounded text-[11px] font-bold hover:bg-[#33302C] cursor-pointer"
                                    title="Save Changes"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>SAVE</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatalogId(null)}
                                    className="flex items-center space-x-1 bg-[#E2DDD3] text-[#55514A] hover:text-[#1C1A18] px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>CANCEL</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCatalogItem(info.id, info.name)}
                                    className="text-red-700 hover:text-red-900 p-1 hover:bg-[#F2D7D5] rounded transition cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-[#7A7468] block mb-0.5">
                                    Item Name
                                  </label>
                                  <input
                                    type="text"
                                    value={editDraft.name}
                                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                    className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#1C1A18] font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-[#7A7468] block mb-0.5">
                                    Aisle Category
                                  </label>
                                  <select
                                    value={editDraft.category}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, category: e.target.value as AisleCategory })
                                    }
                                    className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2 py-1.5 rounded text-xs"
                                  >
                                    <option value="Produce">Produce</option>
                                    <option value="Meat & Seafood">Meat & Seafood</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Spices & Oils">Spices & Oils</option>
                                    <option value="Pantry">Pantry</option>
                                    <option value="Canned & Dry Goods">Canned & Dry Goods</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-[#7A7468] block mb-0.5">
                                    Package Price ($)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editDraft.packagePrice}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, packagePrice: e.target.value })
                                    }
                                    className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-1.5 rounded focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-[#7A7468] block mb-0.5">
                                    Package Size
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editDraft.packageSize}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, packageSize: e.target.value })
                                    }
                                    className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-1.5 rounded focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-[#7A7468] block mb-0.5">
                                    Unit (lb, oz, count)
                                  </label>
                                  <input
                                    type="text"
                                    value={editDraft.packageUnit}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, packageUnit: e.target.value })
                                    }
                                    className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-1.5 rounded focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={info.id}
                            className="py-3 px-2 -mx-2 flex items-center justify-between text-xs hover:bg-[#F7F4EC] rounded transition group"
                          >
                            <div className="flex-1 mr-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[#1C1A18]">{info.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#EAE4D7] text-[#55514A] rounded">
                                  {info.category}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8C867A] mt-0.5">
                                PACKAGE: {info.packageSize} {info.packageUnit} (${info.packagePrice.toFixed(2)})
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="font-bold text-[#1C1A18]">
                                  ${(info.packagePrice / (info.packageSize || 1)).toFixed(2)} / {info.packageUnit}
                                </div>
                                <div className="text-[9px] text-[#8C867A]">unit rate</div>
                              </div>

                              {/* Row Action Buttons: Edit and Delete */}
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => startEditCatalogItem(info)}
                                  className="p-1.5 text-[#6E6A62] hover:text-[#1C1A18] hover:bg-[#E2DDD3] rounded transition cursor-pointer"
                                  title={`Edit ${info.name}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCatalogItem(info.id, info.name)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-[#F2D7D5] rounded transition cursor-pointer"
                                  title={`Delete ${info.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggle / Dropdown: Add Item to Catalog */}
                  <div className="pt-5 border-t border-dashed border-[#D4CEBF]">
                    <button
                      type="button"
                      onClick={() => setIsAddCatalogOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between py-2.5 px-3 bg-[#F4EFE4] hover:bg-[#EAE4D7] border border-[#D4CEBF] rounded text-xs font-bold text-[#1C1A18] tracking-wider transition cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-2">
                        <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isAddCatalogOpen ? 'rotate-45' : ''}`} />
                        <span className="uppercase text-[11px] tracking-wider">Add Item To Catalog</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-[#7A7468]">
                        <span className="font-semibold uppercase">{isAddCatalogOpen ? 'Collapse' : 'Expand'}</span>
                        {isAddCatalogOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#55514A]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#55514A]" />
                        )}
                      </div>
                    </button>

                    {isAddCatalogOpen && (
                      <form
                        onSubmit={handleAddCustomCatalogItem}
                        className="mt-3 p-3.5 bg-[#F7F4EC] border border-[#D4CEBF] rounded space-y-3 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#55514A]">
                            New Item Specifications
                          </span>
                          <span className="text-[10px] text-[#8C867A]">
                            Local Price Engine
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Item Name (e.g. Wagyu Steak)"
                            value={newCatalogName}
                            onChange={(e) => setNewCatalogName(e.target.value)}
                            className="col-span-2 bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 rounded focus:outline-none focus:border-[#1C1A18]"
                          />
                          <select
                            value={newCatalogCategory}
                            onChange={(e) => setNewCatalogCategory(e.target.value as AisleCategory)}
                            className="bg-[#FBF9F5] border border-[#D4CEBF] px-2 py-2 rounded text-xs text-[#1C1A18]"
                          >
                            <option value="Produce">Produce</option>
                            <option value="Meat & Seafood">Meat & Seafood</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Spices & Oils">Spices & Oils</option>
                            <option value="Pantry">Pantry</option>
                            <option value="Canned & Dry Goods">Canned & Dry</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price $"
                            value={newCatalogPrice}
                            onChange={(e) => setNewCatalogPrice(e.target.value)}
                            className="bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-2 rounded focus:outline-none"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Pkg Size"
                            value={newCatalogSize}
                            onChange={(e) => setNewCatalogSize(e.target.value)}
                            className="bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-2 rounded focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Unit (lb, oz)"
                            value={newCatalogUnit}
                            onChange={(e) => setNewCatalogUnit(e.target.value)}
                            className="bg-[#FBF9F5] border border-[#D4CEBF] px-2.5 py-2 rounded focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddCatalogOpen(false)}
                            className="text-[11px] text-[#7A7468] hover:text-[#1C1A18] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#1C1A18] text-[#FBF9F5] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#33302C] transition flex items-center space-x-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save Item to Catalog</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 5: SMS HANDOFF */}
              {/* ==================================================== */}
              {activeView === 'sms' && (
                <div className="mt-4 sm:mt-5 space-y-3.5">
                  <div className="bg-[#F7F4EC] p-3 sm:p-3.5 border border-[#E2DDD3] rounded text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#55514A]">PLAIN-TEXT SMS PREVIEW</span>
                      <button
                        onClick={copySmsToClipboard}
                        className="flex items-center space-x-1 text-[11px] text-[#1C1A18] font-bold bg-[#E2DDD3] hover:bg-[#D4CEBF] px-2.5 py-1 rounded transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>COPY TEXT</span>
                      </button>
                    </div>

                    <pre className="p-2.5 sm:p-3 bg-[#FBF9F5] border border-[#D4CEBF] rounded text-[10px] text-[#2B2927] whitespace-pre-wrap font-mono leading-relaxed max-h-36 sm:max-h-44 overflow-y-auto">
                      {generateSmsText()}
                    </pre>
                  </div>

                  {/* Dispatch SMS Form replacing Checkout Button */}
                  <div className="bg-[#F7F4EC] p-3 sm:p-3.5 border border-[#E2DDD3] rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] sm:text-[11px] text-[#55514A] font-bold uppercase tracking-wider">
                        DIRECT MOBILE SMS DISPATCH
                      </label>
                      <span className="text-[10px] text-[#8C867A]">INSTANT HANDOFF</span>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        className="flex-1 bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!smsPhone) {
                            triggerToast('Please enter a phone number');
                            return;
                          }
                          setIsSendingSms(true);
                          setTimeout(() => {
                            setIsSendingSms(false);
                            setSmsPhone('');
                            triggerToast(`SMS Grocery List Dispatched to ${smsPhone}!`);
                          }, 900);
                        }}
                        className="bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer shrink-0"
                      >
                        {isSendingSms ? <span>DISPATCHING...</span> : <span>SEND TO PHONE</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* RECEIPT FOOTER & GROCERY ESTIMATION GRAND TOTAL BLOCK */}
            {/* Displayed ONLY on Grocery view */}
            {/* ---------------------------------------------------- */}
            {activeView === 'grocery' && (
              <div className="mt-12 pt-6 border-t border-dashed border-[#D4CEBF]">
                {/* Financial Calculations Summary */}
                <div className="bg-[#F2EDE2] p-5 rounded space-y-3 mb-6">
                  <div className="flex justify-between items-center text-xs text-[#6E6A62]">
                    <span>ESTIMATION MODE:</span>
                    <span className="font-bold uppercase text-[#1C1A18]">
                      {packagingMode === 'loose'
                        ? 'Minimum Loose Needed'
                        : 'Standard Bulk Packaging'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-[#E2DDD3]">
                    <div>
                      <div className="font-serif italic text-xl text-[#1C1A18]">
                        Grocery Estimation
                      </div>
                      <div className="text-[10px] text-[#8C867A]">
                        {packagingMode === 'loose'
                          ? 'Exact Recipe Consumed Cost'
                          : 'Actual Out-of-Pocket Register Total'}
                      </div>
                    </div>

                    <div className="font-serif italic text-3xl font-normal text-[#1C1A18]">
                      $
                      {(packagingMode === 'bulk'
                        ? financialTotals.registerTotal
                        : financialTotals.usageTotal
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setActiveView('sms')}
                  className="w-full bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] py-4 rounded text-xs font-bold tracking-widest uppercase transition flex items-center justify-center space-x-3 shadow-lg cursor-pointer"
                >
                  <span>PROCEED TO SMS HANDOFF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Decorative Receipt Serrated Bottom Edge */}
          <div className="h-2 w-full receipt-edge opacity-40"></div>
        </div>
      </main>
    </div>
  );
}
