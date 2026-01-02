
import React, { useState } from 'react';
import { Star, ShoppingCart, ArrowRight, Share2, Heart, Loader2, Eye } from 'lucide-react';
import { Product } from '../types';
import ShareModal from './ShareModal';

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onLike: (id: string) => void;
  onView: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  highlightTerm?: string;
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
  highlightTerm = ''
}) => {
  const [zoomOrigin, setZoomOrigin] = useState('center center');
  const [isHovering, setIsHovering] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div 
          className="relative aspect-square overflow-hidden cursor-zoom-in bg-gray-50"
          onClick={() => onQuickView(product)}
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
              <Loader2 className="animate-spin text-indigo-300" size={32} />
            </div>
          )}

          <img 
            src={product.images[0]} 
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ease-out relative z-1 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              transformOrigin: zoomOrigin,
              transform: isHovering && isImageLoaded ? 'scale(1.8)' : 'scale(1)'
            }}
          />
          
          <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
          
          {/* Image Count Indicator */}
          {product.images.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold z-10">
              {product.images.length} Photos
            </div>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300 z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLike(product.id);
              }}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${
                isLiked ? 'bg-rose-500 text-white' : 'bg-white/90 text-gray-500 hover:text-rose-500'
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
              title="Quick View"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
              title="Share Product"
            >
              <Share2 size={16} />
            </button>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 font-semibold text-sm hover:bg-indigo-600 hover:text-white z-10"
          >
            <ShoppingCart size={16} />
            Quick Add
          </button>
        </div>

        {/* Info Container */}
        <div className="p-5 relative z-20 bg-white">
          <div className="flex justify-between items-start mb-1">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{product.category}</p>
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-500">{product.rating}</span>
            </div>
          </div>
          <h3 
            className="text-lg font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => onView(product)}
          >
            <HighlightedText text={product.name} highlight={highlightTerm} />
          </h3>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-gray-900">{product.price.toLocaleString()} DZD</span>
            <button 
              onClick={() => onView(product)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {isShareModalOpen && (
        <ShareModal 
          product={product} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}
    </>
  );
};

export default ProductCard;
