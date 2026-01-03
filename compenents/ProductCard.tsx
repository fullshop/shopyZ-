import React, { useState } from 'react';
import { Star, ShoppingCart, ArrowRight, Share2, Heart, Loader2, Eye, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import ShareModal from './ShareModal';

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onLike: (id: string) => void;
  onView: (product: Product, scrollToReviews?: boolean) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  highlightTerm?: string;
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
          <span key={i} className="bg-indigo-100 text-indigo-700 font-black px-0.5 rounded">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isLiked, 
  onLike, 
  onView, 
  onQuickView, 
  onAddToCart,
  highlightTerm = '',
  translations: t
}) => {
  const [zoomOrigin, setZoomOrigin] = useState('center center');
  const [isHovering, setIsHovering] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Simulated like count based on ID
  const simulatedLikes = (parseInt(product.id) * 7 + 12) % 45;
  const currentLikes = isLiked ? simulatedLikes + 1 : simulatedLikes;
  const reviewCount = product.reviews?.length || 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <>
      <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        {/* Image Container */}
        <div 
          className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50"
          onClick={() => onView(product)}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setZoomOrigin('center center');
          }}
        >
          {/* Loading Spinner */}
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <Loader2 className="animate-spin text-indigo-200" size={32} />
            </div>
          )}

          <img 
            src={product.images[0]} 
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out relative z-1 ${
              isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
            style={{ 
              transformOrigin: zoomOrigin,
              transform: isHovering && isImageLoaded ? 'scale(1.15)' : 'scale(1)'
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick Add Button Overlay */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white z-10"
          >
            <ShoppingCart size={14} />
            {t.quickAdd}
          </button>

          {/* Eye Icon for Quick View */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-500 hover:text-indigo-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-10"
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Info Container */}
        <div className="p-6 relative z-20 bg-white">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{product.category}</span>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-lg">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-700">{product.rating}</span>
            </div>
          </div>
          
          <h3 
            className="text-lg font-bold text-gray-900 mb-1 truncate cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => onView(product)}
          >
            <HighlightedText text={product.name} highlight={highlightTerm} />
          </h3>
          
          <p className="text-xl font-black text-gray-900 mb-6">{product.price.toLocaleString()} DZD</p>

          {/* Social Action Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(product.id);
                }}
                className={`flex items-center gap-1.5 transition-all group/btn ${
                  isLiked ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-500'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isLiked ? 'bg-rose-50' : 'bg-gray-50 group-hover/btn:bg-rose-50'}`}>
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                </div>
                <span className="text-xs font-bold">{currentLikes}</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(product, true);
                }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-all group/btn"
              >
                <div className="p-2 bg-gray-50 group-hover/btn:bg-indigo-50 rounded-xl transition-colors">
                  <MessageCircle size={16} />
                </div>
                <span className="text-xs font-bold">{reviewCount}</span>
              </button>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
              className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title={t.share}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {isShareModalOpen && (
        <ShareModal 
          product={product} 
          onClose={() => setIsShareModalOpen(false)} 
          translations={t}
        />
      )}
    </>
  );
};

export default ProductCard;