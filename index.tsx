import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Icons (SVGs) ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data uri
  isError?: boolean;
};

// --- App Component ---
const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize GenAI client
  // NOTE: In a real app, ensure process.env.API_KEY is available.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract pure base64 and mime type
      const mimeType = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/png";
      const data = base64String.replace(/^data:image\/\w+;base64,/, "");
      
      setSelectedImage({ data, mimeType });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: input,
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.data}` : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    const currentImage = selectedImage; // snapshot
    clearImage();
    setIsLoading(true);

    // Create a placeholder for the model response
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: "" }]);

    try {
      // Determine model based on content
      // Basic text: gemini-3-flash-preview
      // Image present: gemini-2.5-flash-image
      const modelName = currentImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

      // Prepare contents
      let contents;
      if (currentImage) {
        contents = {
          parts: [
            { inlineData: { mimeType: currentImage.mimeType, data: currentImage.data } },
            { text: input || "Describe this image." }
          ]
        };
      } else {
        contents = {
            parts: [{text: input}]
        };
      }

      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
      });

      let fullText = "";
      
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMessageId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }

    } catch (error) {
      console.error("Error generating content:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, text: "Sorry, I encountered an error. Please check your API Key and try again.", isError: true } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3 shadow-lg">
        <div className="p-2 bg-blue-600 rounded-lg">
          <BotIcon />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Gemini Assistant</h1>
          <p className="text-xs text-slate-400">Powered by gemini-3-flash & gemini-2.5-flash-image</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
              <BotIcon />
            </div>
            <p>Say hello or upload an image to start!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Image attachment in chat */}
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="User upload" 
                  className="max-w-full rounded-lg border border-slate-700 max-h-64 object-contain bg-slate-950"
                />
              )}

              {/* Text content */}
              {(msg.text || msg.isError) && (
                <div className={`px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  msg.isError 
                    ? 'bg-red-900/30 text-red-200 border border-red-800'
                    : msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4 max-w-3xl mx-auto">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
               <BotIcon />
             </div>
             <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
               <LoaderIcon />
               <span>Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block self-start group">
               <img 
                 src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                 alt="Preview" 
                 className="h-20 w-auto rounded-md border border-slate-600"
               />
               <button 
                 onClick={clearImage}
                 className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-1 hover:bg-slate-600 shadow-sm"
               >
                 <XIcon />
               </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Upload Image"
            >
              <ImageIcon />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 resize-none py-3 max-h-32 min-h-[44px]"
              rows={1}
              style={{height: 'auto', minHeight: '44px'}}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
            >
              {isLoading ? <LoaderIcon /> : <SendIcon />}
            </button>
          </div>
          <div className="text-center">
             <p className="text-[10px] text-slate-600">Gemini may display inaccurate info, including about people, so double-check its responses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
