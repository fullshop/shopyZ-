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
const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-pink-500" : ""}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data uri
  isError?: boolean;
  likes: number;
  liked: boolean;
  comments: string[];
  showComments?: boolean;
};

// --- App Component ---
const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
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

  const toggleLike = (id: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return {
          ...msg,
          liked: !msg.liked,
          likes: msg.liked ? msg.likes - 1 : msg.likes + 1
        };
      }
      return msg;
    }));
  };

  const handleShare = async (msg: Message) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gemini Chat Message',
          text: msg.text,
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(msg.text);
      alert("Text copied to clipboard!");
    }
  };

  const submitComment = (msgId: string) => {
    if (!commentInput.trim()) return;
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, comments: [...msg.comments, commentInput.trim()] };
      }
      return msg;
    }));
    setCommentInput("");
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: input,
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.data}` : undefined,
      likes: 0,
      liked: false,
      comments: []
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    const currentImage = selectedImage;
    clearImage();
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: "", likes: 0, liked: false, comments: [], showComments: false }]);

    try {
      const modelName = currentImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

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
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3 shadow-lg">
        <div className="p-2 bg-blue-600 rounded-lg">
          <BotIcon />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">Gemini Assistant</h1>
          <p className="text-xs text-slate-400">Social AI Starter</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-2 animate-pulse">
              <BotIcon />
            </div>
            <p>Ready to help. Try uploading an image!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
              {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.image && (
                <img src={msg.image} alt="Upload" className="max-w-full rounded-xl border border-slate-700 max-h-64 object-contain bg-slate-950 shadow-md" />
              )}

              {(msg.text || msg.isError) && (
                <div className={`px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm transition-all ${
                  msg.isError 
                    ? 'bg-red-900/30 text-red-200 border border-red-800'
                    : msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              )}

              {/* Social Interactions for Model messages */}
              {msg.role === 'model' && !msg.isError && msg.text && (
                <div className="flex flex-col w-full gap-3 mt-1 px-1">
                  <div className="flex items-center gap-4 text-slate-400">
                    <button 
                      onClick={() => toggleLike(msg.id)}
                      className={`flex items-center gap-1.5 hover:text-pink-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800/50 ${msg.liked ? 'text-pink-500' : ''}`}
                    >
                      <HeartIcon filled={msg.liked} />
                      <span className="text-xs font-medium">{msg.likes || ''}</span>
                    </button>
                    <button 
                      onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? {...m, showComments: !m.showComments} : m))}
                      className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800/50"
                    >
                      <MessageCircleIcon />
                      <span className="text-xs font-medium">{msg.comments.length || ''}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(msg)}
                      className="flex items-center gap-1.5 hover:text-green-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800/50"
                    >
                      <ShareIcon />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {msg.showComments && (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {msg.comments.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                          {msg.comments.map((comment, idx) => (
                            <div key={idx} className="bg-slate-700/30 p-2 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                              {comment}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={activeCommentId === msg.id ? commentInput : ""}
                          onFocus={() => setActiveCommentId(msg.id)}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submitComment(msg.id)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button 
                          onClick={() => submitComment(msg.id)}
                          disabled={!commentInput.trim() || activeCommentId !== msg.id}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <SendIcon />
                        </button>
                      </div>
                    </div>
                  )}
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
               <span className="animate-pulse">Gemini is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {selectedImage && (
            <div className="relative inline-block self-start group">
               <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} alt="Preview" className="h-20 w-auto rounded-xl border border-blue-500/50 shadow-lg" />
               <button onClick={clearImage} className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-1 hover:bg-red-500 shadow-sm transition-colors border border-slate-600">
                 <XIcon />
               </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all shadow-inner">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-xl transition-colors"
            >
              <ImageIcon />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 resize-none py-3 max-h-32 min-h-[44px]"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/40"
            >
              {isLoading ? <LoaderIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);