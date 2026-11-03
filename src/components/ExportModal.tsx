import React, { useState, useEffect } from 'react';
import { Copy, Check, Send, Smartphone, ExternalLink } from 'lucide-react';
import { GroceryItem, Recipe } from '../types/recipe';
import { formatQuantity } from '../utils/conversions';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groceryItems: GroceryItem[];
  recipes: Recipe[];
  registerTotal: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  groceryItems,
  recipes,
  registerTotal,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format SMS plain-text grouped by aisle
  const aisleGroups: Record<string, GroceryItem[]> = {};
  groceryItems.forEach((item) => {
    if (item.netToBuy > 0) {
      if (!aisleGroups[item.category]) {
        aisleGroups[item.category] = [];
      }
      aisleGroups[item.category].push(item);
    }
  });

  const lines: string[] = [];
  lines.push(`🛒 DELIPREP GROCERY RUN`);
  lines.push(`Est. Out-of-Pocket: $${registerTotal.toFixed(2)}`);
  lines.push(`Recipes: ${recipes.map((r) => r.title).join(', ')}`);
  lines.push(``);

  Object.entries(aisleGroups).forEach(([aisle, items]) => {
    lines.push(`--- ${aisle.toUpperCase()} ---`);
    items.forEach((item) => {
      lines.push(`• [ ] ${item.name}: ${formatQuantity(item.netToBuy)} ${item.unit}`);
    });
    lines.push(``);
  });

  const formattedText = lines.join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus(null);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: formattedText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus(`List successfully dispatched via SMS to ${phoneNumber}!`);
      } else {
        setSendStatus(`Failed to send: ${data.error}`);
      }
    } catch (err: any) {
      setSendStatus(`Dispatch error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-[2px] flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#ffffff] rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-[#000000] overflow-hidden cursor-default shadow-none"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b-2 border-[#000000] bg-[#ffffff] flex items-center justify-between">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#000000]">
              SMS &amp; In-Store Grocery Export
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-extrabold px-4 py-2 rounded-full border-2 border-[#000000] bg-[#ffffff] hover:bg-[#f3f3f1] cursor-pointer tracking-tight transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-sans space-y-5 bg-[#ffffff]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#000000]">
                Aisle-Organized Plain Text Format
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 text-xs font-extrabold bg-[#d2e823] text-[#000000] rounded-full border-2 border-[#000000] hover:bg-[#c4db1b] flex items-center gap-1.5 cursor-pointer shadow-none active:translate-y-0.5 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2.5]" /> Copy Entire List
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={12}
              value={formattedText}
              className="w-full p-4 bg-[#f3f3f1] border-2 border-[#000000] rounded-2xl text-xs font-mono text-[#000000] focus:outline-none select-all font-medium leading-relaxed"
            />
          </div>

          {/* SMS Dispatch Form */}
          <form onSubmit={handleSendSms} className="p-5 bg-[#ebffc5] rounded-2xl border-2 border-[#000000] space-y-3">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-[#000000] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#2665d6] stroke-[2.5]" />
              Send Directly to Phone via SMS (Twilio Dispatch)
            </span>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-[#ffffff] border-2 border-[#000000] rounded-full font-mono text-[#000000] focus:outline-none placeholder:text-[#000000]/40 font-bold"
              />
              <button
                type="submit"
                disabled={isSending || !phoneNumber}
                className="px-6 py-2.5 text-xs font-extrabold bg-[#d2e823] text-[#000000] border-2 border-[#000000] rounded-full hover:bg-[#c4db1b] disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:translate-y-0.5 transition-all"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                {isSending ? 'Sending...' : 'Dispatch SMS'}
              </button>
            </div>

            {sendStatus && (
              <p className="p-3 rounded-xl border-2 border-[#000000] bg-[#ffffff] text-xs font-bold text-[#000000]">
                {sendStatus}
              </p>
            )}
          </form>

          {/* Original Video Cooking References */}
          {recipes.length > 0 && (
            <div className="pt-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#000000] mb-2">
                Original Cooking Video References
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipes.map((r) => (
                  <a
                    key={r.id}
                    href={r.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#f3f3f1] hover:bg-[#ebffc5] border-2 border-[#000000] rounded-xl flex items-center justify-between text-xs font-bold text-[#000000] transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{r.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
