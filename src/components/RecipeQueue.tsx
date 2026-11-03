import React, { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Plus, Minus, FileText, Youtube, Check } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { SAMPLE_RECIPE_PRESETS } from '../utils/sampleData';

interface RecipeQueueProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onRemoveRecipe: (recipeId: string) => void;
  onUpdateServings: (recipeId: string, delta: number) => void;
  onExtractUrl: (url: string, rawText?: string, manualTitle?: string) => Promise<boolean>;
  isLoading: boolean;
  isOpenAddModal: boolean;
  onCloseAddModal: () => void;
}

export const RecipeQueue: React.FC<RecipeQueueProps> = ({
  recipes,
  onAddRecipe,
  onRemoveRecipe,
  onUpdateServings,
  onExtractUrl,
  isLoading,
  isOpenAddModal,
  onCloseAddModal,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isAllowedYouTubeUrl = (urlStr: string): boolean => {
    if (!urlStr) return false;
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const allowed = ['youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'];
      return allowed.includes(host) || host.endsWith('.youtube.com');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isOpenAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseAddModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenAddModal, onCloseAddModal]);

  const handleExtractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!inputUrl && !pastedText) {
      setErrorMessage('Please enter a YouTube video URL or paste recipe text.');
      return;
    }

    // Domain Guard: Reject non-YouTube URLs immediately
    if (inputUrl && !isAllowedYouTubeUrl(inputUrl)) {
      setErrorMessage('Only YouTube URLs are supported in this prototype.');
      return;
    }

    try {
      const success = await onExtractUrl(inputUrl, pastedText, pastedTitle);
      if (success) {
        setInputUrl('');
        setPastedText('');
        setPastedTitle('');
        setShowPasteFallback(false);
        onCloseAddModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'No ingredients detected in this video. If description is missing ingredients, try pasting text manually.');
    }
  };

  const handlePresetSelect = (preset: Recipe) => {
    const existing = recipes.find((r) => r.videoId === preset.videoId);
    if (existing) {
      onRemoveRecipe(existing.id);
    } else {
      onAddRecipe(preset);
    }
  };

  return (
    <section id="queue" className="mb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b-2 border-[#000000]">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] text-[#000000]">
            Weekly Meal Prep Board
          </h1>
          <p className="text-[#000000]/75 text-base sm:text-lg mt-2 max-w-2xl font-medium">
            Paste YouTube cooking videos or tap presets below. Ingredients normalize across recipes, deduct pantry stock, and group by aisle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasteFallback(!showPasteFallback)}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-[#000000] bg-[#ffffff] border-2 border-[#000000] rounded-full hover:bg-[#ebffc5] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            {showPasteFallback ? 'Hide Paste Drawer' : 'Paste Description / Transcript'}
          </button>
        </div>
      </div>

      {/* YouTube URL & Paste Drawer Section */}
      <div className="bg-[#ffffff] rounded-[32px] p-5 sm:p-6 border-2 border-[#000000] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="text-base font-extrabold text-[#000000]">
            Add Recipe via YouTube URL or Raw Text
          </span>
          <button
            type="button"
            onClick={() => setShowPasteFallback(!showPasteFallback)}
            className={`self-start sm:self-auto px-4 py-1.5 text-xs font-bold border-2 border-[#000000] rounded-full transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 ${
              showPasteFallback
                ? 'bg-[#e9c0e9] text-[#000000]'
                : 'bg-[#f3f3f1] hover:bg-[#ebffc5] text-[#000000]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {showPasteFallback ? 'Hide Paste Drawer' : 'Paste Description / Transcript'}
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleExtractSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#000000]">
              <Youtube className="w-5 h-5 text-[#780016]" />
            </div>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste YouTube Cooking URL (https://www.youtube.com/watch?v=...)"
              className="w-full pl-12 pr-4 py-3.5 bg-[#f3f3f1] border-2 border-[#000000] rounded-full text-sm text-[#000000] placeholder-[#000000]/50 focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            className="px-7 py-3.5 text-sm font-extrabold text-[#000000] bg-[#d2e823] hover:bg-[#c2d718] active:translate-y-0.5 rounded-full border-2 border-[#000000] transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Recipe to Batch
              </>
            )}
          </button>
        </form>

        {/* Manual Paste Drawer inside the same section */}
        {showPasteFallback && (
          <div className="mt-5 pt-5 border-t-2 border-[#000000]">
            <div className="bg-[#e9c0e9] rounded-2xl p-5 border-2 border-[#000000] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#000000]">
                    Paste Video Description or Transcript
                  </h3>
                  <p className="text-xs text-[#000000]/80 font-medium">
                    If YouTube captions are unavailable, paste description text or ingredients directly here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasteFallback(false)}
                  className="px-3 py-1 bg-[#ffffff] border-2 border-[#000000] rounded-full text-xs font-bold text-[#000000] hover:bg-[#f3f3f1] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#000000] mb-1">
                      Recipe / Video Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={pastedTitle}
                      onChange={(e) => setPastedTitle(e.target.value)}
                      placeholder="e.g. 20-Minute Creamy Chicken Pasta"
                      className="w-full px-4 py-2.5 text-sm bg-[#ffffff] border-2 border-[#000000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#000000] mb-1">
                      YouTube Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 text-sm bg-[#ffffff] border-2 border-[#000000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#000000] mb-1">
                    Video Description, Caption Text, or Ingredient Notes
                  </label>
                  <textarea
                    rows={4}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the video description, ingredients list, or full transcript here..."
                    className="w-full p-4 text-sm bg-[#ffffff] border-2 border-[#000000] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-mono text-xs"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-[#780016] font-extrabold bg-[#ffffff] p-2 rounded-lg border border-[#000000]">{errorMessage}</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExtractSubmit}
                    disabled={isLoading}
                    className="px-6 py-2.5 text-sm font-extrabold text-[#000000] bg-[#d2e823] rounded-full border-2 border-[#000000] hover:bg-[#c2d718] active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Parsing with Gemini...' : 'Extract Recipe Ingredients'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Bento Grid */}
      <div className="bg-[#ffffff] rounded-[32px] p-5 sm:p-6 border-2 border-[#000000] mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-extrabold text-[#000000]">
            Popular YouTube Meal Preps
          </span>
          <span className="text-xs font-bold bg-[#f3f3f1] border border-[#000000] px-3 py-1 rounded-full text-[#000000]">
            {recipes.length} of 4 active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_RECIPE_PRESETS.map((preset) => {
            const isAdded = recipes.some((r) => r.videoId === preset.videoId);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-4 rounded-2xl border-2 border-[#000000] transition-all flex flex-col justify-between cursor-pointer active:translate-y-0.5 ${
                  isAdded
                    ? 'bg-[#d2e823] text-[#000000]'
                    : 'bg-[#ffffff] hover:bg-[#f3f3f1] text-[#000000]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide opacity-80 truncate">
                      {preset.channelTitle}
                    </span>
                    {isAdded ? (
                      <span className="text-xs font-extrabold bg-[#000000] text-[#ffffff] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 text-[#d2e823]" /> Added
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold bg-[#f3f3f1] border border-[#000000] text-[#000000] px-2 py-0.5 rounded-full shrink-0">
                        + Add
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-sm sm:text-base font-extrabold leading-snug line-clamp-2">
                    {preset.title}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-[#000000]/20 flex items-center justify-between text-xs font-semibold opacity-75">
                  <span>{preset.ingredients.length} items</span>
                  <span>{preset.servings} servings</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Recipes Queue Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#000000]">
            Active Recipes ({recipes.length})
          </h2>
          <span className="text-xs sm:text-sm text-[#000000]/70 font-semibold">
            Serving adjusters scale ingredients dynamically
          </span>
        </div>

        {recipes.length === 0 ? (
          <div className="p-10 text-center bg-[#ffffff] border-2 border-dashed border-[#000000] rounded-[32px]">
            <p className="font-display text-xl font-extrabold text-[#000000]">No recipes in your queue</p>
            <p className="text-sm text-[#000000]/60 mt-1 max-w-md mx-auto font-medium">
              Paste any YouTube recipe link or click a preset card above to load ingredients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#ffffff] rounded-[32px] border-2 border-[#000000] overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#000000] leading-snug">
                        {recipe.title}
                      </h3>
                      {recipe.channelTitle && (
                        <span className="inline-block mt-1 text-xs font-bold text-[#000000] bg-[#f3f3f1] border border-[#000000] px-2 py-0.5 rounded-full">
                          {recipe.channelTitle}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveRecipe(recipe.id)}
                      className="w-8 h-8 rounded-full border border-[#000000] hover:bg-[#780016] hover:text-[#ffffff] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Remove from batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-[#000000]/70 font-semibold flex items-center gap-3 my-3">
                    {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
                    {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
                    <span>{recipe.ingredients.length} Ingredients</span>
                  </div>

                  {/* Serving Scaler */}
                  <div className="mt-4 pt-4 border-t border-[#000000]/15 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-[#000000]">
                      Yield / Servings
                    </span>

                    <div className="flex items-center gap-2 bg-[#f3f3f1] px-3 py-1 rounded-full border-2 border-[#000000]">
                      <button
                        type="button"
                        onClick={() => onUpdateServings(recipe.id, -1)}
                        disabled={recipe.servings <= 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#000000] hover:bg-[#ffffff] disabled:opacity-30 border border-[#000000] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-extrabold font-mono min-w-5 text-center text-[#000000]">
                        {recipe.servings}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateServings(recipe.id, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#000000] hover:bg-[#d2e823] border border-[#000000] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer link to YouTube */}
                <div className="px-5 py-3 bg-[#f3f3f1] border-t-2 border-[#000000] flex items-center justify-between text-xs font-bold text-[#000000]">
                  <a
                    href={recipe.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#2665d6]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                  </a>
                  <span className="text-[11px] font-mono">
                    {recipe.servings / recipe.defaultServings}x batch
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal triggered from Header */}
      {isOpenAddModal && (
        <div
          onClick={onCloseAddModal}
          className="fixed inset-0 z-50 bg-[#000000]/60 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#ffffff] rounded-[32px] max-w-lg w-full p-6 sm:p-8 border-2 border-[#000000] shadow-none cursor-default"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#000000]">
              <h3 className="font-display text-2xl font-extrabold text-[#000000]">
                Add YouTube Recipe
              </h3>
              <button
                onClick={onCloseAddModal}
                className="w-8 h-8 rounded-full border border-[#000000] text-xs font-bold hover:bg-[#f3f3f1] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExtractSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#000000] mb-1">
                  YouTube Cooking Video URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 text-sm bg-[#f3f3f1] border-2 border-[#000000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#000000] mb-1">
                  Optional: Paste Description / Transcript fallback
                </label>
                <textarea
                  rows={3}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="If captions are disabled or description is minimal, paste ingredients here..."
                  className="w-full p-3 text-xs bg-[#f3f3f1] border-2 border-[#000000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d2e823] font-mono"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-[#780016] font-extrabold bg-[#e9c0e9] p-2 rounded-lg border border-[#000000]">{errorMessage}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-5 py-2 text-xs font-bold text-[#000000] hover:bg-[#f3f3f1] rounded-full border border-[#000000] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-xs font-extrabold text-[#000000] bg-[#d2e823] rounded-full border-2 border-[#000000] hover:bg-[#c2d718] active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Extracting...' : 'Extract Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
