import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Flame,
  Star,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { MenuItem, MealCategory, SpiceLevel } from '../../types';
import { MealCard } from './MealCard';

interface MenuPageProps {
  menu: MenuItem[];
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  initialCategory?: MealCategory;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  menu,
  onOpenDetails,
  onQuickAdd,
  favorites,
  onToggleFavorite,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpice, setSelectedSpice] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categories: { id: MealCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Feasts', icon: '✨' },
    { id: 'swallows-soups', label: 'Swallows & Native Soups', icon: '🍲' },
    { id: 'rice-dishes', label: 'Rice Specialties & Jollof', icon: '🍛' },
    { id: 'seafood', label: 'Seafood Bowls', icon: '🦐' },
    { id: 'grills-suya', label: 'Grills & Suya Platter', icon: '🥩' },
    { id: 'small-chops', label: 'Small Chops & Starters', icon: '🥟' },
    { id: 'drinks-beverages', label: 'Chilled Drinks & Cocktails', icon: '🍹' },
  ];

  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesNative = item.nativeName?.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.dietaryTags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesNative && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      // Spice level
      if (selectedSpice !== 'all' && item.spiceLevel !== selectedSpice) {
        return false;
      }
      // Dietary tag
      if (selectedDietary !== 'all') {
        if (!item.dietaryTags.includes(selectedDietary as any)) {
          return false;
        }
      }
      // In stock
      if (onlyInStock && !item.isAvailable) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: recommended / popularity
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, [menu, selectedCategory, searchQuery, selectedSpice, selectedDietary, onlyInStock, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in text-stone-800">
      
      {/* Top Banner */}
      <div className="bg-[#0C2B1E] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B] text-gray-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Firewood & Native Recipes</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Playfair_Display',serif]">
            The Laye Foods Menu
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Every dish is made from scratch with genuine local ingredients—fresh point-and-kill catfish, pure palm oil, Oron crayfish, and freshly pounded yam.
          </p>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                isSelected
                  ? 'bg-[#0C2B1E] text-white shadow-md scale-[1.02]'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients (e.g. catfish, egusi, peppered)..."
              className="w-full bg-stone-50 text-xs pl-10 pr-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Spice Filter */}
            <select
              value={selectedSpice}
              onChange={(e) => setSelectedSpice(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold focus:outline-none"
            >
              <option value="all">All Spice Levels</option>
              <option value="mild">Mild Only</option>
              <option value="medium">Medium Heat</option>
              <option value="hot">Lagos Hot 🔥</option>
              <option value="extra-hot">Extra Fiery 🔥🔥</option>
            </select>

            {/* Dietary Filter */}
            <select
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold focus:outline-none"
            >
              <option value="all">All Dietary</option>
              <option value="Halal">Halal</option>
              <option value="Pescatarian">Pescatarian (Fish)</option>
              <option value="Gluten-Free Swallow">Gluten-Free Swallow</option>
              <option value="Nut-Free">Nut-Free</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold focus:outline-none"
            >
              <option value="recommended">Featured / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

        </div>

        {/* Results summary and In-stock toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>
            Showing <strong>{filteredItems.length}</strong> delicious item{filteredItems.length === 1 ? '' : 's'}
          </span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded text-[#0C2B1E] focus:ring-[#0C2B1E] border-stone-300"
            />
            <span className="font-semibold text-stone-700">Available Now Only</span>
          </label>
        </div>
      </div>

      {/* Meals Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl mx-auto">
            🍲
          </div>
          <h3 className="text-lg font-bold text-stone-800">No dishes matched your criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or reset your filters to explore our full selection of soups, swallows, and grills.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSpice('all');
              setSelectedDietary('all');
              setOnlyInStock(false);
            }}
            className="mt-2 bg-[#0C2B1E] text-[#FBBF24] px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#164E35]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MealCard
              key={item.id}
              item={item}
              onOpenDetails={onOpenDetails}
              onQuickAdd={onQuickAdd}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

    </div>
  );
};
