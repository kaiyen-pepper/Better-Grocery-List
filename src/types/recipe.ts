export type AisleCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy'
  | 'Spices & Oils'
  | 'Pantry'
  | 'Canned & Dry Goods'
  | 'Other';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: AisleCategory;
  notes?: string;
}

export interface Recipe {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  servings: number;
  defaultServings: number;
  prepTime?: string;
  cookTime?: string;
  instructionsSummary?: string[];
  ingredients: Ingredient[];
  colorTag: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
}

export interface PantryItem {
  id: string;
  name: string;
  category: AisleCategory;
  onHandAmount: number;
  unit: string;
  isStaple: boolean;
  isRunningLow: boolean;
}

export interface PriceCatalogItem {
  id: string;
  name: string;
  category: AisleCategory;
  packageSize: number;
  packageUnit: string;
  packagePrice: number;
}

export interface GroceryItemBreakdown {
  recipeId: string;
  recipeTitle: string;
  colorTag: Recipe['colorTag'];
  amount: number;
  unit: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: AisleCategory;
  totalNeeded: number;
  unit: string;
  onHandAmount: number;
  netToBuy: number;
  recipeBreakdown: GroceryItemBreakdown[];
  packageSize: number;
  packageUnit: string;
  packagePrice: number;
  packageCount: number;
  registerCost: number;
  usageCost: number;
  isChecked: boolean;
  isStapleDeducted: boolean;
}

export type PackagingMode = 'minimum' | 'bulk';
