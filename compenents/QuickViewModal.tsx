
import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Star, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart }) => {
  const [aiPitch, setAiPitch] = useState<string | null>(null);
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchPitch = async () => {
      setIsLoadingPitch(true);
      try {
        const pitch = await geminiService.generateProductPitch(product, "concise and catchy");
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
  }, [product]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
        >
          <X size={20} />
        </button>

        <div className="md:w-1/2 h-[300px] md:h-auto bg-gray-50 relative group">
          <img 
            src={product.images[activeImageIdx]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImageIdx(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setActiveImageIdx(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${activeImageIdx === i ? 'bg-indigo-600 w-3' : 'bg-gray-300'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3 mb-2">{product.name}</h2>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold text-indigo-600">{product.price.toLocaleString()} DZD</p>
              <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-500">{product.rating}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase">Quick Insight</span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">
              {isLoadingPitch ? (
                <span className="animate-pulse flex items-center gap-2 text-indigo-300">
                  Curating something special...
                </span>
              ) : (
                aiPitch || product.description
              )}
            </p>
          </div>

          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>In Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Express Shipping</span>
              </div>
            </div>

            <button 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            
            <button 
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('viewFullDetails', { detail: product }));
              }}
              className="w-full text-indigo-600 font-semibold text-sm hover:underline"
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
