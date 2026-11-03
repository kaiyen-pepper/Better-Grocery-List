import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenPantryModal: () => void;
  onOpenCatalogModal: () => void;
  onOpenExportModal: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenPantryModal,
  onOpenCatalogModal,
  onOpenExportModal,
  activeCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-4 z-30 px-4 sm:px-8 transition-colors">
      <div
        className={`max-w-7xl mx-auto border-2 border-[#000000] rounded-full pl-5 pr-6 sm:pl-6 sm:pr-8 py-2.5 flex items-center justify-between gap-6 transition-colors duration-200 ${
          isScrolled ? 'bg-[#ebffc5]' : 'bg-[#ffffff]'
        }`}
      >
        {/* Zone 1: Brand Wordmark */}
        <a href="#queue" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <span className="w-8 h-8 rounded-full bg-[#d2e823] border-2 border-[#000000] text-[#000000] flex items-center justify-center font-display text-base font-extrabold tracking-tight">
            D
          </span>
          <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#000000]">
            DeliPrep
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#000000]">
          <a
            href="#queue"
            className="hover:text-[#2665d6] transition-colors whitespace-nowrap shrink-0"
          >
            Recipe Queue {activeCount > 0 && `(${activeCount})`}
          </a>
          <button
            onClick={onOpenPantryModal}
            className="hover:text-[#2665d6] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bold"
          >
            Pantry &amp; Staples
          </button>
          <button
            onClick={onOpenCatalogModal}
            className="hover:text-[#2665d6] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bold"
          >
            Price Catalog
          </button>
          <button
            onClick={onOpenExportModal}
            className="hover:text-[#2665d6] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bold"
          >
            SMS Export
          </button>
        </nav>

        {/* Zone 3: Primary Action - Lime Spark Sticker Button with right breathing room */}
        <div className="flex items-center gap-3 shrink-0 mr-1 sm:mr-3">
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2 text-xs sm:text-sm font-extrabold text-[#000000] bg-[#d2e823] rounded-full border-2 border-[#000000] hover:bg-[#c2d718] active:translate-y-0.5 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-none"
          >
            + Add YouTube Recipe
          </button>
        </div>
      </div>
    </header>
  );
};
