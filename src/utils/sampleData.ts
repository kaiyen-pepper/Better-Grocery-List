import { PantryItem, PriceCatalogItem, Recipe } from '../types/recipe';

export const DEFAULT_STAPLES_VAULT: PantryItem[] = [
  {
    id: 'staple-salt',
    name: 'Kosher Salt',
    category: 'Spices & Oils',
    onHandAmount: 16,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-pepper',
    name: 'Black Pepper',
    category: 'Spices & Oils',
    onHandAmount: 3,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-olive-oil',
    name: 'Extra Virgin Olive Oil',
    category: 'Spices & Oils',
    onHandAmount: 16.9,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-cooking-oil',
    name: 'Cooking Oil / Vegetable Oil',
    category: 'Spices & Oils',
    onHandAmount: 32,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-soy-sauce',
    name: 'Soy Sauce',
    category: 'Pantry',
    onHandAmount: 15,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-all-purpose-flour',
    name: 'All-Purpose Flour',
    category: 'Pantry',
    onHandAmount: 5,
    unit: 'lb',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-granulated-sugar',
    name: 'Granulated Sugar',
    category: 'Pantry',
    onHandAmount: 32,
    unit: 'oz',
    isStaple: true,
    isRunningLow: false,
  },
  {
    id: 'staple-water',
    name: 'Water',
    category: 'Pantry',
    onHandAmount: 100,
    unit: 'cup',
    isStaple: true,
    isRunningLow: false,
  },
];

export const DEFAULT_PRICE_CATALOG: PriceCatalogItem[] = [
  // Produce
  { id: 'cat-garlic', name: 'Garlic', category: 'Produce', packageSize: 10, packageUnit: 'clove', packagePrice: 1.99 },
  { id: 'cat-yellow-onion', name: 'Yellow Onion', category: 'Produce', packageSize: 3, packageUnit: 'item', packagePrice: 2.49 },
  { id: 'cat-red-onion', name: 'Red Onion', category: 'Produce', packageSize: 2, packageUnit: 'item', packagePrice: 1.99 },
  { id: 'cat-lime', name: 'Lime', category: 'Produce', packageSize: 3, packageUnit: 'item', packagePrice: 1.49 },
  { id: 'cat-lemon', name: 'Lemon', category: 'Produce', packageSize: 2, packageUnit: 'item', packagePrice: 1.49 },
  { id: 'cat-cilantro', name: 'Cilantro', category: 'Produce', packageSize: 1, packageUnit: 'bunch', packagePrice: 0.89 },
  { id: 'cat-spinach', name: 'Baby Spinach', category: 'Produce', packageSize: 5, packageUnit: 'oz', packagePrice: 2.99 },
  { id: 'cat-bell-pepper', name: 'Bell Peppers', category: 'Produce', packageSize: 3, packageUnit: 'item', packagePrice: 3.49 },
  { id: 'cat-russet-potato', name: 'Russet Potatoes', category: 'Produce', packageSize: 5, packageUnit: 'lb', packagePrice: 3.99 },
  { id: 'cat-sweet-potato', name: 'Sweet Potatoes', category: 'Produce', packageSize: 3, packageUnit: 'lb', packagePrice: 3.29 },
  { id: 'cat-carrots', name: 'Carrots', category: 'Produce', packageSize: 1, packageUnit: 'lb', packagePrice: 1.29 },
  { id: 'cat-ginger', name: 'Fresh Ginger', category: 'Produce', packageSize: 4, packageUnit: 'oz', packagePrice: 1.69 },

  // Meat & Seafood
  { id: 'cat-chicken-breast', name: 'Chicken Breast', category: 'Meat & Seafood', packageSize: 2, packageUnit: 'lb', packagePrice: 8.99 },
  { id: 'cat-chicken-thighs', name: 'Chicken Thighs', category: 'Meat & Seafood', packageSize: 2, packageUnit: 'lb', packagePrice: 7.49 },
  { id: 'cat-ground-beef', name: 'Ground Beef (85/15)', category: 'Meat & Seafood', packageSize: 1, packageUnit: 'lb', packagePrice: 5.99 },
  { id: 'cat-sirloin-steak', name: 'Sirloin Steak', category: 'Meat & Seafood', packageSize: 1.5, packageUnit: 'lb', packagePrice: 13.99 },
  { id: 'cat-wagyu-steak', name: 'Wagyu Steak', category: 'Meat & Seafood', packageSize: 1, packageUnit: 'lb', packagePrice: 28.99 },
  { id: 'cat-salmon', name: 'Salmon Fillets', category: 'Meat & Seafood', packageSize: 1, packageUnit: 'lb', packagePrice: 11.99 },

  // Dairy
  { id: 'cat-butter', name: 'Unsalted Butter', category: 'Dairy', packageSize: 1, packageUnit: 'lb', packagePrice: 4.29 },
  { id: 'cat-heavy-cream', name: 'Heavy Cream', category: 'Dairy', packageSize: 16, packageUnit: 'oz', packagePrice: 3.29 },
  { id: 'cat-greek-yogurt', name: 'Greek Yogurt', category: 'Dairy', packageSize: 32, packageUnit: 'oz', packagePrice: 4.49 },
  { id: 'cat-parmesan', name: 'Parmesan Cheese', category: 'Dairy', packageSize: 8, packageUnit: 'oz', packagePrice: 5.49 },
  { id: 'cat-eggs', name: 'Eggs (Dozen)', category: 'Dairy', packageSize: 12, packageUnit: 'item', packagePrice: 3.89 },

  // Spices & Oils
  { id: 'cat-olive-oil', name: 'Extra Virgin Olive Oil', category: 'Spices & Oils', packageSize: 16.9, packageUnit: 'oz', packagePrice: 8.49 },
  { id: 'cat-cooking-oil', name: 'Vegetable / Canola Oil', category: 'Spices & Oils', packageSize: 32, packageUnit: 'oz', packagePrice: 4.29 },
  { id: 'cat-salt', name: 'Kosher Salt', category: 'Spices & Oils', packageSize: 16, packageUnit: 'oz', packagePrice: 2.29 },
  { id: 'cat-black-pepper', name: 'Black Pepper', category: 'Spices & Oils', packageSize: 3, packageUnit: 'oz', packagePrice: 3.49 },
  { id: 'cat-smoked-paprika', name: 'Smoked Paprika', category: 'Spices & Oils', packageSize: 2, packageUnit: 'oz', packagePrice: 2.99 },
  { id: 'cat-cumin', name: 'Ground Cumin', category: 'Spices & Oils', packageSize: 2, packageUnit: 'oz', packagePrice: 2.89 },
  { id: 'cat-oregano', name: 'Dried Oregano', category: 'Spices & Oils', packageSize: 1.5, packageUnit: 'oz', packagePrice: 2.49 },

  // Canned & Dry Goods
  { id: 'cat-cannellini-beans', name: 'Cannellini Beans', category: 'Canned & Dry Goods', packageSize: 1, packageUnit: 'can', packagePrice: 1.19 },
  { id: 'cat-black-beans', name: 'Black Beans', category: 'Canned & Dry Goods', packageSize: 1, packageUnit: 'can', packagePrice: 1.19 },
  { id: 'cat-diced-tomatoes', name: 'Diced Tomatoes', category: 'Canned & Dry Goods', packageSize: 1, packageUnit: 'can', packagePrice: 1.29 },
  { id: 'cat-chipotle-adobo', name: 'Chipotle in Adobo', category: 'Canned & Dry Goods', packageSize: 7, packageUnit: 'oz', packagePrice: 1.89 },
  { id: 'cat-chicken-broth', name: 'Chicken Broth', category: 'Canned & Dry Goods', packageSize: 32, packageUnit: 'oz', packagePrice: 2.29 },
  { id: 'cat-vegetable-broth', name: 'Vegetable Broth', category: 'Canned & Dry Goods', packageSize: 32, packageUnit: 'oz', packagePrice: 2.29 },

  // Pantry
  { id: 'cat-basmati-rice', name: 'Basmati Rice', category: 'Pantry', packageSize: 32, packageUnit: 'oz', packagePrice: 3.29 },
  { id: 'cat-jasmine-rice', name: 'Jasmine Rice', category: 'Pantry', packageSize: 32, packageUnit: 'oz', packagePrice: 3.49 },
  { id: 'cat-soy-sauce', name: 'Soy Sauce', category: 'Pantry', packageSize: 15, packageUnit: 'oz', packagePrice: 2.79 },
  { id: 'cat-honey', name: 'Clover Honey', category: 'Pantry', packageSize: 12, packageUnit: 'oz', packagePrice: 4.19 },
  { id: 'cat-sesame-seeds', name: 'Sesame Seeds', category: 'Pantry', packageSize: 3, packageUnit: 'oz', packagePrice: 2.29 },
];

export const RECIPE_COLOR_PALETTES = [
  {
    bg: '#ffffff',
    text: '#000000',
    border: '#000000',
    accent: '#d2e823', // Lime Spark
  },
  {
    bg: '#ffffff',
    text: '#000000',
    border: '#000000',
    accent: '#e9c0e9', // Lavender Mist
  },
  {
    bg: '#ffffff',
    text: '#000000',
    border: '#000000',
    accent: '#2665d6', // Cobalt Band
  },
  {
    bg: '#ffffff',
    text: '#000000',
    border: '#000000',
    accent: '#d6a337', // Mustard Pop
  },
  {
    bg: '#ffffff',
    text: '#000000',
    border: '#000000',
    accent: '#780016', // Maroon Plate
  },
];

export const SAMPLE_RECIPE_PRESETS: Recipe[] = [
  {
    id: 'recipe-ethan-chipotle',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZJe3yL7NHdA',
    videoId: 'ZJe3yL7NHdA',
    title: 'How to Meal Prep Chicken (High-Protein Bowls)',
    channelTitle: 'Ethan Chlebowski',
    thumbnailUrl: 'https://img.youtube.com/vi/ZJe3yL7NHdA/hqdefault.jpg',
    servings: 4,
    defaultServings: 4,
    prepTime: '15 min',
    cookTime: '20 min',
    instructionsSummary: [
      'Blend chipotle in adobo, garlic, lime juice, and olive oil into marinade.',
      'Coat chicken breast cutlets and sear on medium-high skillet for 5-6 min per side.',
      'Simmer basmati rice with black beans and finish with chopped fresh cilantro.',
      'Portion into 4 high-protein meal prep containers.'
    ],
    colorTag: RECIPE_COLOR_PALETTES[0],
    ingredients: [
      { name: 'Chicken Breast', amount: 1.5, unit: 'lb', category: 'Meat & Seafood' },
      { name: 'Chipotle in Adobo', amount: 3.5, unit: 'oz', category: 'Canned & Dry Goods' },
      { name: 'Garlic', amount: 4, unit: 'clove', category: 'Produce' },
      { name: 'Lime', amount: 2, unit: 'item', category: 'Produce' },
      { name: 'Extra Virgin Olive Oil', amount: 2, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'Basmati Rice', amount: 1.5, unit: 'cup', category: 'Pantry' },
      { name: 'Black Beans', amount: 1, unit: 'can', category: 'Canned & Dry Goods' },
      { name: 'Cilantro', amount: 1, unit: 'bunch', category: 'Produce' },
      { name: 'Kosher Salt', amount: 1, unit: 'tsp', category: 'Spices & Oils' },
    ],
  },
  {
    id: 'recipe-rainbow-tuscan-soup',
    youtubeUrl: 'https://www.youtube.com/watch?v=5xWKvjE6kHg',
    videoId: '5xWKvjE6kHg',
    title: 'Creamy White Bean & Kale Soup (High-Protein One-Pot)',
    channelTitle: 'Rainbow Plant Life',
    thumbnailUrl: 'https://img.youtube.com/vi/5xWKvjE6kHg/hqdefault.jpg',
    servings: 4,
    defaultServings: 4,
    prepTime: '10 min',
    cookTime: '25 min',
    instructionsSummary: [
      'Sauté diced yellow onion and minced garlic in olive oil until sweet and fragrant.',
      'Add canned diced tomatoes and simmer to concentrate rich umami sweetness.',
      'Fold in cannellini beans and vegetable broth, simmering for 15 minutes.',
      'Wilt fresh baby spinach at the end and finish with fresh lemon squeeze.'
    ],
    colorTag: RECIPE_COLOR_PALETTES[1],
    ingredients: [
      { name: 'Cannellini Beans', amount: 2, unit: 'can', category: 'Canned & Dry Goods' },
      { name: 'Vegetable Broth', amount: 3, unit: 'cup', category: 'Canned & Dry Goods' },
      { name: 'Baby Spinach', amount: 5, unit: 'oz', category: 'Produce' },
      { name: 'Yellow Onion', amount: 1, unit: 'item', category: 'Produce' },
      { name: 'Garlic', amount: 5, unit: 'clove', category: 'Produce' },
      { name: 'Extra Virgin Olive Oil', amount: 3, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'Diced Tomatoes', amount: 1, unit: 'can', category: 'Canned & Dry Goods' },
      { name: 'Lemon', amount: 1, unit: 'item', category: 'Produce' },
      { name: 'Kosher Salt', amount: 1.5, unit: 'tsp', category: 'Spices & Oils' },
      { name: 'Black Pepper', amount: 0.5, unit: 'tsp', category: 'Spices & Oils' },
    ],
  },
  {
    id: 'recipe-prohomecooks-steak-bites',
    youtubeUrl: 'https://www.youtube.com/watch?v=UIOW18kRDEA',
    videoId: 'UIOW18kRDEA',
    title: '15-Minute Garlic Butter Steak Bites & Crispy Potatoes',
    channelTitle: 'Pro Home Cooks',
    thumbnailUrl: 'https://img.youtube.com/vi/UIOW18kRDEA/hqdefault.jpg',
    servings: 4,
    defaultServings: 4,
    prepTime: '10 min',
    cookTime: '15 min',
    instructionsSummary: [
      'Par-boil or microwave diced potatoes, then crisp in a hot cast-iron skillet.',
      'Sear 1-inch steak cubes for 2 minutes to achieve deep crust without overcooking.',
      'Drop heat, toss in unsalted butter, minced garlic, and splash of soy sauce.',
      'Baste vigorously for 60 seconds and divide into weekly glass prep bowls.'
    ],
    colorTag: RECIPE_COLOR_PALETTES[2],
    ingredients: [
      { name: 'Sirloin Steak', amount: 1.5, unit: 'lb', category: 'Meat & Seafood' },
      { name: 'Russet Potatoes', amount: 2, unit: 'lb', category: 'Produce' },
      { name: 'Unsalted Butter', amount: 4, unit: 'tbsp', category: 'Dairy' },
      { name: 'Garlic', amount: 6, unit: 'clove', category: 'Produce' },
      { name: 'Extra Virgin Olive Oil', amount: 2, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'Soy Sauce', amount: 1, unit: 'tbsp', category: 'Pantry' },
      { name: 'Kosher Salt', amount: 1.5, unit: 'tsp', category: 'Spices & Oils' },
      { name: 'Black Pepper', amount: 1, unit: 'tsp', category: 'Spices & Oils' },
    ],
  },
  {
    id: 'recipe-joshua-honey-soy-bowls',
    youtubeUrl: 'https://www.youtube.com/watch?v=Acs7ZnIdo4o',
    videoId: 'Acs7ZnIdo4o',
    title: 'Ultra Easy Healthy Meals (Week-Long Meal Prep)',
    channelTitle: 'Joshua Weissman',
    thumbnailUrl: 'https://img.youtube.com/vi/Acs7ZnIdo4o/hqdefault.jpg',
    servings: 4,
    defaultServings: 4,
    prepTime: '20 min',
    cookTime: '20 min',
    instructionsSummary: [
      'Marinate boneless chicken thighs in soy sauce, honey, minced garlic, and ginger.',
      'Cook fragrant jasmine rice with a pinch of salt.',
      'Char sliced bell peppers and yellow onions until sweet with blistered edges.',
      'Sear chicken thighs until glazed and caramelized; slice and assemble with toasted sesame seeds.'
    ],
    colorTag: RECIPE_COLOR_PALETTES[3],
    ingredients: [
      { name: 'Chicken Thighs', amount: 2, unit: 'lb', category: 'Meat & Seafood' },
      { name: 'Jasmine Rice', amount: 2, unit: 'cup', category: 'Pantry' },
      { name: 'Soy Sauce', amount: 4, unit: 'tbsp', category: 'Pantry' },
      { name: 'Clover Honey', amount: 2, unit: 'tbsp', category: 'Pantry' },
      { name: 'Garlic', amount: 4, unit: 'clove', category: 'Produce' },
      { name: 'Bell Peppers', amount: 2, unit: 'item', category: 'Produce' },
      { name: 'Yellow Onion', amount: 1, unit: 'item', category: 'Produce' },
      { name: 'Vegetable / Canola Oil', amount: 2, unit: 'tbsp', category: 'Spices & Oils' },
      { name: 'Sesame Seeds', amount: 1, unit: 'tbsp', category: 'Pantry' },
      { name: 'Kosher Salt', amount: 0.5, unit: 'tsp', category: 'Spices & Oils' },
    ],
  },
];
