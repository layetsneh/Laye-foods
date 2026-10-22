import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  Clock,
  Star,
  Check,
  AlertCircle,
} from 'lucide-react';
import { MenuItem, PortionOption, ChoiceOption, AddonOption, SpiceLevel, CartItem } from '../../types';
import { sounds } from '../../services/soundEffects';

interface MealCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const MealCustomizerModal: React.FC<MealCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [selectedPortion, setSelectedPortion] = useState<PortionOption>(
    item.portions[0] || { name: 'Standard Plate', priceModifier: 0, description: '' }
  );

  const [selectedProtein, setSelectedProtein] = useState<ChoiceOption | undefined>(
    item.proteinChoices && item.proteinChoices.length > 0 ? item.proteinChoices[0] : undefined
  );

  const [selectedSwallow, setSelectedSwallow] = useState<ChoiceOption | undefined>(
    item.swallowChoices && item.swallowChoices.length > 0 ? item.swallowChoices[0] : undefined
  );

  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<SpiceLevel>(item.spiceLevel);

  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Compute unit price
  const portionExtra = selectedPortion ? selectedPortion.priceModifier : 0;
  const proteinExtra = selectedProtein ? selectedProtein.extraPrice : 0;
  const swallowExtra = selectedSwallow ? selectedSwallow.extraPrice : 0;
  const addonsExtra = selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const unitPrice = item.basePrice + portionExtra + proteinExtra + swallowExtra + addonsExtra;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: AddonOption) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleConfirmAddToCart = () => {
    sounds.playAddToCart();
    const newCartItem: CartItem = {
      cartItemId: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.basePrice,
      selectedPortion,
      selectedProtein,
      selectedSwallow,
      selectedSpiceLevel,
      selectedAddons,
      specialInstructions: specialInstructions.trim() || undefined,
      unitPrice,
      quantity,
      totalPrice,
    };
    onAddToCart(newCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with photo banner */}
        <div className="relative h-48 sm:h-56 bg-stone-900 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#F59E0B] text-gray-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {item.category.replace('-', ' ')}
              </span>
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {item.rating} ({item.reviewCount} reviews)
              </span>
              <span className="text-xs text-stone-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {item.prepTimeMinutes} mins
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{item.name}</h2>
            {item.nativeName && (
              <p className="text-xs text-[#FBBF24] font-medium italic">{item.nativeName}</p>
            )}
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          
          {/* Description & Allergens alert */}
          <div className="space-y-2">
            <p className="text-sm text-stone-600 leading-relaxed">
              {item.description}
            </p>

            {item.allergens.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Allergen Notice:</strong> Contains {item.allergens.join(', ')}.
                </div>
              </div>
            )}
          </div>

          {/* 1. Portion Size */}
          {item.portions.length > 1 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                1. Select Portion Size
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.portions.map((portion) => {
                  const isSelected = selectedPortion.name === portion.name;
                  return (
                    <button
                      key={portion.name}
                      type="button"
                      onClick={() => setSelectedPortion(portion)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0C2B1E] bg-[#0C2B1E]/5 text-[#0C2B1E] ring-2 ring-[#0C2B1E]'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{portion.name}</div>
                        {portion.description && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {portion.description}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold shrink-0 ml-2">
                        {portion.priceModifier === 0 ? 'Standard' : `+₦${portion.priceModifier.toLocaleString()}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Protein Choice */}
          {item.proteinChoices && item.proteinChoices.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                2. Choice of Protein
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.proteinChoices.map((choice) => {
                  const isSelected = selectedProtein?.name === choice.name;
                  return (
                    <button
                      key={choice.name}
                      type="button"
                      onClick={() => setSelectedProtein(choice)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-[#0C2B1E] bg-[#0C2B1E]/5 font-bold text-[#0C2B1E] ring-1 ring-[#0C2B1E]'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>{choice.name}</span>
                      <span className="font-semibold text-stone-500">
                        {choice.extraPrice === 0 ? 'Included' : `+₦${choice.extraPrice.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Swallow Selection */}
          {item.swallowChoices && item.swallowChoices.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                3. Choice of Swallow
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {item.swallowChoices.map((choice) => {
                  const isSelected = selectedSwallow?.name === choice.name;
                  return (
                    <button
                      key={choice.name}
                      type="button"
                      onClick={() => setSelectedSwallow(choice)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs ${
                        isSelected
                          ? 'border-[#0C2B1E] bg-[#0C2B1E] text-white font-bold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50'
                      }`}
                    >
                      <div className="font-bold">{choice.name}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {choice.extraPrice === 0 ? 'Included' : `+₦${choice.extraPrice}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Spice Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Pepper & Spice Heat Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mild', label: 'Mild (Normal)' },
                { id: 'medium', label: 'Medium Naija' },
                { id: 'hot', label: 'Lagos Hot 🔥' },
                { id: 'extra-hot', label: 'Extra Pepper 🔥🔥' },
              ].map((sp) => {
                const isSelected = selectedSpiceLevel === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSpiceLevel(sp.id as SpiceLevel)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50 text-orange-800 ring-2 ring-orange-500/50'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {sp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Extra Addons & Sides */}
          {item.availableAddons.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Extra Sides & Add-ons (Optional)
              </label>
              <div className="space-y-1.5">
                {item.availableAddons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                        isChecked
                          ? 'border-[#0C2B1E] bg-[#0C2B1E]/5 font-bold text-stone-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon)}
                          className="w-4 h-4 rounded text-[#0C2B1E] focus:ring-[#0C2B1E] border-stone-300"
                        />
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-semibold text-stone-600">
                        +₦{addon.price.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Kitchen Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Put soup in separate bowl, crispy fish skin..."
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
            />
          </div>

        </div>

        {/* Modal Footer with quantity & price */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Quantity stepper */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-500 uppercase">Qty:</span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart button with price */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="w-full sm:w-auto flex-1 max-w-sm bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-between shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </span>
            <span className="text-base font-black">
              ₦{totalPrice.toLocaleString()}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
