
import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Star, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle } from 'lucide-react';
import { Product, Language } from '../types';
import { geminiService } from '../services/geminiService';
import ShareModal from './ShareModal';

interface QuickViewModalProps {
  product: Product;
  // Added language to props to correctly interact with geminiService
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  translations: any;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, language, onClose, onAddToCart, translations: t }) => {
  const [aiPitch, setAiPitch] = useState<string | null>(null);
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Simulated counters
  const simulatedLikes = (parseInt(product.id) * 7 + 12) % 45;
  const currentLikes = isLiked ? simulatedLikes + 1 : simulatedLikes;
  const reviewCount = product.reviews?.length || 0;

  useEffect(() => {
    const fetchPitch = async () => {
      setIsLoadingPitch(true);
      try {
        // Fix: Use the current language instead of "concise" which caused a type error
        const pitch = await geminiService.generateProductPitch(product, language);
        setAiPitch(pitch);
      } catch (err) {
        console.error("Failed to fetch AI pitch", err);
      } finally {
        setIsLoadingPitch(false);
      }
    };

    fetchPitch();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product, language]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-500 no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2 bg-white/80 backdrop-blur-md rounded-2xl text-gray-500 hover:text-indigo-600 shadow-sm transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="md:w-1/2 h-[400px] md:h-auto bg-gray-50 relative group border-r border-gray-100">
          <img 
            src={product.images[activeImageIdx]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImageIdx(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setActiveImageIdx(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-full inline-block mb-4">
              {product.category}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">{product.name}</h2>
            <div className="flex items-center gap-6">
              <p className="text-3xl font-black text-gray-900">{product.price.toLocaleString()} DZD</p>
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-xl">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-black text-yellow-700">{product.rating}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.aiInsight}</span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed font-medium relative z-10">
              {isLoadingPitch ? (
                <span className="animate-pulse flex items-center gap-2 text-indigo-300 italic">
                  {t.aiThinking}
                </span>
              ) : (
                aiPitch || product.description
              )}
            </p>
          </div>

          <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 transition-all active:scale-95 ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                >
                  <div className={`p-3 rounded-2xl ${isLiked ? 'bg-rose-50' : 'bg-gray-50'}`}>
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </div>
                  <span className="font-black text-sm">{currentLikes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <MessageCircle size={20} />
                  </div>
                  <span className="font-black text-sm">{reviewCount}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsShareOpen(true)}
                className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all active:scale-95"
              >
                <Share2 size={20} />
              </button>
            </div>

            <button 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <ShoppingCart size={24} />
              {t.addToCart}
            </button>
          </div>
        </div>
      </div>
      
      {isShareOpen && (
        <ShareModal product={product} onClose={() => setIsShareOpen(false)} translations={t} />
      )}
    </div>
  );
};

export default QuickViewModal;
