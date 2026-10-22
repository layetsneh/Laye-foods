import React from 'react';
import { Heart, ShoppingBag, Flame, Clock, Star, AlertTriangle } from 'lucide-react';
import { MenuItem } from '../../types';

interface MealCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  item,
  onOpenDetails,
  onQuickAdd,
  isFavorite,
  onToggleFavorite,
}) => {
  const spiceBadges: Record<string, { label: string; color: string }> = {
    mild: { label: 'Mild', color: 'text-emerald-700 bg-emerald-50' },
    medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50' },
    hot: { label: 'Hot 🔥', color: 'text-orange-700 bg-orange-50' },
    'extra-hot': { label: 'Fiery Lagos 🔥🔥', color: 'text-red-700 bg-red-50' },
  };

  return (
    <div className="group bg-white rounded-3xl border border-stone-200/80 hover:border-[#F59E0B]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Image Container */}
      <div className="relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(item)}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-stone-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Tags badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.isPopular && (
            <span className="bg-[#0C2B1E] text-[#FBBF24] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Popular
            </span>
          )}
          {item.isChefSpecial && (
            <span className="bg-[#F59E0B] text-gray-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
              Chef Special
            </span>
          )}
        </div>

        {/* Availability overlay if out of stock */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <AlertTriangle className="w-4 h-4" /> Sold Out for Today
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${spiceBadges[item.spiceLevel]?.color}`}>
              {spiceBadges[item.spiceLevel]?.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-stone-600 font-semibold text-[11px]">
                <Clock className="w-3 h-3 text-stone-400" /> {item.prepTimeMinutes}m
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}
              </span>
            </div>
          </div>

          {/* Dish Title */}
          <h3
            onClick={() => onOpenDetails(item)}
            className="font-bold text-stone-900 group-hover:text-emerald-900 text-base leading-snug cursor-pointer line-clamp-1 transition-colors"
          >
            {item.name}
          </h3>

          {item.nativeName && (
            <p className="text-[11px] font-medium text-emerald-800 italic line-clamp-1 mt-0.5">
              {item.nativeName}
            </p>
          )}

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Dietary tags */}
        {item.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.dietaryTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Add Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">Price</span>
            <span className="text-lg font-black text-stone-900 tracking-tight">
              ₦{item.basePrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenDetails(item)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Customize
            </button>
            <button
              onClick={() => {
                if (item.isAvailable) {
                  onQuickAdd(item);
                }
              }}
              disabled={!item.isAvailable}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                item.isAvailable
                  ? 'bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] active:scale-90 shadow-md hover:shadow-lg'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title={item.isAvailable ? 'Quick Add Standard Plate' : 'Sold out'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
