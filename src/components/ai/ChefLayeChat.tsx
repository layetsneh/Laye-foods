import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ChefHat,
  ShoppingBag,
  ExternalLink,
  Phone,
  Flame,
} from 'lucide-react';
import { askChefLaye, AssistantResponse } from '../../services/aiAssistant';
import { MenuItem, CartItem } from '../../types';
import { getStoredMenu } from '../../services/storage';
import { sounds } from '../../services/soundEffects';

interface ChefLayeChatProps {
  onOpenItemModal: (item: MenuItem) => void;
  onNavigateToTracking: (orderId?: string) => void;
  onOpenContact: () => void;
  currentOrderId?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  suggestedPrompts?: string[];
  recommendedItemId?: string;
  action?: AssistantResponse['action'];
}

export const ChefLayeChat: React.FC<ChefLayeChatProps> = ({
  onOpenItemModal,
  onNavigateToTracking,
  onOpenContact,
  currentOrderId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `Ẹ n lẹ o! Welcome to **Laye Foods**! 🍲\n\nI am **Chef Laye**, your personal Nigerian food concierge. Ask me about our rich soups, swallow combinations, allergens, live delivery status, or Chop Club points!`,
      time: 'Just now',
      suggestedPrompts: [
        'Recommend a spicy swallow & soup',
        'Track my order status',
        'What are your delivery fees?',
        'Do you have peanut-free dishes?',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menu = getStoredMenu();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    sounds.playAddToCart();

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await askChefLaye(text, currentOrderId);
      const assistantMsg: Message = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: response.suggestedPrompts,
        recommendedItemId: response.recommendedItemId,
        action: response.action,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      sounds.playNotification();
    } catch {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `My apologies, our digital kitchen assistant had a hiccup! Please call our kitchen helpline at **+234 802 234 1342** or click below to view the menu directly.`,
        time: 'Just now',
        suggestedPrompts: ['View Full Menu', 'Contact Support'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (msg: Message) => {
    if (msg.action?.type === 'TRACK_ORDER') {
      onNavigateToTracking(msg.action.payload);
      setIsOpen(false);
    } else if (msg.action?.type === 'OPEN_CONTACT') {
      onOpenContact();
      setIsOpen(false);
    } else if (msg.recommendedItemId) {
      const item = menu.find((m) => m.id === msg.recommendedItemId);
      if (item) {
        onOpenItemModal(item);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-gradient-to-r from-[#0C2B1E] to-[#123e2c] border-2 border-[#F59E0B] text-white p-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-black border border-amber-400 flex items-center justify-center shadow-md">
                <img
                  src="/assets/aistudio/Laye_Foods_Chef_Logo_08b3c5a4.png"
                  alt="Laye Foods Chef Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0C2B1E] animate-pulse" />
            </div>

            <div className="text-left hidden sm:block pr-1">
              <div className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
                Ask Chef Laye
              </div>
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>Food Guide & Help</span>
                <Sparkles className="w-3 h-3 text-[#FBBF24]" />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-fade-in text-stone-800">
          
          {/* Header */}
          <div className="bg-[#0C2B1E] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-black border border-amber-400 flex items-center justify-center shadow shrink-0">
                <img
                  src="/assets/aistudio/Laye_Foods_Chef_Logo_08b3c5a4.png"
                  alt="Laye Foods Chef"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Chef Laye</h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300">Laye Foods Concierge & Sommelier</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const recommendedItem = msg.recommendedItemId
                ? menu.find((m) => m.id === msg.recommendedItemId)
                : null;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-sm'
                        : 'bg-[#0C2B1E] text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line prose-xs">
                      {msg.text}
                    </div>

                    {/* If item recommended */}
                    {recommendedItem && (
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 bg-amber-50/60 p-2 rounded-xl">
                        <img
                          src={recommendedItem.image}
                          alt={recommendedItem.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate text-[11px]">
                            {recommendedItem.name}
                          </p>
                          <p className="text-[10px] text-amber-800 font-semibold">
                            ₦{recommendedItem.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onOpenItemModal(recommendedItem);
                            setIsOpen(false);
                          }}
                          className="bg-[#0C2B1E] text-[#FBBF24] px-2.5 py-1 rounded-lg text-[10px] font-bold shadow hover:bg-[#164E35]"
                        >
                          View Meal
                        </button>
                      </div>
                    )}

                    {/* Quick action button */}
                    {msg.action && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleAction(msg)}
                          className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 py-1.5 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>
                            {msg.action.type === 'TRACK_ORDER' ? 'Open Live Tracking Map' : 'Contact Kitchen Hotline'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-stone-400 mt-1 px-1">
                    {msg.time}
                  </span>

                  {/* Suggestion prompt chips */}
                  {msg.suggestedPrompts && (
                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-[90%]">
                      {msg.suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-[10px] bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-700 text-stone-700 px-2.5 py-1 rounded-full transition-all text-left shadow-xs"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white p-3 rounded-2xl rounded-tl-sm border border-stone-200 text-stone-500 text-xs w-24 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about soups, allergens, order #..."
                className="flex-1 bg-stone-50 border border-stone-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0C2B1E]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="bg-[#0C2B1E] hover:bg-[#164E35] disabled:opacity-50 text-[#FBBF24] p-2.5 rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
