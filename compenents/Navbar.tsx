import React, { useRef, useState, useMemo } from 'react';
import { ShoppingBag, Search, Globe, ChevronDown, X, Heart } from 'lucide-react';
import { View, Language, Product } from '../types';

interface NavbarProps {
  setView: (view: View) => void;
  cartCount: number;
  likedCount: number;
  onAdminAttempt: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allProducts: Product[];
  handleViewProduct: (product: Product) => void;
  onFavoritesClick: () => void;
  translations: any;
}

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="text-indigo-600 font-black">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const Navbar: React.FC<NavbarProps> = ({ 
  setView, 
  cartCount, 
  likedCount,
  onAdminAttempt, 
  language, 
  setLanguage,
  searchTerm,
  setSearchTerm,
  allProducts,
  handleViewProduct,
  onFavoritesClick,
  translations: t
}) => {
  const timerRef = useRef<number | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleMouseDown = () => {
    setIsPressing(true);
    timerRef.current = window.setTimeout(() => {
      onAdminAttempt();
      setIsPressing(false);
    }, 3000);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setIsPressing(false);
  };

  const languages: Language[] = ['EN', 'FR', 'AR'];

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allProducts
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, allProducts]);

  const handleSuggestionClick = (product: Product) => {
    handleViewProduct(product);
    setSearchTerm('');
    setIsSearchExpanded(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Long Press Secret */}
          <div 
            className={`flex-shrink-0 flex items-center cursor-pointer select-none transition-all ${isPressing ? 'scale-90 blur-[1px] opacity-70' : 'active:scale-95'} ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}
            onClick={() => setView('home')}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            <span className="text-2xl font-black tracking-tighter text-indigo-600">shopyZ</span>
          </div>

          <div className="flex items-center space-x-6 flex-1 justify-end">
            {/* Improved Live Search */}
            <div className={`relative transition-all duration-300 ${isSearchExpanded ? 'flex-1 max-w-md' : 'w-10'}`}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  className={`w-full bg-gray-50 border border-transparent rounded-full py-2 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm pr-10 ${isSearchExpanded ? 'pl-4 opacity-100' : 'pl-0 opacity-0 pointer-events-none'}`}
                />
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className={`absolute right-2 p-1.5 transition-colors rounded-full ${isSearchExpanded ? 'text-gray-400 hover:text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  {isSearchExpanded && searchTerm ? (
                    <X size={18} onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }} />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isSearchExpanded && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3">{language === 'AR' ? 'أفضل النتائج' : 'Top Matches'}</span>
                  </div>
                  {suggestions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSuggestionClick(p)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-50/50 transition-colors text-left"
                    >
                      <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100" alt="" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          <HighlightedText text={p.name} highlight={searchTerm} />
                        </p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{p.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className={`relative ${isSearchExpanded ? 'hidden sm:block' : 'block'}`}>
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-widest"
              >
                <Globe size={16} />
                {language}
                <ChevronDown size={12} className={`transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showLangDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl py-2 min-w-[80px] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-colors ${language === lang ? 'text-indigo-600' : 'text-gray-500'}`}
                    >
                      {lang === 'EN' ? 'English' : lang === 'FR' ? 'Français' : 'العربية'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={onFavoritesClick}
                className="relative text-gray-400 hover:text-rose-500 transition-colors"
              >
                <Heart size={20} />
                {likedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {likedCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setView('cart')}
                className="relative text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;