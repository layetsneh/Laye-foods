import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag,
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { MenuItem, MealCategory } from '../../types';
import { HERO_IMAGE_URL } from '../../data/menuData';

interface HeroSectionProps {
  onOrderNowClick: () => void;
  onSelectCategory: (cat: MealCategory) => void;
  onOpenItem: (item: MenuItem) => void;
  featuredItems: MenuItem[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderNowClick,
  onSelectCategory,
  onOpenItem,
  featuredItems,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const heroDishes = featuredItems.slice(0, 3);
  const currentDish = heroDishes[activeSlideIndex] || featuredItems[0];

  const nextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % heroDishes.length);
  };

  const prevSlide = () => {
    setActiveSlideIndex((prev) => (prev - 1 + heroDishes.length) % heroDishes.length);
  };

  const categoryPills: { label: string; cat: MealCategory; icon: string }[] = [
    { label: 'SOUPS & SWALLOWS', cat: 'swallows-soups', icon: '🍲' },
    { label: 'RICE SPECIALTIES', cat: 'rice-dishes', icon: '🍛' },
    { label: 'SEAFOOD', cat: 'seafood', icon: '🦐' },
    { label: 'GRILLS & SUYA', cat: 'grills-suya', icon: '🥩' },
    { label: 'SMALL CHOPS', cat: 'small-chops', icon: '🥟' },
    { label: 'DRINKS', cat: 'drinks-beverages', icon: '🍹' },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0C2B1E] text-white">
      {/* Dynamic Golden accent backdrop curve inspired by user's reference mockup */}
      <div className="absolute top-0 right-0 w-full md:w-5/12 h-full bg-[#F59E0B] -skew-x-6 origin-top-right transform translate-x-12 opacity-95 pointer-events-none hidden lg:block" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Brand copy and CTA */}
          <div className="lg:col-span-7 space-y-6 z-10">
            
            {/* Top Tagline */}
            <div className="inline-flex items-center gap-2 bg-[#082016]/80 border border-[#F59E0B]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#FBBF24] tracking-wide shadow-sm">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] animate-pulse" />
              <span>Are You Hungry? Don&apos;t Wait !</span>
            </div>

            {/* Huge Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white font-['Playfair_Display',serif]">
                Let&apos;s Start to Order <br />
                <span className="text-[#FBBF24] italic">Good Food Now</span>
              </h1>
              <p className="text-emerald-100/90 text-base sm:text-lg max-w-xl font-normal leading-relaxed pt-2">
                Piping-hot pounded yam, silky amala, aromatic egusi, firewood jollof, and charcoal suya delivered straight to your doorstep across Lagos and Abuja.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOrderNowClick}
                className="group flex items-center gap-3 bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 px-7 py-3.5 rounded-2xl font-black text-base shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Check out Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (currentDish) onOpenItem(currentDish);
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                <span>Featured: ₦{currentDish?.basePrice.toLocaleString()}</span>
              </button>
            </div>

            {/* Mini carousel indicators and dishes */}
            <div className="pt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-[#FBBF24] transition-colors"
                  title="Previous featured meal"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-[#FBBF24] transition-colors"
                  title="Next featured meal"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dish thumbnails */}
              <div className="flex items-center gap-2">
                {heroDishes.map((dish, idx) => (
                  <button
                    key={dish.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      activeSlideIndex === idx
                        ? 'border-[#F59E0B] scale-110 shadow-lg'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="hidden sm:block text-xs text-emerald-200/90 pl-2">
                <span className="font-bold text-white">{currentDish?.name}</span>
                <p className="text-[11px] text-[#FBBF24]">₦{currentDish?.basePrice.toLocaleString()} • 25 mins</p>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/60 max-w-lg">
              <div>
                <p className="text-2xl font-black text-[#FBBF24]">24/7</p>
                <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">Kitchen Open</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.9 ★</p>
                <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">700+ Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FBBF24]">30m</p>
                <p className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">Avg. Delivery</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card (Inspired by user's screenshot) */}
          <div className="lg:col-span-5 relative z-10 flex justify-center">
            
            <div className="relative w-full max-w-md">
              
              {/* Rotating / glowing backdrop ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#F59E0B] via-emerald-600 to-amber-300 opacity-30 blur-xl animate-pulse" />

              {/* Main Card */}
              <div className="relative bg-[#082016] border-2 border-[#F59E0B]/50 rounded-3xl p-5 shadow-2xl overflow-hidden">
                
                {/* 24/7 Delivery badge overlay */}
                <div className="absolute top-4 right-4 z-20 bg-white text-gray-950 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 border border-amber-300">
                  <span className="text-[10px] font-bold uppercase text-amber-600">Now Offering</span>
                  <span className="text-sm font-black text-gray-900">24/7</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                    Delivery
                  </span>
                </div>

                {/* Dish Photo */}
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-black/40 group cursor-pointer"
                  onClick={() => currentDish && onOpenItem(currentDish)}
                >
                  <img
                    src={currentDish?.image || HERO_IMAGE_URL}
                    alt={currentDish?.name || 'Laye Foods Delicacy'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Floating price pill */}
                  <div className="absolute bottom-3 left-3 bg-[#0C2B1E]/95 backdrop-blur-md border border-[#F59E0B] px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-xs text-emerald-300 block font-medium">Starting from</span>
                    <span className="text-lg font-black text-[#FBBF24]">
                      ₦{currentDish?.basePrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Rating tag */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="font-bold">{currentDish?.rating}</span>
                    <span className="text-gray-400">({currentDish?.reviewCount})</span>
                  </div>
                </div>

                {/* Dish Details */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                      Authentic Nigerian Special
                    </span>
                    <span className="text-xs text-emerald-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {currentDish?.prepTimeMinutes} mins prep
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white truncate">
                    {currentDish?.name}
                  </h3>

                  <p className="text-xs text-emerald-200/80 line-clamp-2 leading-relaxed">
                    {currentDish?.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => currentDish && onOpenItem(currentDish)}
                      className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Customize & Add to Cart</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Featured Orders Horizontal Category Strip (from the user's reference mockup) */}
        <div className="mt-14 pt-8 border-t border-emerald-900/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">
                FEATURED CATEGORIES
              </h2>
            </div>
            <button
              onClick={onOrderNowClick}
              className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 group"
            >
              <span>See full menu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryPills.map((pill) => (
              <button
                key={pill.cat}
                onClick={() => onSelectCategory(pill.cat)}
                className="group p-3 rounded-2xl bg-[#082016] hover:bg-[#123e2c] border border-emerald-900/80 hover:border-[#F59E0B]/50 transition-all text-center flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {pill.icon}
                </span>
                <span className="text-[11px] font-bold text-white group-hover:text-[#FBBF24] tracking-wide">
                  {pill.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
