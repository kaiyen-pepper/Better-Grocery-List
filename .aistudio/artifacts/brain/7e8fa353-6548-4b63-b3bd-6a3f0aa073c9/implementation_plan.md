# YouTube Meal Prep Grocery & Recipe Engine

A dedicated meal planning, recipe extraction, and grocery consolidation engine that turns YouTube cooking videos into normalized, pantry-audited grocery lists organized by store aisle, complete with retail package vs. recipe usage cost calculations.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed choices from Phase 1 establish the operational and design foundation for the system:

- **Confirmed Decision 1 (Extraction Strategy)**: Hybrid YouTube Extractor featuring automatic YouTube metadata/caption fetching via server proxy, combined with an instant fallback modal for pasting descriptions or transcripts, and pre-loaded curated meal prep video presets for immediate testing.
- **Confirmed Decision 2 (Pricing Engine Catalog)**: Pre-populated with baseline Standard US supermarket averages (Trader Joe's / Kroger style), completely editable by the user per item with zero surveillance or dynamic retailer web API dependencies.
- **Confirmed Decision 3 (Visual Identity & Theme)**: Mediterranean Deli Counter meets Warm Storybook Editorial.
  - Display typography: Cormorant Garamond / Playfair Condensed display serif set tight with negative letter spacing.
  - Body & UI typography: IBM Plex Serif / typewriter serif for that authentic kitchen grocery notepad feel.
  - Status badges: Crisp neutral geometric sans micro-labels.
  - Surfaces: Warm Cream Paper (`#f5f1e4`), Pure White cards (`#ffffff`), Soft Ink Black text/borders (`#2c2e2a`), Olive Ink (`#3c422e`), and sparing chromatic accent pops (Fresh Grass `#8ed462`, Sky Pop `#2ba0ff`, Coral Pop `#ff705d`, Sunshine Pop `#f5e211`).
  - Strict compliance with all exclusion rules: zero purple gradients, zero glassmorphism, zero pill badges, zero left-accent colored stripes, and zero mechanical pseudo-code clutter.

---

### 1. Overview & Core Concept

- **What It Does**: The application ingests YouTube recipe URLs, extracts ingredients and yields using Gemini structured output, normalizes heterogeneous units (cups, cloves, tablespoons, ounces) into standard purchase units, reconciles against the user's pantry inventory and persistent staples vault (salt, pepper, olive oil, etc.), calculates both Register Total (full package cost) and Recipe Usage Cost, and renders a live aisle-sorted shopping list with focus states for individual recipes.
- **Target Audience / Persona**: Batch cooks, home meal-preppers, and budget-conscious cooks who love finding recipes on YouTube (e.g., Joshua Weissman, Ethan Chlebowski, Pro Home Cooks, Rainbow Plant Life) but struggle with consolidating multi-video grocery runs and estimating out-of-pocket costs.
- **Key Value**: Eliminates duplicate ingredient purchases, handles unit arithmetic automatically, keeps prices transparent and private without invasive scrapers, and creates a clear grocery list formatted for both in-store mobile checklists and plain-text SMS export.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Queue & Ingest**: The user pastes YouTube video URLs into the queue or selects from featured meal-prep recipe presets. The server initiates a hybrid extraction (fetching description & captions or opening the paste fallback drawer).
2. **Review & Normalize**: Ingested recipes appear with thumbnails, extracted serving counts, and structured ingredient lists. Users can adjust serving multipliers (e.g., 2x batch) or edit ingredient line items.
3. **Pantry & Staples Audit**: Before generating the final list, users open the "Pantry On-Hand Check" modal. Items already in the persistent vault (salt, pepper, cooking oil, soy sauce) are auto-checked unless marked "Running Low"; fresh items allow on-hand deduction (e.g., "Need 4 tomatoes; on hand: 2 -> net purchase: 2").
4. **Interactive Grocery List**: Net ingredients are grouped by aisle category (Produce, Meat & Seafood, Dairy, Spices & Oils, Pantry, Canned & Dry Goods, Other).
   - Clicking the **"ALL"** tab presents the combined shopping list.
   - Clicking a specific **Recipe Tab** fades non-recipe items to 30% opacity, brings active recipe items to the top in bold, and displays active recipe amounts alongside total net quantities (e.g., "1 clove (5 cloves total)").
5. **Pricing Breakdown & Packaging Switch**: Users can toggle between "Minimum Needed" (loose/fractional units) and "Bulk Packaging" (commercial pack sizes), reviewing Register Out-of-Pocket vs. Usage Expense.
6. **Export & Cooking Reference**: One-click SMS plain-text formatter copying aisle-grouped checkable text (`• [ ] Item: Amount`) with fallback links directly to the original YouTube video timestamps.

#### Visual Identity & Theme Tokens
- **Canvas**: `#f5f1e4` (Warm Cream Paper)
- **Ink & Line**: `#2c2e2a` (Soft Charcoal Ink) and `#3c422e` (Olive Ink)
- **Card Surfaces**: `#ffffff` (Crisp Dairy White) with 1px hairline border (`border-[#2c2e2a]/15`)
- **Category Accents**:
  - Produce: `#8ed462` (Fresh Grass)
  - Meat & Seafood: `#ff705d` (Coral Pop)
  - Dairy & Chilled: `#2ba0ff` (Sky Pop)
  - Spices, Oils & Pantry: `#f5e211` (Sunshine Pop)
- **Typography**:
  - Display Serifs: Cormorant Garamond / Playfair Display
  - Body Prose & Lists: IBM Plex Serif / Typewriter Serif
  - Micro-labels: Geometric Sans (Inter/Apercu style)
- **Border Radii**: Generous 20px–36px rounded containers, soft pill interactive buttons, clean flat card elevation.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid Server-Side Extractor with Fallback**:
  - *Chosen Approach*: Server proxy queries YouTube metadata and caption endpoints. If YouTube rate-limits or blocks direct transcript fetching, the UI provides an instant slide-over drawer allowing users to paste video description/transcript text, plus 4 pre-loaded popular meal-prep video templates.
  - *Why*: Ensures 100% operational reliability regardless of YouTube sandbox network policies.
- **Decision 2: Unit Normalization & Standard Baseline Conversion**:
  - *Chosen Approach*: Standardize common cooking measures (cloves to grams/pieces, cups of flour/sugar to grams, tbsp/tsp to fluid oz/ml) with an extensible culinary density table.
  - *Why*: Allows seamless addition of quantities from different creators without confusing Frankenstein units like "1/2 cup + 3 tablespoons + 40 grams".
- **Decision 3: Local Price Catalog with Zero Surveillance APIs**:
  - *Chosen Approach*: Maintain a local, user-editable catalog of retail package sizes and baseline unit costs. Calculations compute both out-of-pocket register cost (ceil(required / package_size) * package_price) and usage expense ((required / package_size) * package_price).
  - *Why*: Eliminates brittle external grocery scrapers, protects user location privacy, and allows exact personalization to local neighborhood markets.
- **Decision 4: Dynamic Tab Interaction & Focus Highlighting**:
  - *Chosen Approach*: Single unified grocery list maintaining aisle grouping. When filtering by recipe, out-of-scope items smoothly drop to 30% opacity rather than vanishing entirely, preserving grocery route mental mapping while calling out the active recipe's contributions.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite React Frontend                             │
│                                                                        │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐  │
│  │     Recipe Queue & Ingest     │  │   Interactive Aisle Grocery    │  │
│  │   - URL Input & Preset Grid   │  │   - Multi-Recipe Color Tabs    │  │
│  │   - Serving Multiplier Stepper│  │   - Active Recipe Focus (30%)  │  │
│  │   - Manual Paste Fallback     │  │   - Aisle Category Groups      │  │
│  └──────────────┬────────────────┘  └───────────────▲────────────────┘  │
│                 │                                   │                   │
│  ┌──────────────▼────────────────┐  ┌───────────────┴────────────────┐  │
│  │      Pantry Vault Modal       │  │   Pricing & Packaging Engine   │  │
│  │   - Persistent Staples Vault  │  │   - Register Total (Package)   │  │
│  │   - Perishable On-Hand Audit  │  │   - Usage Expense (Consumed)   │  │
│  │   - "Running Low" Toggles     │  │   - Local Catalog Unit Editor  │  │
│  └──────────────┬────────────────┘  └───────────────▲────────────────┘  │
│                 │                                   │                   │
│                 └─────────────────┬─────────────────┘                   │
│                                   │                                     │
│  ┌────────────────────────────────▼──────────────────────────────────┐  │
│  │                     Data Export & Mobile Handoff                  │  │
│  │   - Plain-Text SMS Formatter (Aisle Grouped with [ ] Checkboxes)  │  │
│  │   - Copy to Clipboard & Video Link Back-references                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP /api/*
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Express Full-Stack Server                        │
│                                                                        │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐  │
│  │    /api/youtube/extract       │  │    /api/recipes / /api/pantry  │  │
│  │   - YouTube Metadata Fetcher  │  │   - In-memory / SQLite Store   │  │
│  │   - Transcript / Caption Parse│  │   - Relational Recipes/Items   │  │
│  └──────────────┬────────────────┘  └────────────────────────────────┘  │
│                 │                                                       │
│  ┌──────────────▼────────────────┐                                      │
│  │    Gemini 3.8 Flash Parser    │                                      │
│  │   - Schema-guided extraction  │                                      │
│  │   - Fraction-to-decimal math  │                                      │
│  │   - Aisle category tagging    │                                      │
│  └───────────────────────────────┘                                      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Database & State Entities
- **Recipe**: `id`, `youtubeUrl`, `videoId`, `title`, `channelTitle`, `thumbnailUrl`, `servings`, `instructionsSummary`, `duration`
- **RecipeIngredient**: `id`, `recipeId`, `name`, `amount`, `unit`, `normalizedAmount`, `normalizedUnit`, `category`
- **PantryItem**: `id`, `name`, `onHandQuantity`, `unit`, `isStaple`, `isRunningLow`
- **PriceCatalogItem**: `id`, `ingredientPattern`, `packageSize`, `packageUnit`, `packagePrice`, `category`
- **ActiveGroceryBatch**: Selected recipes, custom serving multipliers, pantry deductions, packaging mode (`minimum` vs `bulk`).

---

### Verification Plan
1. **Compilation & Build**: Run `npm run build` to verify TypeScript typings and Tailwind CSS v4 styling.
2. **Recipe Extraction Verification**: Verify parsing with live YouTube video URLs and the fallback transcript/description parser with real recipes.
3. **Unit Math & Pantry Deduction**: Test fractional normalization (e.g., 1/2 cup + 1/4 cup -> 0.75 cup = 90g flour) and verify that items in the Pantry Vault correctly reduce net purchase quantities.
4. **Focus & Opacity Rules**: Verify that selecting a recipe tab dims other items to 30% opacity, moves active ingredients to the top, and displays single-recipe vs. total aggregate quantities.
5. **Pricing Metrics**: Verify Register Total and Usage Expense calculations in both "Minimum Needed" and "Bulk Packaging" modes.
6. **Export**: Test SMS formatted text generation and clipboard copy functionality.
