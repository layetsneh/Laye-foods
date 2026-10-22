import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import {
  saveStoredContactMessages,
  getStoredContactMessages,
  triggerPushNotification,
} from '../../services/storage';
import { sounds } from '../../services/soundEffects';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Party & Event Catering (50+ packs)');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How fast is your delivery across Lagos and Abuja?',
      a: 'Average delivery time is 25-45 minutes depending on your zone. Orders for Victoria Island, Lekki 1, and Ikeja GRA are typically delivered in under 35 minutes.',
    },
    {
      q: 'Do you deliver 24 hours a day?',
      a: 'Yes! Our kitchen stations in Victoria Island, Ikeja, and Wuse II Abuja run 24 hours a day, 7 days a week, including midnight and early morning breakfast orders.',
    },
    {
      q: 'Can I pay on delivery with cash or card?',
      a: 'Yes, our dispatch riders carry wireless POS terminals so you can tap your debit card (Mastercard/Visa/Verve) or hand over cash upon receiving your food.',
    },
    {
      q: 'Do you offer bulk catering for weddings and corporate meetings?',
      a: 'Yes! We deliver custom branded meal boxes of Jollof, Asun, Small Chops, and Swallows for groups from 20 to 1,500 people. Fill out this form for immediate pricing.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    sounds.playAddToCart();
    const newMsg = {
      id: 'msg-' + Date.now(),
      name,
      email,
      phone: phone || '+234 Not specified',
      subject,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      replyStatus: 'pending' as const,
    };

    const existing = getStoredContactMessages();
    saveStoredContactMessages([newMsg, ...existing]);

    triggerPushNotification(
      'Message Received by Laye Foods',
      'Our kitchen manager will review your inquiry shortly.',
      'system'
    );

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-stone-800">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#0C2B1E] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F59E0B] text-gray-950 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Contact & Catering Inquiries</h2>
              <p className="text-xs text-emerald-300">24/7 Kitchen Desk • Bulk Orders & Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
              <Phone className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="font-bold text-stone-900">Phone Hotline</h4>
              <p className="text-emerald-800 font-bold text-[11px]">+234 802 234 1342</p>
              <p className="text-stone-500 text-[11px]">WhatsApp & Direct Call</p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
              <Mail className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="font-bold text-stone-900">Direct Email</h4>
              <p className="text-stone-500 text-[11px]">orders@layefoods.ng</p>
              <p className="text-stone-500 text-[11px]">catering@layefoods.ng</p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="font-bold text-stone-900">Operating Hours</h4>
              <p className="text-emerald-800 font-bold text-[11px]">Open 24/7 (All Days)</p>
              <p className="text-stone-500 text-[11px]">Night dispatch active</p>
            </div>
          </div>

          {/* Form or Success */}
          {isSubmitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-emerald-950">Thank you! Message Sent</h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                We have received your message. Our culinary desk will contact you via email or phone within 15 minutes!
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 bg-[#0C2B1E] text-[#FBBF24] px-4 py-2 rounded-xl text-xs font-bold"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 bg-stone-50 p-4 rounded-3xl border border-stone-200">
              <h3 className="font-black text-stone-900 text-sm">Send us a direct message</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number (e.g. +234 803...)"
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="Party & Event Catering (50+ packs)">Party & Event Catering</option>
                  <option value="Corporate Daily Office Lunches">Corporate Office Lunches</option>
                  <option value="Order Question / Special Diet">Order Question / Dietary Request</option>
                  <option value="Feedback / Compliment to the Chef">Compliment to the Chef</option>
                </select>
              </div>

              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your event date, number of people, or your question..."
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
              />

              <button
                type="submit"
                className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}

          {/* Frequently Asked Questions */}
          <div className="space-y-3 pt-2">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpenFaq = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-stone-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpenFaq ? null : idx)}
                      className="w-full p-3 text-left font-bold text-stone-800 bg-white hover:bg-stone-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform ${
                          isOpenFaq ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpenFaq && (
                      <div className="p-3 bg-stone-50 text-[11px] text-stone-600 border-t border-stone-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 text-white rounded-xl font-bold text-xs hover:bg-black"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
