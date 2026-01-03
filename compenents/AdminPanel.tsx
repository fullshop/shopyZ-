import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, X, Save, Package, Image as ImageIcon, DollarSign, Upload, Trash, Loader2, Info, AlertTriangle, Sparkles, PlusCircle } from 'lucide-react';
import { Product, Language } from '../types';
import { geminiService } from '../services/geminiService';

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  onClose: () => void;
  translations: any;
  language: Language;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAdd, onDelete, onUpdate, onClose, translations: t, language }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [bulkUrlInput, setBulkUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Accessories',
    description: '',
    images: [],
    stock: 10,
    rating: 4.5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      alert("Please add imagery.");
      return;
    }
    
    setIsProcessing(true);
    try {
      if (editingId) {
        await onUpdate({ ...formData, id: editingId } as Product);
        setEditingId(null);
      } else {
        await onAdd({ ...formData, id: `prod_${Date.now()}` } as Product);
      }
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIDescription = async () => {
    if (!formData.name) {
      alert("Please enter a product name first.");
      return;
    }
    
    setIsGeneratingDescription(true);
    try {
      const aiText = await geminiService.generateAIDescription(
        formData.name, 
        formData.category || 'Product', 
        language
      );
      if (aiText) {
        setFormData(prev => ({ ...prev, description: aiText }));
      }
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleAddBulkUrls = () => {
    if (!bulkUrlInput.trim()) return;
    const urls = bulkUrlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0 && (u.startsWith('http') || u.startsWith('data:image')));
    
    if (urls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
      setBulkUrlInput('');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, category: 'Accessories', description: '', images: [], stock: 10, rating: 4.5 });
    setBulkUrlInput('');
  };

  const startEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setIsAdding(true);
  };

  const processFiles = (files: FileList) => {
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveProduct = async (id: string) => {
    if (window.confirm(t.confirmDel)) {
      setIsProcessing(true);
      try {
        await onDelete(id);
      } catch (err) {
        console.error("Removal failed", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const isRTL = language === 'AR';

  return (
    <div className={`fixed inset-0 z-[120] bg-gray-50 flex flex-col overflow-hidden ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.adminTitle}</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          {isAdding ? (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl mb-12 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
              {isProcessing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
                </div>
              )}

              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <Edit3 size={24} />
                  </div>
                  <h3 className="text-2xl font-black">{editingId ? t.sync : t.addItem}</h3>
                </div>
                <button onClick={() => {setIsAdding(false); setEditingId(null); resetForm();}} className="text-gray-400 hover:text-gray-600 text-sm font-black uppercase tracking-widest border-b-2 border-transparent hover:border-gray-200 transition-all">{t.cancel}</button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.prodTitle}</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.priceDzd}</label>
                      <input 
                        required
                        type="number" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.category}</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      >
                        {['Accessories', 'Electronics', 'Apparel', 'Home Decor', 'Stationery'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.narrative}</label>
                      <button 
                        type="button"
                        onClick={handleAIDescription}
                        disabled={isGeneratingDescription || !formData.name}
                        className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors disabled:opacity-50 group"
                      >
                        {isGeneratingDescription ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} className="group-hover:animate-pulse" />
                        )}
                        {isGeneratingDescription ? t.aiGenerating : t.aiGenerate}
                      </button>
                    </div>
                    <textarea 
                      required
                      rows={5}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold resize-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.media}</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col gap-4 p-8 border-2 border-dashed rounded-[32px] transition-all relative mb-6 ${isDragging ? 'bg-indigo-50 border-indigo-600 animate-drag' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="text-center py-6">
                        <Upload size={24} className="mx-auto text-indigo-600 mb-4" />
                        <p className="text-sm font-black text-gray-900 mb-1">{t.addVisuals}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.dragImagery}</p>
                      </div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-colors">{t.browseFiles}</button>
                      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.imageUrl}</label>
                      <div className="flex flex-col gap-3">
                        <textarea 
                          value={bulkUrlInput}
                          onChange={(e) => setBulkUrlInput(e.target.value)}
                          placeholder={language === 'AR' ? 'أدخل الروابط مفصولة بفواصل أو أسطر جديدة...' : 'Enter URLs separated by commas or newlines...'}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm resize-none h-24"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddBulkUrls}
                          disabled={!bulkUrlInput.trim()}
                          className="flex items-center justify-center gap-2 bg-white text-indigo-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-all"
                        >
                          <PlusCircle size={16} />
                          {language === 'AR' ? 'إضافة الروابط' : 'Add URLs'}
                        </button>
                      </div>
                    </div>
                    
                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4 mt-8">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeImage(idx)} 
                              className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600"
                              title={t.delete}
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button type="submit" disabled={isProcessing} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95">{editingId ? t.sync : t.publish}</button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{t.inventoryList}</h3>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><Plus size={18} /> {t.addItem}</button>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-20">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="font-black text-gray-900 block text-lg">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6"><span className="font-black text-indigo-600">{product.price.toLocaleString()} DZD</span></td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => startEdit(product)} className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-100 transition-all shadow-sm"><Edit3 size={18} /></button>
                            <button onClick={() => handleRemoveProduct(product.id)} className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-xl border border-gray-100 transition-all shadow-sm"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={3} className="px-8 py-24 text-center text-gray-400 font-bold">{t.invEmpty}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;