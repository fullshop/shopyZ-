import { BrowserRouter } from 'react-router-dom';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CheckCircle2, ShoppingBag, Mail, Lock, Heart, Truck, User, Phone, MapPin, Building, Home, Star, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Loader2, ListFilter, Share2, MessageCircle, Info, Trash } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AIChatAssistant from './components/AIChatAssistant';
import QuickViewModal from './components/QuickViewModal';
import ReviewsSection from './components/ReviewsSection';
import AdminPanel from './components/AdminPanel';
import ShareModal from './components/ShareModal';
import { PRODUCTS, CATEGORIES, WILAYAS_DATA, ALGERIAN_WILAYAS } from './constants';
import { Product, CartItem, View, Review, Language, DeliveryMethod, CheckoutData } from './types';
import { geminiService } from './services/geminiService';
import { dbService } from './services/databaseService';
import { initializeFirebase } from './firebaseConfig';

const LIKED_STORAGE_KEY = 'shopyz_liked_ids';

const translations = {
  EN: {
    home: "Home",
    catalog: "Catalog",
    heroTitle: "Find Your Perfect Style.",
    heroSubtitle: "Welcome to shopyZ. We bring quality craftsmanship to your doorstep across Algeria.",
    heroTag: "Summer 2024 Collection",
    shopNow: "Shop Now",
    backToCatalog: "Back to Catalog",
    assistantNote: "Assistant's Curated Note",
    loadingNote: "Crafting description...",
    addToCart: "Add to Cart",
    shoppingBag: "Shopping Bag",
    itemsSelected: "items selected",
    continueShopping: "Continue Shopping",
    emptyBag: "Your bag is empty",
    startShopping: "Start Shopping",
    summary: "Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    calculatedCheckout: "Calculated at checkout",
    totalPrice: "Total Price",
    checkout: "Checkout",
    personalDetails: "Customer Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    deliverySettings: "Logistics",
    wilaya: "Wilaya (Algeria)",
    deliveryType: "Delivery Type",
    homeAddress: "Exact Delivery Address",
    confirmOrder: "Confirm Order",
    autoEmail: "Automatic order via Email",
    homeDelivery: "Home",
    deskDelivery: "Stop Desk",
    deskNotice: "Your package will be delivered to the carrier's desk in your selected wilaya. You will be notified to pick it up once it arrives.",
    payable: "Total Payable",
    footerMsg: "Premium Algerian Boutique Experience.",
    authOnly: "Authorized Only",
    inventoryControl: "Store inventory control",
    unlockPortal: "Unlock Portal",
    sortBy: "Sort By",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
    rating: "Top Rated",
    defaultSort: "Default",
    reviewsCount: "Reviews",
    share: "Share",
    favorites: "Favorites",
    comment: "Comment",
    quickAdd: "Quick Add",
    aiInsight: "AI Insight",
    aiThinking: "Curating boutique perspective...",
    customerReviews: "Customer Reviews",
    reviewSub: "What our community thinks about this piece.",
    writeReview: "Write a Review",
    cancel: "Cancel",
    shareExp: "Share your experience",
    yourName: "Your Name",
    commentLabel: "Comment",
    submitReview: "Submit Review",
    noReviews: "No reviews yet. Be the first to share!",
    helpful: "Helpful",
    verified: "Verified Buyer",
    shareProd: "Share Product",
    spreadWord: "Spread the word about",
    copyLink: "Copy Link",
    copied: "Link copied!",
    adminTitle: "Boutique Manager",
    inventoryList: "Inventory List",
    addItem: "Add Item",
    prodTitle: "Product Title",
    priceDzd: "Price (DZD)",
    category: "Category",
    narrative: "Narrative",
    media: "Media",
    addVisuals: "Add Visuals",
    dragImagery: "Drag imagery here",
    browseFiles: "Browse Files",
    imageUrl: "Image URL",
    publish: "Publish Product",
    sync: "Sync Updates",
    delete: "Delete",
    confirmDel: "Remove this product from the catalog?",
    invEmpty: "Inventory is empty",
    searchPlaceholder: "Search products...",
    aiGenerate: "AI Generate",
    aiGenerating: "Generating...",
    clearCart: "Clear Bag",
    confirmClear: "Empty all items from your bag?"
  },
  FR: {
    home: "Accueil",
    catalog: "Catalogue",
    heroTitle: "Trouvez Votre Style Parfait.",
    heroSubtitle: "Bienvenue sur shopyZ. Nous apportons l'artisanat de qualité à votre porte partout en Algérie.",
    heroTag: "Collection Été 2024",
    shopNow: "Acheter Maintenant",
    backToCatalog: "Retour au Catalogue",
    assistantNote: "Note du Conservateur",
    loadingNote: "Rédaction...",
    addToCart: "Ajouter au Panier",
    shoppingBag: "Panier",
    itemsSelected: "articles sélectionnés",
    continueShopping: "Continuer mes achats",
    emptyBag: "Votre panier est vide",
    startShopping: "Commencer mes achats",
    summary: "Résumé",
    subtotal: "Sous-total",
    shipping: "Livraison",
    calculatedCheckout: "Calculé à la caisse",
    totalPrice: "Prix Total",
    checkout: "Paiement",
    personalDetails: "Informations Client",
    fullName: "Nom Complet",
    phoneNumber: "Numéro de Téléphone",
    deliverySettings: "Logistique",
    wilaya: "Wilaya (Algérie)",
    deliveryType: "Type de Livraison",
    homeAddress: "Adresse de Livraison Exacte",
    confirmOrder: "Confirmer la Commande",
    autoEmail: "Commande automatique via Email",
    homeDelivery: "Domicile",
    deskDelivery: "Stop Desk",
    deskNotice: "Votre colis sera livré au bureau du transporteur dans la wilaya sélectionnée. Vous serez averti pour le récupérer à son arrivée.",
    payable: "Total à Payer",
    footerMsg: "Expérience Boutique Algérienne Premium.",
    authOnly: "Accès Autorisé",
    inventoryControl: "Contrôle de l'inventaire",
    unlockPortal: "Déverrouiller le Portail",
    sortBy: "Trier Par",
    priceLow: "Prix: Croissant",
    priceHigh: "Prix: Décroissant",
    rating: "Mieux Notés",
    defaultSort: "Par défaut",
    reviewsCount: "Avis",
    share: "Partager",
    favorites: "Favoris",
    comment: "Commenter",
    quickAdd: "Ajout Rapide",
    aiInsight: "Aperçu IA",
    aiThinking: "Rédaction de la perspective boutique...",
    customerReviews: "Avis Clients",
    reviewSub: "Ce que notre communauté pense de cette pièce.",
    writeReview: "Écrire un Avis",
    cancel: "Annuler",
    shareExp: "Partagez votre expérience",
    yourName: "Votre Nom",
    commentLabel: "Commentaire",
    submitReview: "Envoyer l'Avis",
    noReviews: "Aucun avis pour l'instant. Soyez le premier !",
    helpful: "Utile",
    verified: "Acheteur Vérifié",
    shareProd: "Partager le Produit",
    spreadWord: "Passez le mot sur",
    copyLink: "Copier le Lien",
    copied: "Lien copié !",
    adminTitle: "Gestionnaire de Boutique",
    inventoryList: "Liste d'Inventaire",
    addItem: "Ajouter un Article",
    prodTitle: "Titre du Produit",
    priceDzd: "Prix (DZD)",
    category: "Catégorie",
    narrative: "Narration",
    media: "Médias",
    addVisuals: "Ajouter des Visuels",
    dragImagery: "Glissez les images ici",
    browseFiles: "Parcourir",
    imageUrl: "URL de l'image",
    publish: "Publier le Produit",
    sync: "Synchroniser",
    delete: "Supprimer",
    confirmDel: "Supprimer ce produit du catalogue ?",
    invEmpty: "L'inventaire est vide",
    searchPlaceholder: "Rechercher...",
    aiGenerate: "Générer par IA",
    aiGenerating: "Génération...",
    clearCart: "Vider le Panier",
    confirmClear: "Voulez-vous vider tout le panier ?"
  },
  AR: {
    home: "الرئيسية",
    catalog: "كتالوج",
    heroTitle: "اكتشف أسلوبك المثالي.",
    heroSubtitle: "مرحبًا بك في shopyZ. نوفر لك الجودة العالية حتى باب منزلك في جميع أنحاء الجزائر.",
    heroTag: "مجموعة صيف 2024",
    shopNow: "تسوق الآن",
    backToCatalog: "العودة إلى الكتالوج",
    assistantNote: "ملاحظة المساعد",
    loadingNote: "جاري الصياغة...",
    addToCart: "أضف إلى السلة",
    shoppingBag: "حقيبة التسوق",
    itemsSelected: "منتجات مختارة",
    continueShopping: "مواصلة التسوق",
    emptyBag: "حقيبتك فارغة",
    startShopping: "ابدأ التسوق",
    summary: "الملخص",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    calculatedCheckout: "يتم حسابه عند الدفع",
    totalPrice: "السعر الإجمالي",
    checkout: "الدفع",
    personalDetails: "بيانات العميل",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    deliverySettings: "الشحن واللوجستيات",
    wilaya: "الولاية (الجزائر)",
    deliveryType: "نوع التوصيل",
    homeAddress: "عنوان التوصيل الدقيق",
    confirmOrder: "تأكيد الطلب",
    autoEmail: "طلب تلقائي عبر البريد",
    homeDelivery: "للمنزل",
    deskDelivery: "توصيل للمكتب (Stop Desk)",
    deskNotice: "سيتم توصيل طلبك إلى مكتب شركة الشحن في الولاية المختارة. سيتم إخطارك لاستلامه فور وصوله.",
    payable: "إجمالي الدفع",
    footerMsg: "تجربة تسوق جزائرية فاخرة.",
    authOnly: "للمصرح لهم فقط",
    inventoryControl: "التحكم في المخزون",
    unlockPortal: "فتح البوابة",
    sortBy: "ترتيب حسب",
    priceLow: "السعر: من الأقل للأعلى",
    priceHigh: "السعر: من الأعلى للأقل",
    rating: "الأعلى تقييماً",
    defaultSort: "الافتراضي",
    reviewsCount: "تقييمات",
    share: "مشاركة",
    favorites: "المفضلة",
    comment: "تعليق",
    quickAdd: "إضافة سريعة",
    aiInsight: "رؤية الذكاء الاصطناعي",
    aiThinking: "جاري صياغة وصف المتجر...",
    customerReviews: "تقييمات العملاء",
    reviewSub: "ماذا يقول مجتمعنا عن هذه القطعة.",
    writeReview: "اكتب تقييماً",
    cancel: "إلغاء",
    shareExp: "شاركنا تجربتك",
    yourName: "اسمك",
    commentLabel: "التعليق",
    submitReview: "إرسال التقييم",
    noReviews: "لا توجد تقييمات بعد. كن أول من يشارك!",
    helpful: "مفيد",
    verified: "مشتري مؤكد",
    shareProd: "مشاركة المنتج",
    spreadWord: "انشر الخبر عن",
    copyLink: "نسخ الرابط",
    copied: "تم نسخ الرابط!",
    adminTitle: "مدير المتجر",
    inventoryList: "قائمة المخزون",
    addItem: "إضافة منتج",
    prodTitle: "اسم المنتج",
    priceDzd: "السعر (دج)",
    category: "الفئة",
    narrative: "الوصف السردي",
    media: "الصور والوسائط",
    addVisuals: "إضافة صور",
    dragImagery: "اسحب الصور هنا",
    browseFiles: "تصفح الملفات",
    imageUrl: "رابط صورة",
    publish: "نشر المنتج",
    sync: "مزامنة التحديثات",
    delete: "حذف",
    confirmDel: "هل تريد إزالة هذا المنتج من المتجر؟",
    invEmpty: "المخزون فارغ",
    searchPlaceholder: "البحث عن منتجات...",
    aiGenerate: "توليد بالذكاء الاصطناعي",
    aiGenerating: "جاري التوليد...",
    clearCart: "إفراغ السلة",
    confirmClear: "هل تريد إفراغ جميع المنتجات من الحقيبة؟"
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('default');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const reviewsRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const isRTL = language === 'AR';

  useEffect(() => {
    const stored = localStorage.getItem(LIKED_STORAGE_KEY);
    if (stored) {
      try {
        setLikedIds(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to load likes", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(likedIds)));
  }, [likedIds]);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingProducts(true);
        initializeFirebase();
        
        const data = await dbService.fetchProducts();
        const alreadySeeded = await dbService.isSeeded();

        if (data.length === 0 && !alreadySeeded) {
          setProductsData(PRODUCTS);
          for (const p of PRODUCTS) {
            await dbService.addProduct(p);
          }
          await dbService.markAsSeeded();
        } else {
          setProductsData(data);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    init();
  }, []);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  const [activeCategory, setActiveCategory] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [aiPitch, setAiPitch] = useState<string | null>(null);
  const [isPitchLoading, setIsPitchLoading] = useState(false);
  const [activeProductImageIdx, setActiveProductImageIdx] = useState(0);

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    fullName: '',
    phone: '',
    homeAddress: '',
    wilaya: ALGERIAN_WILAYAS[15],
    deliveryMethod: 'home'
  });

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const likedCount = likedIds.size;
  
  const deliveryCost = useMemo(() => {
    const wilayaRates = WILAYAS_DATA[checkoutData.wilaya];
    if (!wilayaRates) return 0;
    return checkoutData.deliveryMethod === 'home' ? wilayaRates.home : wilayaRates.desk;
  }, [checkoutData.wilaya, checkoutData.deliveryMethod]);

  const handleAdminAttempt = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowAdminLogin(true);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === '12346') {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setView('admin');
      setAdminPass('');
    } else {
      alert('Incorrect Password');
      setAdminPass('');
    }
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addProduct = async (p: Product) => {
    await dbService.addProduct(p);
    setProductsData(prev => [p, ...prev]);
  };

  const deleteProduct = async (id: string) => {
    await dbService.deleteProduct(id);
    setProductsData(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = async (p: Product) => {
    await dbService.updateProduct(p);
    setProductsData(prev => prev.map(item => item.id === p.id ? p : item));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const handleClearCart = () => {
    if (window.confirm(t.confirmClear)) {
      setCart([]);
    }
  };

  const handleViewProduct = async (product: Product, scrollToReviews: boolean = false) => {
    const freshProduct = productsData.find(p => p.id === product.id) || product;
    setSelectedProduct(freshProduct);
    setQuickViewProduct(null);
    setAiPitch(null);
    setActiveProductImageIdx(0);
    setView('product');
    
    if (scrollToReviews) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    setIsPitchLoading(true);
    try {
      const pitch = await geminiService.generateProductPitch(freshProduct, language);
      setAiPitch(pitch);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPitchLoading(false);
    }
  };

  const handleCompleteOrder = () => {
    const { fullName, phone, homeAddress, wilaya, deliveryMethod } = checkoutData;
    if (!fullName || !phone || (deliveryMethod === 'home' && !homeAddress)) {
      alert(language === 'AR' ? 'يرجى ملء جميع المعلومات المطلوبة.' : 'Please fill in all mandatory information.');
      return;
    }
    const itemDetails = cart.map(item => `- ${item.name} (x${item.quantity}) @ ${item.price.toLocaleString()} DZD`).join('\n');
    const body = `New Order from shopyZ\n\nCustomer Details:\n------------------\nName: ${fullName}\nPhone: ${phone}\nWilaya: ${wilaya}\nDelivery Type: ${deliveryMethod === 'home' ? 'Domicile' : 'Stop Desk'}\n${deliveryMethod === 'home' ? `Address: ${homeAddress}\n` : ''}\nOrder Summary:\n------------------\n${itemDetails}\n\nSubtotal: ${cartSubtotal.toLocaleString()} DZD\nDelivery Cost: ${deliveryCost.toLocaleString()} DZD\nTotal: ${(cartSubtotal + deliveryCost).toLocaleString()} DZD`;
    window.location.href = `mailto:ordershopyz@gmail.com?subject=shopyZ Order: ${fullName}&body=${encodeURIComponent(body)}`;
    alert(language === 'AR' ? `الطلب جاهز! يرجى إرسال البريد الإلكتروني لإتمام العملية.` : `Order for ${fullName} is ready! Please check your mail app to send.`);
    setCart([]);
    setView('home');
  };

  const processedProducts = useMemo(() => {
    let result = productsData.filter(p => {
      const catMatch = activeCategory === 'All' || p.category === activeCategory;
      const favMatch = !showFavoritesOnly || likedIds.has(p.id);
      const ratingMatch = p.rating >= minRating;
      const searchMatch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return catMatch && favMatch && ratingMatch && searchMatch;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeCategory, minRating, productsData, searchTerm, sortBy, showFavoritesOnly, likedIds]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#FDFDFD] ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar 
        setView={setView} 
        cartCount={cartCount} 
        likedCount={likedCount}
        onAdminAttempt={handleAdminAttempt}
        language={language}
        setLanguage={setLanguage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        allProducts={productsData}
        handleViewProduct={handleViewProduct}
        onFavoritesClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setView('home'); }}
        translations={t}
      />
      
      <main className="flex-1">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative rounded-[40px] overflow-hidden bg-indigo-900 text-white p-12 md:p-24 mb-16 shadow-2xl">
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">{t.heroTag}</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                  {t.heroTitle}
                </h1>
                <p className="text-xl text-indigo-100 mb-10 leading-relaxed font-medium">
                  {t.heroSubtitle}
                </p>
                <button onClick={() => setView('home')} className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl shadow-black/20">{t.shopNow}</button>
              </div>
              <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-1/2 h-full opacity-30 pointer-events-none`}>
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
              </div>
            </div>

            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFavoritesOnly(false); }}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                      activeCategory === cat && !showFavoritesOnly ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
                    showFavoritesOnly ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100' : 'bg-white text-gray-400 border-gray-100 hover:border-rose-200'
                  }`}
                >
                  <Heart size={14} fill={showFavoritesOnly ? "currentColor" : "none"} />
                  {t.favorites.toUpperCase()}
                </button>
              </div>

              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                <ListFilter size={16} className="text-gray-400" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-600 outline-none pr-4 cursor-pointer"
                >
                  <option value="default">{t.defaultSort}</option>
                  <option value="price-low">{t.priceLow}</option>
                  <option value="price-high">{t.priceHigh}</option>
                  <option value="rating">{t.rating}</option>
                </select>
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Boutique...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {processedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isLiked={likedIds.has(product.id)}
                    onLike={toggleLike}
                    onView={handleViewProduct} 
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={addToCart}
                    highlightTerm={searchTerm}
                    translations={t}
                  />
                ))}
                {processedProducts.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-400 font-bold text-xl italic">
                      {showFavoritesOnly ? "No favorites yet." : "No matches found."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'product' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button 
              onClick={() => setView('home')}
              className={`flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-widest mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} /> {t.backToCatalog}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="flex flex-col gap-6">
                <div className="aspect-square rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
                  <img src={selectedProduct.images[activeProductImageIdx]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  {selectedProduct.images.length > 1 && (
                    <>
                      <button onClick={() => setActiveProductImageIdx(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={() => setActiveProductImageIdx(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">{selectedProduct.category}</span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">{selectedProduct.name}</h1>
                <div className={`flex items-center gap-6 mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-4xl font-black text-gray-900">{selectedProduct.price.toLocaleString()} DZD</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-700">{selectedProduct.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mb-8 relative overflow-hidden group">
                  <div className={`flex items-center gap-2 mb-3 text-indigo-600 ${isRTL ? 'flex-row-reverse text-right' : ''}`}><Sparkles size={18} /><span className="text-[10px] font-black uppercase tracking-widest">{t.assistantNote}</span></div>
                  <div className={`text-gray-700 font-medium leading-relaxed italic relative z-10 ${isRTL ? 'text-right' : ''}`}>
                    {isPitchLoading ? t.loadingNote : (aiPitch || selectedProduct.description)}
                  </div>
                </div>
                <p className={`text-gray-500 text-lg leading-relaxed mb-10 font-medium ${isRTL ? 'text-right' : ''}`}>{selectedProduct.description}</p>
                
                {/* Social Actions and Cart Row */}
                <div className="flex flex-col gap-6 mb-10">
                  <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95">
                      <ShoppingBag size={24} /> {t.addToCart}
                    </button>
                  </div>
                  
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button 
                      onClick={() => toggleLike(selectedProduct.id)}
                      className={`flex-1 py-4 px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest ${
                        likedIds.has(selectedProduct.id) 
                        ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-rose-200 hover:text-rose-500'
                      }`}
                    >
                      <Heart size={18} fill={likedIds.has(selectedProduct.id) ? "currentColor" : "none"} />
                      {t.favorites}
                    </button>
                    
                    <button 
                      onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-1 py-4 px-6 rounded-2xl bg-white border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      {t.comment}
                    </button>
                    
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div ref={reviewsRef}>
              <ReviewsSection translations={t} reviews={selectedProduct.reviews || []} onAddReview={(newR) => {
                const updatedProduct: Product = { ...selectedProduct, reviews: [...(selectedProduct.reviews || []), { ...newR, id: Date.now().toString(), date: new Date().toISOString(), isVerified: false }] };
                updateProduct(updatedProduct);
                setSelectedProduct(updatedProduct);
              }} />
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div>
                <h2 className={`text-4xl font-black text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>{t.shoppingBag}</h2>
                <p className={`text-gray-400 font-medium ${isRTL ? 'text-right' : ''}`}>{cartCount} {t.itemsSelected}</p>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                >
                  <Trash size={16} />
                  {t.clearCart}
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200"><ShoppingBag className="mx-auto text-gray-200 mb-6" size={64} /><h3 className="text-2xl font-bold text-gray-400 mb-4">{t.emptyBag}</h3><button onClick={() => setView('home')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100">{t.startShopping}</button></div>
            ) : (
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 ${isRTL ? 'direction-rtl' : ''}`}>
                <div className="lg:col-span-2 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className={`bg-white p-6 rounded-3xl border border-gray-100 flex gap-6 items-center group ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100"><img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1"><h4 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h4><p className="text-lg font-black text-gray-900">{item.price.toLocaleString()} DZD</p></div>
                      <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className={`bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm ${isRTL ? 'text-right' : ''}`}>
                    <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">{t.summary}</h3>
                    <div className="space-y-4 mb-8">
                      <div className={`flex justify-between text-gray-400 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}><span>{t.subtotal}</span><span className="text-gray-900 font-bold">{cartSubtotal.toLocaleString()} DZD</span></div>
                    </div>
                    <button onClick={() => setView('checkout')} className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 ${isRTL ? 'flex-row-reverse' : ''}`}>{t.checkout} <ArrowLeft size={18} className={isRTL ? '' : 'rotate-180'} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'checkout' && (
          <div className={`max-w-6xl mx-auto px-4 py-16 ${isRTL ? 'text-right' : ''}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 ${isRTL ? 'direction-rtl' : ''}`}>
              <div className="lg:col-span-3 space-y-8">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                  <h2 className={`text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><User className="text-indigo-600" /> {t.personalDetails}</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.fullName}</label>
                      <input required type="text" value={checkoutData.fullName} onChange={e => setCheckoutData(prev => ({...prev, fullName: e.target.value}))} className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.phoneNumber}</label>
                      <input required type="tel" value={checkoutData.phone} onChange={e => setCheckoutData(prev => ({...prev, phone: e.target.value}))} className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold" />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-50 space-y-6">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{t.deliverySettings}</h3>
                      
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.wilaya}</label>
                        <select 
                          value={checkoutData.wilaya} 
                          onChange={e => setCheckoutData(prev => ({...prev, wilaya: e.target.value}))}
                          className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold appearance-none cursor-pointer"
                        >
                          {ALGERIAN_WILAYAS.map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t.deliveryType}</label>
                        <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-2">
                          <button 
                            onClick={() => setCheckoutData(prev => ({...prev, deliveryMethod: 'home'}))}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${checkoutData.deliveryMethod === 'home' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {t.homeDelivery.toUpperCase()}
                          </button>
                          <button 
                            onClick={() => setCheckoutData(prev => ({...prev, deliveryMethod: 'desk'}))}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${checkoutData.deliveryMethod === 'desk' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {t.deskDelivery.toUpperCase()}
                          </button>
                        </div>
                      </div>

                      {checkoutData.deliveryMethod === 'home' ? (
                        <div className="animate-in slide-in-from-top-4 duration-300">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.homeAddress}</label>
                          <textarea required rows={3} value={checkoutData.homeAddress} onChange={e => setCheckoutData(prev => ({...prev, homeAddress: e.target.value}))} className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold resize-none" placeholder="Ex: Cité 123 logts, Bat 4, N° 12..." />
                        </div>
                      ) : (
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4 items-start animate-in slide-in-from-top-4 duration-300">
                          <Info className="text-indigo-600 flex-shrink-0" size={20} />
                          <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                            {t.deskNotice}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-indigo-900 text-white p-10 rounded-[40px] shadow-2xl sticky top-24">
                  <h2 className="text-xl font-black mb-8 uppercase tracking-widest">{t.summary}</h2>
                  <div className="space-y-4 mb-10">
                    <div className={`flex justify-between text-indigo-200 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t.subtotal}</span>
                      <span className="text-white">{cartSubtotal.toLocaleString()} DZD</span>
                    </div>
                    <div className={`flex justify-between text-indigo-200 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t.shipping} ({checkoutData.deliveryMethod === 'home' ? t.homeDelivery : t.deskDelivery})</span>
                      <span className="text-white">{deliveryCost.toLocaleString()} DZD</span>
                    </div>
                    <div className={`pt-6 border-t border-white/10 flex justify-between items-end ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-lg font-bold">{t.payable}</span>
                      <span className="text-3xl font-black">{(cartSubtotal + deliveryCost).toLocaleString()} DZD</span>
                    </div>
                  </div>
                  <button onClick={handleCompleteOrder} className={`w-full bg-white text-indigo-900 py-5 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 ${isRTL ? 'flex-row-reverse' : ''}`}><Truck size={24} /> {t.confirmOrder}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAdminAuthenticated && (
          <AdminPanel 
            products={productsData} 
            onAdd={addProduct} 
            onDelete={deleteProduct} 
            onUpdate={updateProduct} 
            onClose={() => setView('home')} 
            translations={t} 
            language={language}
          />
        )}
      </main>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowAdminLogin(false)} />
          <div className="relative bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <h2 className="text-3xl font-black text-center">{t.authOnly}</h2>
              <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-5 outline-none text-center text-3xl font-black" placeholder="•••••" />
              <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg">Unlock</button>
            </form>
          </div>
        </div>
      )}

      <AIChatAssistant products={productsData} language={language} />
      {/* Fixed: Pass the current language to QuickViewModal to fulfill its updated props */}
      {quickViewProduct && <QuickViewModal product={quickViewProduct} language={language} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} translations={t} />}
      {isShareModalOpen && selectedProduct && (
        <ShareModal product={selectedProduct} onClose={() => setIsShareModalOpen(false)} translations={t} />
      )}
    </div>
  );
};

export default App;
