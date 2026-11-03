/**
 * Unit Normalization and Culinary Math Engine
 */

export function parseFraction(fractionStr: string | number): number {
  if (typeof fractionStr === 'number') {
    return isNaN(fractionStr) ? 0 : fractionStr;
  }
  if (!fractionStr) return 0;
  const str = fractionStr.trim();
  
  // Mixed fraction: "1 1/2" or "2 3/4"
  if (str.includes(' ') && str.includes('/')) {
    const [whole, frac] = str.split(/\s+/);
    const wholeNum = parseFloat(whole) || 0;
    const [num, den] = frac.split('/');
    const fracNum = (parseFloat(num) || 0) / (parseFloat(den) || 1);
    return wholeNum + fracNum;
  }
  
  // Pure fraction: "1/2", "3/4", "2/3"
  if (str.includes('/')) {
    const [num, den] = str.split('/');
    return (parseFloat(num) || 0) / (parseFloat(den) || 1);
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function formatQuantity(amount: number): string {
  if (amount <= 0) return '0';
  
  // Clean integer
  if (Math.abs(amount - Math.round(amount)) < 0.01) {
    return Math.round(amount).toString();
  }

  const whole = Math.floor(amount);
  const remainder = amount - whole;

  let frac = '';
  if (Math.abs(remainder - 0.25) < 0.05) frac = '1/4';
  else if (Math.abs(remainder - 0.33) < 0.05) frac = '1/3';
  else if (Math.abs(remainder - 0.5) < 0.05) frac = '1/2';
  else if (Math.abs(remainder - 0.66) < 0.05) frac = '2/3';
  else if (Math.abs(remainder - 0.75) < 0.05) frac = '3/4';
  else if (Math.abs(remainder - 0.125) < 0.03) frac = '1/8';

  if (frac) {
    return whole > 0 ? `${whole} ${frac}` : frac;
  }

  return Number(amount.toFixed(2)).toString();
}

export function canonicalizeUnit(unitStr: string = ''): string {
  const u = unitStr.toLowerCase().trim().replace(/\.$/, '');
  
  if (['c', 'cup', 'cups'].includes(u)) return 'cup';
  if (['tbsp', 'tbs', 'tablespoon', 'tablespoons'].includes(u)) return 'tbsp';
  if (['tsp', 'teaspoon', 'teaspoons'].includes(u)) return 'tsp';
  if (['clove', 'cloves'].includes(u)) return 'clove';
  if (['g', 'gram', 'grams', 'gr'].includes(u)) return 'g';
  if (['kg', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['oz', 'ounce', 'ounces'].includes(u)) return 'oz';
  if (['lb', 'lbs', 'pound', 'pounds'].includes(u)) return 'lb';
  if (['can', 'cans'].includes(u)) return 'can';
  if (['bunch', 'bunches'].includes(u)) return 'bunch';
  if (['head', 'heads'].includes(u)) return 'head';
  if (['stalk', 'stalks'].includes(u)) return 'stalk';
  if (['pinch', 'pinches'].includes(u)) return 'pinch';
  if (['bottle', 'bottles'].includes(u)) return 'bottle';
  if (['piece', 'pieces', 'pc', 'pcs', '', 'item', 'items'].includes(u)) return 'item';
  
  return u;
}

// Convert recipe units to match price catalog base units
export function normalizeToCatalogUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  ingredientName: string = ''
): number {
  const f = canonicalizeUnit(fromUnit);
  const t = canonicalizeUnit(toUnit);
  const name = ingredientName.toLowerCase();

  if (f === t) return amount;

  // Volume conversions
  if (f === 'tsp' && t === 'tbsp') return amount / 3;
  if (f === 'tbsp' && t === 'tsp') return amount * 3;
  if (f === 'tbsp' && t === 'cup') return amount / 16;
  if (f === 'cup' && t === 'tbsp') return amount * 16;
  if (f === 'tsp' && t === 'cup') return amount / 48;
  if (f === 'cup' && t === 'tsp') return amount * 48;

  // Weight conversions
  if (f === 'oz' && t === 'lb') return amount / 16;
  if (f === 'lb' && t === 'oz') return amount * 16;
  if (f === 'g' && t === 'kg') return amount / 1000;
  if (f === 'kg' && t === 'g') return amount * 1000;
  if (f === 'g' && t === 'oz') return amount / 28.35;
  if (f === 'oz' && t === 'g') return amount * 28.35;
  if (f === 'g' && t === 'lb') return amount / 453.59;
  if (f === 'lb' && t === 'g') return amount * 453.59;

  // Specialized culinary equivalents
  // Garlic cloves vs head
  if (f === 'clove' && t === 'head') return amount / 10;
  if (f === 'head' && t === 'clove') return amount * 10;
  if (f === 'clove' && t === 'item') return amount;

  // Butter stick vs cup vs tbsp
  if (name.includes('butter')) {
    if (f === 'cup' && t === 'lb') return amount * 0.5;
    if (f === 'tbsp' && t === 'lb') return amount / 32;
    if (f === 'tbsp' && t === 'cup') return amount / 16;
  }

  // Liquid oil / sauce
  if (name.includes('oil') || name.includes('sauce') || name.includes('vinegar')) {
    if (f === 'tbsp' && t === 'oz') return amount * 0.5;
    if (f === 'cup' && t === 'oz') return amount * 8;
  }

  // Salt & Spices: pinch / tsp to oz
  if (f === 'pinch' && t === 'tsp') return amount * 0.125;
  if (f === 'pinch' && t === 'oz') return amount * 0.02;
  if (f === 'tsp' && t === 'oz') return amount * 0.17;
  if (f === 'tbsp' && t === 'oz') return amount * 0.5;

  return amount;
}
