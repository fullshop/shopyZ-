import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Message, Product, Language } from '../types';
import { geminiService } from '../services/geminiService';

interface AIChatAssistantProps {
  products: Product[];
  language: Language;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ products, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset welcome message on language change
    const welcome = language === 'AR' 
      ? 'مرحباً بك في shopyZ الجزائر. أنا مساعدك الشخصي للتسوق. كيف يمكنني مساعدتك؟' 
      : language === 'FR' 
      ? 'Bienvenue sur shopyZ Algérie. Je suis votre assistant personnel. Comment puis-je vous aider ?'
      : 'Welcome to shopyZ Algeria. I am your personal shopping assistant. How can I help you today?';
      
    setMessages([{ id: '1', role: 'model', text: welcome }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.getChatResponse([...messages, userMsg], products, language);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      const errorMsg = language === 'AR' ? 'عذراً، واجهت مشكلة في الاتصال.' : 'Sorry, I had trouble connecting.';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 ${language === 'AR' ? 'left-6' : 'right-6'} z-50`}>
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-[350px] md:w-[400px] h-[500px] flex flex-col border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className={`flex items-center gap-2 ${language === 'AR' ? 'flex-row-reverse' : ''}`}>
              <Bot size={20} />
              <span className="font-semibold text-sm">shopyZ Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'AR' ? 'اسأل عن منتج...' : language === 'FR' ? 'Poser une question...' : 'Ask about a product...'}
                className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                dir={language === 'AR' ? 'rtl' : 'ltr'}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute ${language === 'AR' ? 'left-2' : 'right-2'} p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-all`}
              >
                <Send size={16} className={language === 'AR' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default AIChatAssistant;