import React from 'react';
import { Sparkles, Clock, Flame, ArrowRight, Star } from 'lucide-react';
import { MenuItem } from '../../types';
import { MealCard } from '../menu/MealCard';

interface FeaturedSectionProps {
  menu: MenuItem[];
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  onViewAllMenu: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  menu,
  onOpenDetails,
  onQuickAdd,
  favorites,
  onToggleFavorite,
  onViewAllMenu,
}) => {
  // Pull the 3 signature dishes from the inspiration screenshot:
  // 1. Amala & Ewedu (lf-01)
  // 2. Poundo Yam & Egusi (lf-02)
  // 3. Poundo Yam & Vegetable Efo Riro (lf-03)
  const iconicDishes = menu.filter((m) => ['lf-01', 'lf-02', 'lf-03'].includes(m.id));

  return (
    <section className="py-14 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner inspired by the user's uploaded mockup:
            "African Dishes Everytime - Now offering 24/7 Delivery" */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Accent Badge */}
            <div className="md:col-span-6 space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Original African Heritage Cooking</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-['Playfair_Display',serif]">
                AFRICAN DISHES <br />
                <span className="text-[#0C2B1E]">EVERYTIME</span>
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed max-w-md pt-1">
                Authentic Nigerian flavours cooked with patience, uncompromised native spices, and delivered piping-hot to your doorstep 24 hours a day.
              </p>
            </div>

            {/* Right 24/7 Delivery Callout */}
            <div className="md:col-span-6 flex flex-col sm:flex-row items-center justify-end gap-6 border-t md:border-t-0 md:border-l border-stone-200/80 pt-6 md:pt-0 md:pl-8">
              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-bold text-amber-600 tracking-wider block">Now Offering</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-stone-900 tracking-tighter">24/7</span>
                  <span className="text-lg font-bold text-[#0C2B1E]">Delivery</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Lagos Island, Mainland & Abuja</p>
              </div>

              <button
                onClick={onViewAllMenu}
                className="bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] px-6 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <span>Explore All Dishes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Featured Trio Grid (The exact 3 dishes featured in user screenshot) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#F59E0B] block">
                CUSTOMER FAVORITES
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-['Playfair_Display',serif]">
                Top Ranked Native Soups & Swallows
              </h3>
            </div>

            <button
              onClick={onViewAllMenu}
              className="text-xs font-bold text-[#0C2B1E] hover:text-[#164E35] flex items-center gap-1 group"
            >
              <span>View full menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {iconicDishes.map((dish) => (
              <MealCard
                key={dish.id}
                item={dish}
                onOpenDetails={onOpenDetails}
                onQuickAdd={onQuickAdd}
                isFavorite={favorites.includes(dish.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
