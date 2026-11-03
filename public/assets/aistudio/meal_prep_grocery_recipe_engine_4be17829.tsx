import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  ShoppingBag, 
  Package, 
  BookOpen, 
  Send, 
  Copy, 
  Check, 
  Youtube, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  FileText,
  DollarSign,
  Layers,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_STAPLES = [
  { id: 'p1', name: 'SALT & BLACK PEPPER', category: 'Spices & Oils', status: 'IN_STOCK', baseUnit: 'tsp' },
  { id: 'p2', name: 'EXTRA VIRGIN OLIVE OIL', category: 'Spices & Oils', status: 'IN_STOCK', baseUnit: 'tbsp' },
  { id: 'p3', name: 'SOY SAUCE', category: 'Pantry', status: 'IN_STOCK', baseUnit: 'tbsp' },
  { id: 'p4', name: 'GARLIC (CLOVES)', category: 'Produce', status: 'RUNNING_LOW', baseUnit: 'clove' },
  { id: 'p5', name: 'ALL-PURPOSE FLOUR', category: 'Pantry', status: 'IN_STOCK', baseUnit: 'cup' },
];

const INITIAL_CATALOG = {
  'CHICKEN BREAST': { unitCost: 4.99, unitName: 'lb', pkgSize: 1, pkgName: '1 lb Pack' },
  'HONEY': { unitCost: 0.25, unitName: 'tbsp', pkgSize: 16, pkgName: '16 tbsp Bottle' },
  'SOY SAUCE': { unitCost: 0.15, unitName: 'tbsp', pkgSize: 20, pkgName: '20 tbsp Bottle' },
  'GARLIC (CLOVES)': { unitCost: 0.20, unitName: 'clove', pkgSize: 10, pkgName: '10 Clove Bulb' },
  'JASMINE RICE': { unitCost: 1.50, unitName: 'cup', pkgSize: 10, pkgName: '10 Cup Bag' },
  'BROCCOLI FLORETS': { unitCost: 2.50, unitName: 'head', pkgSize: 1, pkgName: '1 Head' },
  'EXTRA VIRGIN OLIVE OIL': { unitCost: 0.30, unitName: 'tbsp', pkgSize: 32, pkgName: '32 tbsp Bottle' },
  'HEAVY CREAM': { unitCost: 3.80, unitName: 'cup', pkgSize: 2, pkgName: '2 Cup Carton' },
  'PARMESAN CHEESE': { unitCost: 4.50, unitName: 'cup', pkgSize: 1, pkgName: '1 Cup Tub' },
  'PENNE PASTA': { unitCost: 1.79, unitName: 'box', pkgSize: 1, pkgName: '1 Box (16 oz)' },
  'SALT & BLACK PEPPER': { unitCost: 0.05, unitName: 'tsp', pkgSize: 100, pkgName: 'Shaker Set' }
};

const INITIAL_RECIPES = [
  {
    id: 'rec_1',
    title: 'Honey Garlic Glazed Chicken',
    url: 'https://youtube.com/watch?v=mock1',
    channel: 'Chef John',
    servings: 4,
    color: '#8A5A44',
    ingredients: [
      { name: 'CHICKEN BREAST', amount: 2.0, unit: 'lb', category: 'Meat & Seafood' },
      { name: 'HONEY', amount: 4.0, unit: 'tbsp', category: 'Pantry' },
      { name: 'SOY SAUCE', amount: 3.0, unit: 'tbsp', category: 'Pantry' },
      { name: 'GARLIC (CLOVES)', amount: 6.0, unit: 'clove', category: 'Produce' },
      { name: 'EXTRA VIRGIN OLIVE OIL', amount: 2.0, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'BROCCOLI FLORETS', amount: 2.0, unit: 'head', category: 'Produce' },
      { name: 'JASMINE RICE', amount: 2.0, unit: 'cup', category: 'Pantry' },
    ]
  },
  {
    id: 'rec_2',
    title: 'Creamy Garlic Parmesan Penne',
    url: 'https://youtube.com/watch?v=mock2',
    channel: 'Ethan Chlebowski',
    servings: 4,
    color: '#2D5D4B',
    ingredients: [
      { name: 'PENNE PASTA', amount: 1.0, unit: 'box', category: 'Pantry' },
      { name: 'HEAVY CREAM', amount: 1.5, unit: 'cup', category: 'Dairy' },
      { name: 'PARMESAN CHEESE', amount: 1.0, unit: 'cup', category: 'Dairy' },
      { name: 'GARLIC (CLOVES)', amount: 4.0, unit: 'clove', category: 'Produce' },
      { name: 'EXTRA VIRGIN OLIVE OIL', amount: 1.0, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'SALT & BLACK PEPPER', amount: 1.0, unit: 'tsp', category: 'Spices & Oils' },
    ]
  }
];

export default function MealPrepEngine() {
  // Navigation
  const [activeView, setActiveView] = useState('grocery'); // 'add_recipe', 'pantry', 'grocery', 'catalog', 'sms'
  const [selectedRecipeTab, setSelectedRecipeTab] = useState('ALL'); // 'ALL' or recipe.id

  // Data State
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [pantry, setPantry] = useState(INITIAL_STAPLES);
  const [catalog, setCatalog] = useState(INITIAL_CATALOG);
  const [packagingMode, setPackagingMode] = useState('loose'); // 'loose' or 'bulk'

  // Input States for Recipe Extraction
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // SMS Modal State
  const [smsPhone, setSmsPhone] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Helper for toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- PANTRY TOGGLE ---
  const togglePantryStatus = (id) => {
    setPantry(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'IN_STOCK' ? 'RUNNING_LOW' : 'IN_STOCK';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // --- EXTRACT / ADD RECIPE SIMULATION ---
  const handleExtractRecipe = async (e) => {
    e.preventDefault();
    if (!youtubeUrl && !rawText) return;

    setIsExtracting(true);

    // Simulated LLM delay & response
    setTimeout(() => {
      const mockExtracted = {
        id: `rec_${Date.now()}`,
        title: youtubeUrl ? 'Simulated YT Recipe' : 'Custom Pasted Recipe',
        url: youtubeUrl || 'https://youtube.com',
        channel: 'YouTube Chef',
        servings: 4,
        color: ['#8A5A44', '#2D5D4B', '#3B5998', '#6A4C93'][recipes.length % 4],
        ingredients: [
          { name: 'CHICKEN BREAST', amount: 1.5, unit: 'lb', category: 'Meat & Seafood' },
          { name: 'GARLIC (CLOVES)', amount: 3.0, unit: 'clove', category: 'Produce' },
          { name: 'EXTRA VIRGIN OLIVE OIL', amount: 2.0, unit: 'tbsp', category: 'Spices & Oils' },
          { name: 'JASMINE RICE', amount: 1.5, unit: 'cup', category: 'Pantry' }
        ]
      };

      setRecipes(prev => [...prev, mockExtracted]);
      setYoutubeUrl('');
      setRawText('');
      setIsExtracting(false);
      setActiveView('grocery');
      triggerToast('Extracted & normalized recipe!');
    }, 1200);
  };

  // Preset YouTube Links helper
  const loadPreset = (title, url, text) => {
    setYoutubeUrl(url);
    setRawText(text);
  };

  // --- GROCERY AGGREGATION & CALCULATIONS ---
  const aggregatedIngredients = useMemo(() => {
    const map = {};

    recipes.forEach(rec => {
      rec.ingredients.forEach(ing => {
        const key = ing.name.toUpperCase();
        if (!map[key]) {
          map[key] = {
            name: key,
            category: ing.category,
            unit: ing.unit,
            totalAmount: 0,
            recipeBreakdown: {} // recId -> amount
          };
        }
        map[key].totalAmount += ing.amount;
        map[key].recipeBreakdown[rec.id] = (map[key].recipeBreakdown[rec.id] || 0) + ing.amount;
      });
    });

    // Pantry Deduplication
    const finalItems = Object.values(map).map(item => {
      const pantryMatch = pantry.find(p => p.name === item.name);
      const isPantryStocked = pantryMatch && pantryMatch.status === 'IN_STOCK';
      const netNeeded = isPantryStocked ? 0 : item.totalAmount;

      // Price calculation
      const catInfo = catalog[item.name] || { unitCost: 1.00, pkgSize: 1, pkgName: 'Unit' };
      const usageCost = netNeeded * catInfo.unitCost;
      
      let registerCost = usageCost;
      let packagesToBuy = netNeeded;
      
      if (packagingMode === 'bulk' && catInfo.pkgSize > 0) {
        packagesToBuy = Math.ceil(netNeeded / catInfo.pkgSize);
        registerCost = packagesToBuy * (catInfo.unitCost * catInfo.pkgSize);
      }

      return {
        ...item,
        isPantryStocked,
        netNeeded,
        usageCost,
        registerCost,
        packagesToBuy,
        unitCost: catInfo.unitCost,
        pkgName: catInfo.pkgName
      };
    });

    return finalItems;
  }, [recipes, pantry, catalog, packagingMode]);

  // Grouped by store aisle
  const groupedByAisle = useMemo(() => {
    const categories = ['Produce', 'Meat & Seafood', 'Dairy', 'Spices & Oils', 'Pantry', 'Other'];
    const grouped = {};
    categories.forEach(c => grouped[c] = []);

    aggregatedIngredients.forEach(item => {
      const cat = grouped[item.category] ? item.category : 'Other';
      grouped[cat].push(item);
    });

    return grouped;
  }, [aggregatedIngredients]);

  // Financial Summary
  const financialTotals = useMemo(() => {
    let registerTotal = 0;
    let usageTotal = 0;

    aggregatedIngredients.forEach(item => {
      registerTotal += item.registerCost;
      usageTotal += item.usageCost;
    });

    return { registerTotal, usageTotal };
  }, [aggregatedIngredients]);

  // --- SMS FORMATTER ---
  const generateSmsText = () => {
    let text = "🛒 MEAL PREP GROCERY LIST\n";
    text += "-------------------------\n";

    Object.entries(groupedByAisle).forEach(([aisle, items]) => {
      const neededItems = items.filter(i => i.netNeeded > 0);
      if (neededItems.length > 0) {
        text += `\n[ ${aisle.toUpperCase()} ]\n`;
        neededItems.forEach(i => {
          text += `• [ ] ${i.name}: ${i.netNeeded} ${i.unit}\n`;
        });
      }
    });

    text += "\n-------------------------\n";
    text += "RECIPE REFERENCES:\n";
    recipes.forEach(r => {
      text += `• ${r.title}: ${r.url}\n`;
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

      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR - Hotel Folio / Luxury Minimal Aesthetic */}
      {/* ---------------------------------------------------- */}
      <aside className="w-80 bg-[#141414] text-[#E5E0D8] flex flex-col justify-between border-r border-[#2A2927] relative z-10 shrink-0">
        <div>
          {/* Header Title Branding */}
          <div className="p-7 border-b border-[#262523]">
            <h1 className="font-serif italic text-3xl font-light tracking-wide text-[#F5F2EC]">
              Meal Prep
            </h1>
            <h2 className="font-serif italic text-2xl font-light tracking-wide text-[#C8BBAA] -mt-1">
              Grocery Engine
            </h2>
            
            <p className="mt-5 text-[11px] leading-relaxed text-[#8E8A83] font-mono tracking-normal">
              Paste YouTube cooking videos or tap presets below. Ingredients normalize across recipes, deduct pantry stock, and group by aisle.
            </p>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveView('add_recipe')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all ${
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all ${
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
                {pantry.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('grocery')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all ${
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all ${
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-xs transition-all ${
                activeView === 'sms'
                  ? 'bg-[#262523] text-[#FBF9F5] font-bold border-l-2 border-amber-500'
                  : 'text-[#A09B90] hover:bg-[#1E1D1C] hover:text-[#E5E0D8]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Send className="w-4 h-4" />
                <span>SMS EXPORT</span>
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
            <span className="text-[#A09B90]">HYBRID YOUTUBE</span>
          </div>
          <div className="pt-2 text-[9px] text-[#4E4B45] text-center border-t border-[#1F1E1C]">
            FOLIO SYSTEM • REVISION 2.4
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER - PAPER RECEIPT CANVAS */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center items-start">
        
        {/* Receipt Container Wrapper */}
        <div className="w-full max-w-3xl bg-[#FBF9F5] text-[#1C1A18] shadow-2xl border border-[#E2DDD3] rounded-sm relative flex flex-col transition-all duration-300 min-h-[85vh]">
          
          {/* Decorative Receipt Serrated Top Edge subtle styling */}
          <div className="h-2 w-full bg-[radial-gradient(#E2DDD3_1px,transparent_1px)] [background-size:8px_8px] opacity-40"></div>

          <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
            
            <div>
              {/* Receipt Top Header */}
              <div className="text-center pb-6 border-b border-dashed border-[#D4CEBF]">
                <h3 className="font-serif text-2xl font-normal tracking-wide text-[#2B2927]">
                  {activeView === 'add_recipe' && 'Recipe Extraction'}
                  {activeView === 'pantry' && 'Pantry Staples Vault'}
                  {activeView === 'grocery' && 'Master Grocery List'}
                  {activeView === 'catalog' && 'Local Price Catalog'}
                  {activeView === 'sms' && 'Mobile Handoff & SMS'}
                </h3>
                <p className="text-[10px] tracking-widest text-[#8C867A] uppercase mt-1">
                  OFFICIAL ITEMIZATION STATEMENT
                </p>
              </div>

              {/* VIEW 1: ADD RECIPE VIEW */}
              {activeView === 'add_recipe' && (
                <div className="mt-8 space-y-8">
                  {/* Preset Quick Loader */}
                  <div>
                    <label className="text-[11px] text-[#6E6A62] block mb-2 font-bold uppercase tracking-wider">
                      Quick Load YouTube Cooking Demos:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => loadPreset('Honey Garlic Glazed Chicken', 'https://youtube.com/watch?v=mock1', 'Honey, Soy sauce, Chicken breast, Garlic, Olive oil, Rice, Broccoli')}
                        className="p-3 border border-[#E0DACB] bg-[#F7F4EC] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition"
                      >
                        <div className="flex items-center text-red-700 font-bold space-x-1">
                          <Youtube className="w-3.5 h-3.5" />
                          <span>Chef John - Honey Garlic Chicken</span>
                        </div>
                        <div className="text-[10px] text-[#7E786D]">Extracts: Chicken, Garlic, Honey, Soy...</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => loadPreset('Creamy Garlic Parmesan Pasta', 'https://youtube.com/watch?v=mock2', 'Penne pasta, Heavy cream, Parmesan, Garlic, Olive oil, Pepper')}
                        className="p-3 border border-[#E0DACB] bg-[#F7F4EC] hover:bg-[#EFEADF] text-left rounded text-xs space-y-1 transition"
                      >
                        <div className="flex items-center text-red-700 font-bold space-x-1">
                          <Youtube className="w-3.5 h-3.5" />
                          <span>Ethan Chlebowski - Garlic Pasta</span>
                        </div>
                        <div className="text-[10px] text-[#7E786D]">Extracts: Pasta, Heavy Cream, Parmesan...</div>
                      </button>
                    </div>
                  </div>

                  {/* Extraction Form formatted as a receipt block */}
                  <form onSubmit={handleExtractRecipe} className="border border-[#DCD6C8] bg-[#F7F4EC] p-6 rounded space-y-5">
                    <div>
                      <label className="text-[11px] text-[#55514A] font-bold block mb-1 uppercase tracking-wider">
                        1. YOUTUBE VIDEO URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-[#FBF9F5] border border-[#D4CEBF] px-3 py-2 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18]"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-[#D4CEBF]"></div></div>
                      <div className="relative flex justify-center text-[10px] text-[#8C867A] uppercase"><span className="bg-[#F7F4EC] px-2">OR FALLBACK TRANSCRIPT / DESCRIPTION</span></div>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#55514A] font-bold block mb-1 uppercase tracking-wider">
                        2. RAW DESCRIPTION OR AUDIO TRANSCRIPT
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste recipe description or ingredient text here..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full bg-[#FBF9F5] border border-[#D4CEBF] p-3 text-xs text-[#1C1A18] rounded focus:outline-none focus:border-[#1C1A18] font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isExtracting}
                      className="w-full bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] py-3 rounded text-xs font-bold tracking-widest uppercase transition flex justify-center items-center space-x-2"
                    >
                      {isExtracting ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                          <span>EXTRACTING INGREDIENTS...</span>
                        </>
                      ) : (
                        <>
                          <span>PROCESS & PARSE RECIPE</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 2: CURRENT PANTRY */}
              {activeView === 'pantry' && (
                <div className="mt-8">
                  <p className="text-xs text-[#7A7468] mb-6 leading-relaxed">
                    Items marked as <span className="font-bold text-[#1C1A18]">IN STOCK</span> are automatically deducted from your aggregated grocery total. Toggle items to <span className="font-bold text-amber-800">RUNNING LOW</span> when you need to re-up.
                  </p>

                  <div className="divide-y divide-dashed divide-[#D4CEBF]">
                    {pantry.map((item) => {
                      const isInStock = item.status === 'IN_STOCK';
                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#2B2927]">{item.name}</div>
                            <div className="text-[10px] text-[#8C867A]">CATEGORY: {item.category}</div>
                          </div>

                          <button
                            onClick={() => togglePantryStatus(item.id)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition ${
                              isInStock
                                ? 'bg-[#2E4A3E] text-[#E2F0D9] hover:bg-[#233A30]'
                                : 'bg-[#7A3E2D] text-[#FCEBE6] hover:bg-[#613023]'
                            }`}
                          >
                            {isInStock ? '✓ IN STOCK' : '! RUNNING LOW'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: GROCERY LIST (PRIMARY DASHBOARD) */}
              {activeView === 'grocery' && (
                <div className="mt-6">
                  
                  {/* Multi-Recipe Dynamic Tabs */}
                  <div className="flex items-center space-x-2 border-b border-[#D4CEBF] pb-3 overflow-x-auto">
                    <button
                      onClick={() => setSelectedRecipeTab('ALL')}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition shrink-0 ${
                        selectedRecipeTab === 'ALL'
                          ? 'bg-[#1C1A18] text-[#FBF9F5]'
                          : 'bg-[#EAE4D7] text-[#55514A] hover:bg-[#DFD8C7]'
                      }`}
                    >
                      ALL RECIPES (NET TOTAL)
                    </button>

                    {recipes.map(rec => (
                      <button
                        key={rec.id}
                        onClick={() => setSelectedRecipeTab(rec.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                          selectedRecipeTab === rec.id
                            ? 'bg-[#1C1A18] text-[#FBF9F5]'
                            : 'bg-[#EAE4D7] text-[#55514A] hover:bg-[#DFD8C7]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rec.color }}></span>
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
                        className={`px-3 py-1 rounded transition ${
                          packagingMode === 'loose' ? 'bg-[#1C1A18] text-[#FBF9F5] font-bold' : 'text-[#55514A]'
                        }`}
                      >
                        MINIMUM NEEDED (LOOSE)
                      </button>
                      <button
                        onClick={() => setPackagingMode('bulk')}
                        className={`px-3 py-1 rounded transition ${
                          packagingMode === 'bulk' ? 'bg-[#1C1A18] text-[#FBF9F5] font-bold' : 'text-[#55514A]'
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
                          <div className="text-[11px] font-bold text-[#8C867A] uppercase tracking-widest border-b border-[#E2DDD3] pb-1">
                            SECTION: {aisle}
                          </div>

                          <div className="space-y-1.5">
                            {sortedItems.map(item => {
                              // Dynamic tab logic
                              const isAllTab = selectedRecipeTab === 'ALL';
                              const recAmount = item.recipeBreakdown[selectedRecipeTab] || 0;
                              const isItemInActiveRecipe = isAllTab || recAmount > 0;
                              const isFaded = !isAllTab && !isItemInActiveRecipe;

                              return (
                                <div
                                  key={item.name}
                                  className={`flex items-baseline justify-between text-xs transition-opacity duration-200 py-1 ${
                                    isFaded ? 'opacity-30' : 'opacity-100'
                                  }`}
                                >
                                  {/* Left: Item Name & Dot Leaders */}
                                  <div className="flex-1 flex items-baseline mr-4 overflow-hidden">
                                    <span className={`truncate ${isItemInActiveRecipe && !isAllTab ? 'font-bold underline' : ''}`}>
                                      {item.name}
                                    </span>
                                    {item.isPantryStocked && (
                                      <span className="ml-2 text-[9px] text-[#2E4A3E] font-bold bg-[#E2F0D9] px-1.5 py-0.5 rounded">
                                        PANTRY STOCKED
                                      </span>
                                    )}
                                    <span className="flex-1 border-b border-dotted border-[#C5BFA5] mx-2"></span>
                                  </div>

                                  {/* Right: Quantity & Display Breakdown */}
                                  <div className="text-right whitespace-nowrap">
                                    {isAllTab ? (
                                      <span className="font-bold">
                                        {item.netNeeded} {item.unit}
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
                                      ${(packagingMode === 'bulk' ? item.registerCost : item.usageCost).toFixed(2)}
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

              {/* VIEW 4: PRICE CATALOG */}
              {activeView === 'catalog' && (
                <div className="mt-8 space-y-4">
                  <p className="text-xs text-[#7A7468] mb-4">
                    Local pricing catalog engine. Customize unit rates and bulk packaging specifications for exact out-of-pocket estimations.
                  </p>

                  <div className="divide-y divide-dashed divide-[#D4CEBF]">
                    {Object.entries(catalog).map(([name, info]) => (
                      <div key={name} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold">{name}</div>
                          <div className="text-[10px] text-[#8C867A]">
                            PACKAGE: {info.pkgName} ({info.pkgSize} {info.unitName})
                          </div>
                        </div>
                        <div className="text-right font-bold">
                          ${info.unitCost.toFixed(2)} / {info.unitName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 5: SMS EXPORT */}
              {activeView === 'sms' && (
                <div className="mt-8 space-y-6">
                  <div className="bg-[#F7F4EC] p-4 border border-[#E2DDD3] rounded text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#55514A]">PLAIN-TEXT SMS PREVIEW</span>
                      <button
                        onClick={copySmsToClipboard}
                        className="flex items-center space-x-1 text-[11px] text-[#1C1A18] font-bold bg-[#E2DDD3] hover:bg-[#D4CEBF] px-2.5 py-1 rounded transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>COPY TEXT</span>
                      </button>
                    </div>

                    <pre className="p-3 bg-[#FBF9F5] border border-[#D4CEBF] rounded text-[10px] text-[#2B2927] whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                      {generateSmsText()}
                    </pre>
                  </div>

                  {/* Dispatch SMS Form replacing Checkout Button */}
                  <div className="space-y-3">
                    <label className="text-[11px] text-[#55514A] font-bold block uppercase tracking-wider">
                      DIRECT MOBILE SMS DISPATCH (TWILIO HYBRID)
                    </label>

                    <div className="flex space-x-2">
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
                          if (!smsPhone) return;
                          setIsSendingSms(true);
                          setTimeout(() => {
                            setIsSendingSms(false);
                            setSmsPhone('');
                            triggerToast('SMS Grocery List Dispatched!');
                          }, 1000);
                        }}
                        className="bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-2"
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
            {/* ---------------------------------------------------- */}
            <div className="mt-12 pt-6 border-t border-dashed border-[#D4CEBF]">
              
              {/* Financial Calculations Summary */}
              <div className="bg-[#F2EDE2] p-5 rounded space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs text-[#6E6A62]">
                  <span>ESTIMATION MODE:</span>
                  <span className="font-bold uppercase text-[#1C1A18]">
                    {packagingMode === 'loose' ? 'Minimum Loose Needed' : 'Standard Bulk Packaging'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#E2DDD3]">
                  <div>
                    <div className="font-serif italic text-xl text-[#1C1A18]">Grocery Estimation</div>
                    <div className="text-[10px] text-[#8C867A]">
                      {packagingMode === 'loose' ? 'Exact Recipe Consumed Cost' : 'Actual Out-of-Pocket Register Total'}
                    </div>
                  </div>

                  <div className="font-serif italic text-3xl font-normal text-[#1C1A18]">
                    ${(packagingMode === 'bulk' ? financialTotals.registerTotal : financialTotals.usageTotal).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {activeView === 'grocery' && (
                <button
                  onClick={() => setActiveView('sms')}
                  className="w-full bg-[#1C1A18] hover:bg-[#33302C] text-[#FBF9F5] py-4 rounded text-xs font-bold tracking-widest uppercase transition flex items-center justify-center space-x-3 shadow-lg"
                >
                  <span>PROCEED TO SMS HANDOFF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>

          {/* Decorative Receipt Serrated Bottom Edge */}
          <div className="h-2 w-full bg-[radial-gradient(#E2DDD3_1px,transparent_1px)] [background-size:8px_8px] opacity-40"></div>
        </div>

      </main>
    </div>
  );
}