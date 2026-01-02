
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, X, Save, Package, Image as ImageIcon, DollarSign, Upload, Trash, Loader2, Info, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAdd, onDelete, onUpdate, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      alert("Please add at least one image.");
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
      alert("Error saving product to database.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, category: 'Accessories', description: '', images: [], stock: 10, rating: 4.5 });
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

  const addImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveProduct = async (id: string) => {
    if (window.confirm("Remove this product from the live catalog? This cannot be undone.")) {
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

  return (
    <div className="fixed inset-0 z-[120] bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Boutique Manager</h2>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Synchronized Collection
            </p>
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
                  <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">Updating Boutique...</p>
                </div>
              )}

              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <Edit3 size={24} />
                  </div>
                  <h3 className="text-2xl font-black">{editingId ? 'Edit Boutique Item' : 'New Collection Piece'}</h3>
                </div>
                <button onClick={() => {setIsAdding(false); setEditingId(null); resetForm();}} className="text-gray-400 hover:text-gray-600 text-sm font-black uppercase tracking-widest border-b-2 border-transparent hover:border-gray-200 transition-all">Cancel</button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Product Title</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                      placeholder="e.g. Modern Craft Bag"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Price (DZD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-4 text-gray-300" size={18} />
                        <input 
                          required
                          type="number" 
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl pl-10 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none"
                      >
                        {['Accessories', 'Electronics', 'Apparel', 'Home Decor', 'Stationery'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Narrative</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold resize-none"
                      placeholder="Tell the story of this item..."
                    />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Media</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col gap-4 p-8 border-2 border-dashed rounded-[32px] transition-all relative ${isDragging ? 'bg-indigo-50 border-indigo-600 scale-[1.02]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'}`}
                    >
                      <div className="text-center py-6">
                        <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-600 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-black text-gray-900 mb-1">Add Visuals</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Drag imagery here</p>
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 border border-indigo-100 shadow-sm transition-all">Browse Files</button>
                        <button type="button" onClick={addImageUrl} className="flex-1 bg-white text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 border border-gray-200 shadow-sm transition-all">Image URL</button>
                      </div>
                      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-6 max-h-[220px] overflow-y-auto p-2 no-scrollbar">
                      {formData.images?.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 bg-white shadow-sm">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={20} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button type="submit" disabled={isProcessing} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all disabled:opacity-50"><Save size={24} />{editingId ? 'Sync Updates' : 'Publish Product'}</button>
                    {editingId && (
                      <button type="button" onClick={() => handleRemoveProduct(editingId)} className="flex-1 bg-rose-50 text-rose-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2"><Trash2 size={16} /> Delete</button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Inventory List</h3>
                  <p className="text-gray-400 font-medium mt-1">Management for {products.length} live items</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"><Plus size={18} /> Add Item</button>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-20">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={24} /></div>}
                            </div>
                            <div>
                              <span className="font-black text-gray-900 block text-lg leading-tight">{product.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6"><span className="font-black text-indigo-600 text-lg">{product.price.toLocaleString()} DZD</span></td>
                        <td className="px-8 py-6"><span className="text-[10px] font-black bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 uppercase tracking-widest">{product.category}</span></td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => startEdit(product)} className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl shadow-sm border border-gray-100 transition-all"><Edit3 size={18} /></button>
                            <button onClick={() => handleRemoveProduct(product.id)} className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-xl shadow-sm border border-gray-100 transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-24 text-center"><div className="flex flex-col items-center gap-4"><div className="bg-gray-50 p-6 rounded-[32px] text-gray-300"><AlertTriangle size={48} /></div><p className="text-gray-400 font-black text-xl uppercase tracking-widest">Inventory is empty</p><button onClick={() => setIsAdding(true)} className="text-indigo-600 font-bold text-sm hover:underline">Start adding products</button></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center gap-4">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Info size={16} /></div>
        <p className="text-xs text-gray-400 font-medium italic">All deletions are final. Please review actions carefully.</p>
      </div>
    </div>
  );
};

export default AdminPanel;
