import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  setIsContactModalOpen: (open: boolean) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentTab,
  setIsLoyaltyModalOpen,
  setIsContactModalOpen,
  onOpenAuth,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-[#082016] text-white border-t border-emerald-950/80 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          
          {/* Brand info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-amber-500/40 bg-black flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Laye_Foods_Chef_Logo_08b3c5a4.png"
                  alt="Laye Foods Chef Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-2xl font-black text-white">
                  Laye <span className="text-[#F59E0B]">Foods</span>
                </span>
                <p className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
                  Good Food • Better Mood
                </p>
              </div>
            </div>

            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-sm">
              Laye Foods is Nigeria&apos;s premier kitchen bringing you authentic, piping-hot swallows, rich native soups, firewood party jollof, and charcoal suya. Built for true foodies who know good food.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-[#0C2B1E] border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs text-emerald-300">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>24/7 Kitchen Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0C2B1E] border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Halal & Clean</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Quick Links</h4>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-[#FBBF24] transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="hover:text-[#FBBF24] transition-colors"
                >
                  Full Menu & Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className="hover:text-[#FBBF24] transition-colors"
                >
                  Track Active Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsLoyaltyModalOpen(true)}
                  className="hover:text-[#FBBF24] transition-colors flex items-center gap-1.5"
                >
                  <span>Chop Club Loyalty</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Earn Points
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenAuth) {
                      onOpenAuth('signin');
                    } else {
                      setCurrentTab('auth');
                    }
                  }}
                  className="hover:text-[#FBBF24] transition-colors text-amber-300 font-medium"
                >
                  Login / Sign Up
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="hover:text-[#FBBF24] transition-colors text-stone-400 text-xs flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                  Staff Portal (Kitchen Dispatch)
                </button>
              </li>
            </ul>
          </div>

          {/* Kitchen Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Kitchen Locations</h4>
            <div className="space-y-2.5 text-xs text-emerald-200/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Victoria Island Hub</p>
                  <p>14 Karimu Kotun St, VI, Lagos</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ikeja Mainland Hub</p>
                  <p>Isaac John St, GRA Ikeja, Lagos</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Abuja Central Kitchen</p>
                  <p>Adetokunbo Ademola Cres, Wuse II</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Get In Touch</h4>
            <div className="space-y-2 text-xs text-emerald-200/80">
              <a
                href="tel:+2348022341342"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>+234 802 234 1342</span>
              </a>
              <a
                href="mailto:orders@layefoods.ng"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>orders@layefoods.ng</span>
              </a>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="text-[#FBBF24] hover:underline text-xs font-medium pt-1 block"
              >
                Event & Bulk Catering Inquiries →
              </button>
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <p className="text-[11px] text-emerald-300 mb-1.5 font-medium">
                Get weekly secret menu drops & 15% off codes:
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-[#0C2B1E] border border-emerald-800 text-xs px-3 py-2 rounded-xl text-white placeholder-emerald-500/70 focus:outline-none focus:border-[#F59E0B] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 p-2 rounded-xl font-bold transition-all"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-amber-300 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" /> You&apos;re in the Chop Club inner circle!
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <div>
            &copy; {new Date().getFullYear()} Laye Foods Nigeria Ltd. All Rights Reserved. Crafted with{' '}
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500 mx-0.5" /> for authentic Nigerian food lovers.
          </div>

          {/* Secure Payment methods */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-400 font-medium">Verified Payments:</span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
              <span className="bg-[#0C2B1E] border border-emerald-800/80 px-2 py-0.5 rounded text-sky-400">
                Paystack
              </span>
              <span className="bg-[#0C2B1E] border border-emerald-800/80 px-2 py-0.5 rounded text-amber-400">
                Mastercard
              </span>
              <span className="bg-[#0C2B1E] border border-emerald-800/80 px-2 py-0.5 rounded text-blue-400">
                Visa
              </span>
              <span className="bg-[#0C2B1E] border border-emerald-800/80 px-2 py-0.5 rounded text-teal-300">
                Verve
              </span>
              <span className="bg-[#0C2B1E] border border-emerald-800/80 px-2 py-0.5 rounded text-emerald-400">
                POS on Delivery
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
