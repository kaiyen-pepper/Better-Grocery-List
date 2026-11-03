import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function isValidYouTubeUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
    const host = parsed.hostname.toLowerCase();
    const validYouTubeHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
    return validYouTubeHosts.includes(host);
  } catch {
    return false;
  }
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Standard watch
  const matchWatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (matchWatch && matchWatch[1]) return matchWatch[1];
  // Shorts
  const matchShorts = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (matchShorts && matchShorts[1]) return matchShorts[1];
  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

// Culinary keyword list for Pre-LLM Stage A heuristic checking
const CULINARY_KEYWORDS = [
  'recipe',
  'recipes',
  'ingredient',
  'ingredients',
  'tbsp',
  'tablespoon',
  'tablespoons',
  'tsp',
  'teaspoon',
  'teaspoons',
  'cups',
  'cup',
  'prep',
  'cook time',
  'cooking',
  'cook',
  'grams',
  'gram',
  'servings',
  'serving',
  'oz',
  'lbs',
  'pound',
  'clove',
  'cloves',
  'skillet',
  'simmer',
  'sauté',
  'saute',
  'bake',
  'marinate',
  'marinade',
  'seasoning',
  'salt',
  'pepper',
  'olive oil',
  'garlic',
  'onion',
  'chicken',
  'beef',
  'pork',
  'fish',
  'rice',
  'pasta',
  'sauce',
  'meal prep',
];

// Extraction API
app.post('/api/youtube/extract', async (req: Request, res: Response) => {
  try {
    const { url, rawText, manualTitle } = req.body;

    if (!url && !rawText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a YouTube URL or recipe text.',
      });
    }

    // 1. Handling Non-YouTube URLs (Domain Validation)
    if (url && !isValidYouTubeUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Only YouTube URLs are supported in this prototype. Please paste a standard YouTube video link.',
      });
    }

    const videoId = url ? extractYouTubeVideoId(url) : null;
    let fetchedTitle = manualTitle || '';
    let fetchedAuthor = '';
    let videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    let descriptionText = '';
    let categoryId = '';
    let categoryName = '';

    // Stage A: Metadata & Category Guardrails (Pre-LLM)
    if (url && videoId) {
      // 1. Try oEmbed
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData: any = await oembedRes.json();
          fetchedTitle = oembedData.title || fetchedTitle;
          fetchedAuthor = oembedData.author_name || fetchedAuthor;
          if (oembedData.thumbnail_url) {
            videoThumbnail = oembedData.thumbnail_url;
          }
        }
      } catch (err) {
        console.warn('oEmbed fetch note:', err);
      }

      // 2. Fetch page HTML for description, categoryId & genre
      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        if (pageRes.ok) {
          const html = await pageRes.text();

          // Extract category ID (Category 26 = Howto & Style)
          const catMatch = html.match(/"categoryId":\s*"(\d+)"/);
          if (catMatch && catMatch[1]) {
            categoryId = catMatch[1];
          }

          // Extract genre / category name
          const genreMatch = html.match(/"genre":\s*"([^"]+)"/);
          if (genreMatch && genreMatch[1]) {
            categoryName = genreMatch[1];
          }

          // Extract description from meta or ytInitialData
          const descMatch = html.match(/"shortDescription":"(.*?)"/);
          if (descMatch && descMatch[1]) {
            try {
              descriptionText = JSON.parse(`"${descMatch[1]}"`);
            } catch {
              descriptionText = descMatch[1];
            }
          }
        }
      } catch (err) {
        console.warn('Direct page scrape note:', err);
      }
    }

    // Category ID Guardrail: Category 26 is "Howto & Style" (where cooking videos live)
    // Non-cooking categories like Gaming (20), Music (10), News (25) trigger low confidence
    let categoryWarning = '';
    if (categoryId === '20' || /gaming/i.test(categoryName)) {
      categoryWarning = 'Video is categorized under Gaming instead of cooking/food.';
    } else if (categoryId === '10' || /music/i.test(categoryName)) {
      categoryWarning = 'Video is categorized under Music instead of cooking/food.';
    } else if (categoryId === '25' || /news/i.test(categoryName)) {
      categoryWarning = 'Video is categorized under News & Politics instead of cooking/food.';
    }

    // Keyword Heuristics: Scan title and description text for common culinary keywords
    const combinedPreText = `${fetchedTitle} ${descriptionText}`.toLowerCase();
    const hasCulinaryKeywords = CULINARY_KEYWORDS.some((kw) => combinedPreText.includes(kw));

    // If zero cooking keywords exist and no raw transcript was provided, reject immediately
    if (!rawText && !hasCulinaryKeywords) {
      return res.status(200).json({
        success: false,
        is_recipe: false,
        confidence_reason: categoryWarning || 'Zero culinary keywords detected in video title and description.',
        error: 'No ingredients could be detected in this video. If the description is missing them, try pasting the recipe text manually.',
        needsFallback: true,
        videoId,
        title: fetchedTitle,
        thumbnailUrl: videoThumbnail,
        channelTitle: fetchedAuthor,
      });
    }

    // Combine gathered metadata with user-provided raw transcript/description text
    const textToAnalyze = [
      fetchedTitle ? `Video Title: ${fetchedTitle}` : '',
      fetchedAuthor ? `Channel: ${fetchedAuthor}` : '',
      categoryName ? `Category: ${categoryName} (ID: ${categoryId || 'unknown'})` : '',
      categoryWarning ? `Category Warning: ${categoryWarning}` : '',
      descriptionText ? `Video Description:\n${descriptionText}` : '',
      rawText ? `Pasted Description / Spoken Transcript:\n${rawText}` : '',
    ].filter(Boolean).join('\n\n');

    if (!textToAnalyze || textToAnalyze.trim().length < 15) {
      return res.status(200).json({
        success: false,
        is_recipe: false,
        confidence_reason: 'Description text is too brief or empty.',
        error: 'No ingredients could be detected in this video. If the description is missing them, try pasting the recipe text manually.',
        needsFallback: true,
        videoId,
        title: fetchedTitle,
        thumbnailUrl: videoThumbnail,
        channelTitle: fetchedAuthor,
      });
    }

    // Stage B: LLM Parsing Validation (During LLM Extraction)
    const prompt = `You are a strict culinary data extractor and recipe classifier for a grocery meal-prep engine.
Inspect the title, channel, description, and transcript text to determine if it describes an actionable cooking recipe with culinary ingredients.

CONTENT VALIDATION:
- If this video is NOT a recipe (e.g. gaming, tech review, music video, podcast, vlog without recipe steps/ingredients, or non-cooking topic) OR if the content lacks actionable recipe steps/ingredients:
  Set "is_recipe": false
  Set "confidence_reason": Explain clearly why (e.g. "The video description contains tech hardware specs instead of cooking ingredients.")
  Set "servings": null
  Set "ingredients": []
- If it IS an actionable recipe with ingredients:
  Set "is_recipe": true
  Set "confidence_reason": Explain clearly (e.g. "Video outlines ingredients and steps for chicken breast meal prep.")
  Set "title": Clean recipe title
  Set "servings": number of servings (default 4 if unspecified)
  Set "ingredients": array of ingredients

CRITICAL INGREDIENT EXTRACTION RULES:
1. Convert all fractions (e.g., "1/2", "3/4", "1 1/2") to decimal numbers (0.5, 0.75, 1.5).
2. Clean ingredient names to generic items (e.g., "Roma Tomato" instead of "Fresh Diced Roma Tomatoes", "Garlic" instead of "fresh garlic cloves", "Chicken Breast" instead of "boneless skinless chicken breasts").
3. Assign each ingredient strictly to one of:
   - "Produce" (fresh vegetables, herbs, fruits, onions, garlic, potatoes)
   - "Meat & Seafood" (chicken, beef, pork, salmon, etc.)
   - "Dairy" (butter, milk, cream, cheese, yogurt, eggs)
   - "Spices & Oils" (olive oil, vegetable oil, salt, black pepper, cumin, paprika, spices)
   - "Pantry" (rice, pasta, flour, sugar, honey, soy sauce, vinegars, sesame seeds)
   - "Canned & Dry Goods" (canned beans, diced tomatoes, broth, stock, canned chipotle)
   - "Other"
4. Standardize units: g, oz, cup, tbsp, tsp, clove, lb, piece, can, bunch, item.

Text to analyze:
${textToAnalyze}`;

    const geminiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_recipe: { type: Type.BOOLEAN },
            confidence_reason: { type: Type.STRING },
            title: { type: Type.STRING },
            channelTitle: { type: Type.STRING },
            servings: { type: Type.NUMBER, nullable: true },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            instructionsSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: [
                      'Produce',
                      'Meat & Seafood',
                      'Dairy',
                      'Spices & Oils',
                      'Pantry',
                      'Canned & Dry Goods',
                      'Other',
                    ],
                  },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'amount', 'unit', 'category'],
              },
            },
          },
          required: ['is_recipe', 'confidence_reason', 'ingredients'],
        },
      },
    });

    const parsedData = JSON.parse(geminiRes.text || '{}');

    // Content Guardrail Check: Reject non-recipe content
    if (parsedData.is_recipe === false || !parsedData.ingredients || parsedData.ingredients.length === 0) {
      return res.status(200).json({
        success: false,
        is_recipe: false,
        confidence_reason: parsedData.confidence_reason || 'No culinary ingredients could be detected.',
        error: 'No ingredients could be detected in this video. If the description is missing them, try pasting the recipe text manually.',
        needsFallback: true,
        videoId,
        title: fetchedTitle || parsedData.title || '',
        thumbnailUrl: videoThumbnail,
        channelTitle: fetchedAuthor || parsedData.channelTitle || '',
      });
    }

    // Valid recipe response: attach metadata
    parsedData.videoId = videoId || '';
    parsedData.youtubeUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
    parsedData.thumbnailUrl = videoThumbnail || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=640&q=80';
    if (!parsedData.channelTitle && fetchedAuthor) {
      parsedData.channelTitle = fetchedAuthor;
    }
    if (!parsedData.servings || parsedData.servings <= 0) {
      parsedData.servings = 4;
    }

    return res.json({ success: true, is_recipe: true, recipe: parsedData });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract recipe from video.',
    });
  }
});

// SMS Dispatch / Simulation endpoint
app.post('/api/sms/send', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // In this prototype, we simulate a successful SMS transmission with Twilio format
    console.log(`[SMS DISPATCH] Recipient: ${phoneNumber || 'Direct Clipboard'}, Length: ${message.length} chars`);
    
    return res.json({
      success: true,
      deliveredTo: phoneNumber || 'Clipboard Export',
      timestamp: new Date().toISOString(),
      characterCount: message.length,
      status: 'queued_and_sent',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to dispatch SMS' });
  }
});

// Mount Vite or static server
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meal Prep & Grocery Engine running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
