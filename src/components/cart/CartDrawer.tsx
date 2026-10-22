import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { CartItem, UserProfile, DeliveryZone } from '../../types';
import { VALID_PROMO_CODES } from '../../data/loyaltyRewards';
import { DELIVERY_ZONES } from '../../data/menuData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  user: UserProfile;
  selectedZone: DeliveryZone;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: { code: string; discount: number; description: string } | null;
  setAppliedPromo: (promo: { code: string; discount: number; description: string } | null) => void;
  useLoyaltyPoints: boolean;
  setUseLoyaltyPoints: (use: boolean) => void;
  loyaltyPointsToUse: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  user,
  selectedZone,
  promoCode,
  setPromoCode,
  appliedPromo,
  setAppliedPromo,
  useLoyaltyPoints,
  setUseLoyaltyPoints,
  loyaltyPointsToUse,
}) => {
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Delivery fee from selected zone
  const zoneInfo = DELIVERY_ZONES.find((z) => z.zone === selectedZone);
  let deliveryFee = zoneInfo ? zoneInfo.fee : 1500;

  // Calculate promo discount
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.code === 'LAYEFIRST') {
      promoDiscount = Math.round((subtotal * 10) / 100);
    } else {
      promoDiscount = appliedPromo.discount;
    }
  }

  // Loyalty points discount (100 points = ₦500 off)
  const loyaltyDiscount = useLoyaltyPoints ? Math.floor(loyaltyPointsToUse / 100) * 500 : 0;

  const total = Math.max(0, subtotal + deliveryFee - promoDiscount - loyaltyDiscount);

  // Earn 10 points per ₦1000 spent
  const pointsToEarn = Math.floor(total / 1000) * 10;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const promo = VALID_PROMO_CODES[code];
    if (!promo) {
      setPromoError('Invalid coupon code. Try LAYEFIRST or CHOPBELLEFULL');
      return;
    }

    if (subtotal < promo.minSubtotal) {
      setPromoError(`Minimum order of ₦${promo.minSubtotal.toLocaleString()} required for this code.`);
      return;
    }

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.round((subtotal * promo.value) / 100);
    } else if (promo.type === 'fixed') {
      discount = promo.value;
    } else if (promo.type === 'free_shipping') {
      discount = deliveryFee;
    }

    setAppliedPromo({
      code,
      discount,
      description: promo.description,
    });
    setPromoSuccess(`Applied! ${promo.description}`);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="w-full max-w-md bg-stone-50 h-full flex flex-col shadow-2xl relative border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="p-4 sm:p-5 bg-[#0C2B1E] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F59E0B] text-gray-950 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Your Feast Cart</h2>
              <p className="text-xs text-emerald-300">
                {cart.length === 0 ? 'Empty bag' : `${cart.length} unique item${cart.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery progress banner */}
        <div className="bg-[#082016] px-4 py-2 text-[11px] text-emerald-200 border-b border-emerald-900/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            {subtotal >= 15000 ? (
              <strong className="text-[#FBBF24]">Free VIP Delivery unlocked!</strong>
            ) : (
              <span>
                Add <strong>₦{(15000 - subtotal).toLocaleString()}</strong> more for Free Delivery
              </span>
            )}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">₦15,000 Tier</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-500">
              <div className="w-20 h-20 rounded-full bg-stone-200/80 flex items-center justify-center text-3xl">
                🍲
              </div>
              <h3 className="text-base font-bold text-stone-800">Your cart is feeling light</h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Add steaming amala, rich egusi, peppered suya, or cold zobo to start chopping bellefull!
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#0C2B1E] text-[#FBBF24] px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#164E35] transition-all"
              >
                Browse Our Delicious Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-sm flex gap-3 text-stone-800 relative group"
              >
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs text-stone-900 leading-snug truncate">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-stone-400 hover:text-rose-500 transition-colors p-0.5"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Configured options summary */}
                  <div className="text-[10px] text-stone-500 space-y-0.5 leading-tight">
                    {item.selectedPortion && <div>Portion: {item.selectedPortion.name}</div>}
                    {item.selectedProtein && <div>Protein: {item.selectedProtein.name}</div>}
                    {item.selectedSwallow && <div>Swallow: {item.selectedSwallow.name}</div>}
                    {item.selectedSpiceLevel && (
                      <div className="text-orange-600 font-semibold">
                        Heat: {item.selectedSpiceLevel}
                      </div>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <div className="text-emerald-700">
                        + {item.selectedAddons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="italic text-stone-400 truncate">
                        &quot;{item.specialInstructions}&quot;
                      </div>
                    )}
                  </div>

                  {/* Price & Quantity stepper */}
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="font-black text-sm text-stone-900">
                      ₦{item.totalPrice.toLocaleString()}
                    </span>

                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 space-y-3 shrink-0">
            
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Coupon: <strong>{appliedPromo.code}</strong> (-₦{appliedPromo.discount.toLocaleString()})
                    </span>
                  </div>
                  <button
                    onClick={removePromo}
                    className="text-stone-400 hover:text-stone-700 font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo Code (e.g. LAYEFIRST)"
                      className="flex-1 bg-stone-50 border border-stone-200 text-xs px-3 py-2 rounded-xl uppercase tracking-wider text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#0C2B1E]"
                    />
                    <button
                      type="submit"
                      className="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3 py-2 rounded-xl font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[10px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {promoError}
                    </p>
                  )}
                  {promoSuccess && (
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {promoSuccess}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Loyalty points redemption toggle */}
            {user.loyaltyPoints >= 100 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Use Chop Points ({user.loyaltyPoints} avail)</span>
                    <p className="text-[10px] text-amber-700">Save ₦{((Math.floor(loyaltyPointsToUse / 100)) * 500).toLocaleString()}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useLoyaltyPoints}
                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                />
              </div>
            )}

            {/* Financials Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Meal Subtotal</span>
                <span className="font-semibold text-stone-800">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery ({selectedZone.split('/')[0]})</span>
                <span className="font-semibold text-stone-800">
                  {deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
                  <span className="font-bold">-₦{promoDiscount.toLocaleString()}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Chop Points Discount</span>
                  <span className="font-bold">-₦{loyaltyDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-stone-950 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-base text-[#0C2B1E]">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Chop Points to earn note */}
            <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Chop Club Points to earn:
              </span>
              <strong className="font-bold text-emerald-900">+{pointsToEarn} pts</strong>
            </div>

            {/* Checkout CTA button */}
            <button
              onClick={() => {
                onProceedToCheckout();
                onClose();
              }}
              className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
