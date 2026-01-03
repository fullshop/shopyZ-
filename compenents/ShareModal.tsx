import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, MessageCircle, Send } from 'lucide-react';
import { Product } from '../types';

interface ShareModalProps {
  product: Product;
  onClose: () => void;
  translations: any;
}

const ShareModal: React.FC<ShareModalProps> = ({ product, onClose, translations: t }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/product/${product.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { icon: <Twitter size={20} />, name: 'Twitter', color: 'bg-[#1DA1F2]' },
    { icon: <Facebook size={20} />, name: 'Facebook', color: 'bg-[#1877F2]' },
    { icon: <MessageCircle size={20} />, name: 'WhatsApp', color: 'bg-[#25D366]' },
    { icon: <Send size={20} />, name: 'Telegram', color: 'bg-[#0088cc]' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Send size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t.shareProd}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.spreadWord} {product.name}</p>
        </div>

        {/* Social Icons */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {socialLinks.map((social) => (
            <button
              key={social.name}
              className={`flex flex-col items-center gap-2 group`}
            >
              <div className={`w-12 h-12 ${social.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transform group-hover:-translate-y-1 transition-all`}>
                {social.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{social.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t.copyLink}</p>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-4 pr-12 text-xs font-medium text-gray-500 outline-none"
            />
            <button
              onClick={handleCopy}
              className={`absolute right-1.5 p-2 rounded-lg transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {copied && (
            <p className="text-[10px] font-bold text-emerald-500 text-center animate-pulse">{t.copied}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;