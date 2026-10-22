import React from 'react';
import { X, Flame, ShieldCheck, Heart, Award, Sparkles, MapPin } from 'lucide-react';
import { HERO_IMAGE_URL } from '../../data/menuData';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreMenu: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onExploreMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-stone-800">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero banner */}
        <div className="relative h-48 sm:h-56 bg-[#0C2B1E] shrink-0 overflow-hidden">
          <img
            src={HERO_IMAGE_URL}
            alt="Laye Foods culinary craftsmanship"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C2B1E] via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider block">
              Our Culinary Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Playfair_Display',serif]">
              The Story of Laye Foods
            </h2>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-stone-700 leading-relaxed">
          
          <div className="space-y-3">
            <h3 className="text-base font-black text-stone-900">
              Preserving Authentic Nigerian Tastes, Delivered 24/7.
            </h3>
            <p>
              Laye Foods was founded on a simple truth: <strong>real Nigerian food cannot be rushed.</strong> True Amala requires unbleached, sun-dried yam flour whipped until it yields that distinctive, silky texture. Genuine Egusi demands real melon seeds fried in virgin palm oil and simmered with aromatic locust beans (iru) and bitterleaf. And genuine Party Jollof only tastes authentic when cooked with firewood smokiness.
            </p>
            <p>
              We established full-service 24-hour kitchen stations in Victoria Island, Ikeja GRA, and Wuse II Abuja to ensure that whether you are finishing an overtime shift in Ikoyi or hosting family in Maitama on Sunday afternoon, authentic dishes are always within 35 minutes of your doorstep.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl space-y-1">
              <Flame className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-stone-900">Firewood & Cast Iron</h4>
              <p className="text-[11px] text-stone-500">Traditional native cookware that imparts the inimitable Nigerian party aroma.</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-stone-900">100% Traceable Sourcing</h4>
              <p className="text-[11px] text-stone-500">Live catfish, fresh Oron crayfish, and organic spinach delivered fresh every morning.</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl space-y-1">
              <Award className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-stone-900">Chop Bellefull Club</h4>
              <p className="text-[11px] text-stone-500">Rewarding our regular customers with real cash discounts and free meal drops.</p>
            </div>
          </div>

          {/* Kitchen locations */}
          <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-[#FBBF24] font-bold">
              <MapPin className="w-4 h-4" />
              <span>Our Culinary Hubs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-200">
              <div>
                <strong className="text-white block">Victoria Island Hub</strong>
                14 Karimu Kotun St, VI
              </div>
              <div>
                <strong className="text-white block">Mainland Hub</strong>
                Isaac John St, GRA Ikeja
              </div>
              <div>
                <strong className="text-white block">Abuja Central Hub</strong>
                Adetokunbo Ademola, Wuse II
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <button
            onClick={() => {
              onExploreMenu();
              onClose();
            }}
            className="bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Explore Today&apos;s Menu →
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
