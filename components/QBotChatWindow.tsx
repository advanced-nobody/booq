import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { getOrInitQBotChat, sendMessageToQBotStream } from '../services/geminiService';
import type { Chat } from '@google/genai'; 

interface QBotChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatUiMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

export const QBotChatWindow: React.FC<QBotChatWindowProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatInstanceRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      setError(null); 
      if (!chatInstanceRef.current) {
        if (!process.env.API_KEY) {
          setError("Gemini API key is not configured. Q Bot cannot function.");
          setMessages([]);
          return;
        }
        try {
          chatInstanceRef.current = getOrInitQBotChat();
          if (messages.length === 0) {
            setMessages([
              { id: 'qbot-greeting-' + Date.now(), text: "Hi! I'm Q Bot. What kind of books would you like to discover today? For example, you can ask me for 'sci-fi books with time travel' or 'authors similar to Neil Gaiman'.", sender: 'bot' }
            ]);
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Could not start Q Bot.";
          setError(errorMessage);
          console.error("Error initializing Q Bot:", e);
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages.length]);


  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !chatInstanceRef.current) return;

    const userMessageText = inputValue.trim();
    const userMessage: ChatUiMessage = { id: 'user-' + Date.now(), text: userMessageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const botMessageId = 'bot-' + Date.now();
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot' }]);
    
    inputRef.current?.focus();

    await sendMessageToQBotStream(
      chatInstanceRef.current,
      userMessageText,
      (chunkText) => { 
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: msg.text + chunkText } : msg
          )
        );
      },
      () => { 
        setIsLoading(false);
      },
      (errMsg) => { 
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: `Sorry, an error occurred: ${errMsg}. Please try again.`, isError: true } : msg
          )
        );
        setIsLoading(false);
        setError(errMsg); 
      }
    );
  }, [inputValue, isLoading]);

  if (!isOpen) {
    return null;
  }
  
  const formatText = (text: string, sender: 'user' | 'bot') => {
    // Basic markdown bold. For user (emerald bg), strong should be white. For bot (slate bg), strong can be darker.
    const strongClass = sender === 'user' ? 'font-semibold text-white/90' : 'font-semibold text-slate-800';
    return text.replace(/\*\*(.*?)\*\*/g, `<strong class="${strongClass}">$1</strong>`);
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 mb-16 sm:mb-0 w-full sm:w-96 max-h-[70vh] sm:max-h-[500px] bg-white shadow-2xl rounded-t-lg sm:rounded-lg flex flex-col z-50 transform transition-all duration-300 ease-in-out animate-slideUp border border-slate-200">
      <header className="bg-slate-50 p-3 flex justify-between items-center rounded-t-lg sm:rounded-t-lg border-b border-slate-200">
        <h3 className="text-lg font-semibold text-emerald-600">Q Bot - Reading Assistant</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-emerald-600 transition-colors"
          aria-label="Close Q Bot chat"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-white" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-2.5 rounded-lg shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-emerald-500 text-white rounded-br-none'
                  : msg.isError 
                    ? 'bg-rose-100 text-rose-700 rounded-bl-none border border-rose-200'
                    : 'bg-slate-100 text-slate-700 rounded-bl-none border border-slate-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatText(msg.text, msg.sender) }}></p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.sender === 'user' && ( 
           <div className="flex justify-start">
             <div className="max-w-[80%] p-2.5 rounded-lg shadow-sm bg-slate-100 text-slate-700 rounded-bl-none border border-slate-200">
                <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && !messages.find(m => m.id.startsWith('bot-') && m.isError) && (
        <p className="p-2 text-xs text-center text-rose-700 bg-rose-50 border-t border-rose-200">{error}</p>
      )}

      <div className="p-3 border-t border-slate-200 bg-white rounded-b-lg sm:rounded-b-lg">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? "Q Bot is thinking..." : "Ask Q Bot..."}
            className="flex-grow p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-70 placeholder-slate-400 text-sm"
            disabled={isLoading || !!error && !process.env.API_KEY}
            aria-label="Type your message for Q Bot"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || (!!error && !process.env.API_KEY)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-md transition-colors disabled:opacity-60 flex items-center justify-center shadow-sm"
            aria-label="Send message to Q Bot"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
      <style>{`
        .animate-slideUp {
          animation: slideUpAnimation 0.3s ease-out forwards;
        }
        @keyframes slideUpAnimation {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};