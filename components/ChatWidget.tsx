import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Search, Globe, Bot } from 'lucide-react';
import { chatWithCivicAssistant, searchCivicInfo } from '../services/geminiService';
import { ChatMessage, SearchResult } from '../types';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am CivicBot. Ask me anything about reporting issues or civic safety.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'chat') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab, isOpen]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    // Format history for Gemini SDK
    const historyForSdk = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const responseText = await chatWithCivicAssistant(historyForSdk, userMsg);
    
    setChatHistory(prev => [...prev, { role: 'model', text: responseText || "Sorry, I didn't get that." }]);
    setIsChatLoading(false);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsSearchLoading(true);
    setSearchResult(null);
    
    const result = await searchCivicInfo(searchInput);
    setSearchResult(result);
    setIsSearchLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Main Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4 animate-fade-in-up" style={{ height: '500px' }}>
          
          {/* Header */}
          <div className="bg-blue-900 text-white p-4 flex justify-between items-center shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <Bot size={20} /> Civic Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-800 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 shrink-0">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <MessageCircle size={16} /> Chat
            </button>
            <button 
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Globe size={16} /> Search Web
            </button>
          </div>

          {/* Chat Content */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                         <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-2 text-xs animate-pulse">
                                Typing...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ask me anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        />
                        <button 
                            onClick={handleSendChat}
                            disabled={!chatInput.trim() || isChatLoading}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Search Content */}
          {activeTab === 'search' && (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search civic news, rules..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={!searchInput.trim() || isSearchLoading}
                            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    {isSearchLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2" />
                            <span className="text-sm">Searching web...</span>
                        </div>
                    ) : searchResult ? (
                        <div className="space-y-4">
                             <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {searchResult.text}
                             </div>
                             
                             {searchResult.sources.length > 0 && (
                                 <div className="mt-4">
                                     <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sources</p>
                                     <div className="space-y-2">
                                         {searchResult.sources.map((source, idx) => (
                                             <a 
                                                key={idx} 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="block bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded text-xs text-blue-600 truncate transition flex items-center gap-2"
                                             >
                                                <Globe size={12} className="shrink-0 text-slate-400" />
                                                {source.title || source.uri}
                                             </a>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                            <Search size={40} className="mb-2 opacity-20" />
                            <p className="text-sm">Search for local regulations, news about roadworks, or city contact info.</p>
                        </div>
                    )}
                </div>
             </div>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;