import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  Mail,
  CreditCard,
  Truck,
  Building,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CartItem,
  UserProfile,
  DeliveryZone,
  PaymentMethod,
  Order,
  OrderTimelineItem,
} from '../../types';
import { DELIVERY_ZONES } from '../../data/menuData';
import { sounds } from '../../services/soundEffects';
import { triggerPushNotification } from '../../services/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: UserProfile;
  selectedZone: DeliveryZone;
  setSelectedZone: (zone: DeliveryZone) => void;
  appliedPromo: { code: string; discount: number; description: string } | null;
  useLoyaltyPoints: boolean;
  loyaltyPointsToUse: number;
  onOrderCompleted: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  user,
  selectedZone,
  setSelectedZone,
  appliedPromo,
  useLoyaltyPoints,
  loyaltyPointsToUse,
  onOrderCompleted,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const isGuest = !user || user.id === 'guest';
  const scrollRef = useRef<HTMLDivElement>(null);

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState(
    user.name && user.name !== 'Guest Diner' ? user.name : 'Guest Diner'
  );
  const [customerPhone, setCustomerPhone] = useState(
    user.phone || '+234 803 123 4567'
  );
  const [customerEmail, setCustomerEmail] = useState(
    user.email || 'guest@layefoods.ng'
  );
  const [streetAddress, setStreetAddress] = useState(
    user.addresses[0]?.address || '14 Karimu Kotun Street, Victoria Island, Lagos'
  );
  const [landmark, setLandmark] = useState(
    user.addresses[0]?.landmark || 'Near Eko Hotel Roundabout'
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack_card');

  // Auto-fill guest or user details when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (isGuest) {
        if (!customerName || customerName.trim() === '') setCustomerName('Guest Diner');
        if (!customerPhone || customerPhone.trim() === '') setCustomerPhone('+234 803 123 4567');
        if (!customerEmail || customerEmail.trim() === '') setCustomerEmail('guest@layefoods.ng');
        if (!streetAddress || streetAddress.trim() === '') setStreetAddress('14 Karimu Kotun Street, Victoria Island, Lagos');
        if (!landmark || landmark.trim() === '') setLandmark('Near Eko Hotel Roundabout');
      } else {
        if (user.name) setCustomerName(user.name);
        if (user.phone) setCustomerPhone(user.phone);
        if (user.email) setCustomerEmail(user.email);
        if (user.addresses?.[0]?.address) setStreetAddress(user.addresses[0].address);
        if (user.addresses?.[0]?.landmark) setLandmark(user.addresses[0].landmark);
      }
    }
  }, [isOpen, user.id]);

  const handleAutoFillGuest = () => {
    setCustomerName('Guest Diner');
    setCustomerPhone('+234 803 123 4567');
    setCustomerEmail('guest@layefoods.ng');
    setStreetAddress('14 Karimu Kotun Street, Victoria Island, Lagos');
    setLandmark('Near Eko Hotel Roundabout');
    setErrorMsg('');
  };

  // Paystack mock state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paystackStep, setPaystackStep] = useState<'details' | 'otp' | 'success'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const zoneInfo = DELIVERY_ZONES.find((z) => z.zone === selectedZone);
  const deliveryFee = deliveryType === 'pickup' ? 0 : zoneInfo ? zoneInfo.fee : 1500;
  const promoDiscount = appliedPromo
    ? appliedPromo.code === 'LAYEFIRST'
      ? Math.round((subtotal * 10) / 100)
      : appliedPromo.discount
    : 0;
  const loyaltyDiscount = useLoyaltyPoints ? Math.floor(loyaltyPointsToUse / 100) * 500 : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - promoDiscount - loyaltyDiscount);
  const pointsToEarn = Math.floor(totalAmount / 1000) * 10;

  const validateForm = () => {
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add items to checkout.');
      return false;
    }

    let finalName = customerName.trim();
    if (!finalName) {
      if (isGuest) {
        finalName = 'Guest Diner';
        setCustomerName('Guest Diner');
      } else {
        setErrorMsg('Please enter your full name.');
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }

    let finalPhone = customerPhone.trim();
    if (!finalPhone || finalPhone.length < 7) {
      if (isGuest) {
        finalPhone = '+234 803 123 4567';
        setCustomerPhone('+234 803 123 4567');
      } else {
        setErrorMsg('Please enter a valid mobile phone number (e.g. +234 803 123 4567).');
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }

    if (deliveryType === 'delivery') {
      let finalAddress = streetAddress.trim();
      if (!finalAddress) {
        if (isGuest) {
          finalAddress = '14 Karimu Kotun Street, Victoria Island, Lagos';
          setStreetAddress('14 Karimu Kotun Street, Victoria Island, Lagos');
        } else {
          setErrorMsg('Please provide your complete delivery street address.');
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
        }
      }
    }

    setErrorMsg('');
    return true;
  };

  const createFinalOrder = (paymentStatus: 'paid' | 'pending'): Order => {
    const orderNum = `#LF-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    const initialTimeline: OrderTimelineItem[] = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: `Order received with ${paymentMethod.replace('_', ' ').toUpperCase()}`,
        timestamp: 'Just now',
        completed: true,
      },
      {
        status: 'confirmed',
        title: 'Kitchen Confirmed',
        description: 'Order confirmed and ingredients routed to prep station',
        timestamp: 'Pending',
        completed: paymentStatus === 'paid',
      },
      {
        status: 'preparing',
        title: 'Chef Cooking',
        description: 'Swallow whipping, soup simmering over firewood heat',
        timestamp: 'Next',
        completed: false,
      },
      {
        status: 'out_for_delivery',
        title: deliveryType === 'pickup' ? 'Ready at Counter' : 'Rider Dispatched',
        description: deliveryType === 'pickup' ? 'Ready for pickup in VI hub' : 'Thermal bike dispatch en route',
        timestamp: 'Est. 20-30 mins',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Completed',
        description: 'Enjoy your delicious feast!',
        timestamp: 'Est. 35 mins',
        completed: false,
      },
    ];

    return {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      customerId: user.id || 'guest',
      customerName: customerName.trim() || 'Guest Diner',
      customerPhone: customerPhone.trim() || '+234 803 123 4567',
      customerEmail: customerEmail.trim() || 'guest@layefoods.ng',
      deliveryType,
      deliveryZone: selectedZone,
      deliveryAddress: deliveryType === 'pickup'
        ? 'Laye Foods Kitchen Hub, 14 Karimu Kotun St, Victoria Island'
        : (streetAddress.trim() || '14 Karimu Kotun Street, Victoria Island, Lagos'),
      landmark: landmark.trim() || undefined,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      items: [...cart],
      subtotal,
      deliveryFee,
      discountAmount: promoDiscount,
      promoCodeApplied: appliedPromo?.code,
      loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0,
      loyaltyDiscount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: paymentStatus === 'paid' ? 'confirmed' : 'pending',
      timeline: initialTimeline,
      courier: deliveryType === 'delivery' ? {
        name: 'Tunde Bakare',
        phone: '+234 809 123 4567',
        vehicle: 'Honda Ace 125 (Thermal Box Bike)',
        plateNumber: 'LAG-482-VI',
        rating: 4.95,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      } : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      estimatedDeliveryTime: deliveryType === 'pickup' ? '20 mins' : '30 - 45 mins',
      loyaltyPointsEarned: pointsToEarn,
    };
  };

  const handleInitiateOrder = () => {
    if (!validateForm()) return;

    if (paymentMethod === 'paystack_card' || paymentMethod === 'bank_transfer' || paymentMethod === 'ussd') {
      setShowPaystackModal(true);
      setPaystackStep('details');
    } else {
      // Payment on Delivery
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        const order = createFinalOrder('pending');
        finalizeOrder(order);
      }, 900);
    }
  };

  const handlePaystackSubmitOtp = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaystackStep('success');
      setTimeout(() => {
        setShowPaystackModal(false);
        const order = createFinalOrder('paid');
        finalizeOrder(order);
      }, 1200);
    }, 1500);
  };

  const finalizeOrder = (order: Order) => {
    sounds.playSuccessFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    triggerPushNotification(
      `🎉 Order ${order.orderNumber} Confirmed!`,
      `We've received your order of ₦${order.totalAmount.toLocaleString()}. The kitchen is firing up!`,
      'order',
      order.id
    );

    if (pointsToEarn > 0) {
      setTimeout(() => {
        triggerPushNotification(
          `⭐ +${pointsToEarn} Chop Points Credited!`,
          `You earned loyalty points for this order. Check your Chop Club wallet!`,
          'loyalty'
        );
      }, 2000);
    }

    onClearCart();
    onOrderCompleted(order);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#0C2B1E] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#F59E0B] text-gray-950 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Checkout & Delivery</h2>
                <p className="text-xs text-emerald-300">
                  {cart.length} item{cart.length > 1 ? 's' : ''} • Total: ₦{totalAmount.toLocaleString()}
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

          {/* Form Content */}
          <div ref={scrollRef} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
            
            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {isGuest && (
                  <button
                    type="button"
                    onClick={handleAutoFillGuest}
                    className="text-[11px] underline font-bold text-rose-900 shrink-0 hover:text-black cursor-pointer"
                  >
                    Auto-Fill Demo Details
                  </button>
                )}
              </div>
            )}

            {/* Delivery vs Pickup Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Fulfillment Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    deliveryType === 'delivery'
                      ? 'border-[#0C2B1E] bg-[#0C2B1E] text-white shadow-md'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Doorstep Delivery (24/7)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    deliveryType === 'pickup'
                      ? 'border-[#0C2B1E] bg-[#0C2B1E] text-white shadow-md'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Self Pickup (VI Hub - Free)</span>
                </button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Customer & Contact Info
                </label>
                {isGuest && (
                  <button
                    type="button"
                    onClick={handleAutoFillGuest}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                    <span>Auto-Fill Guest Info</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone (e.g. +234 803...) *"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                </div>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email Address (for order receipts)"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                />
              </div>
            </div>

            {/* Delivery Destination (only if delivery) */}
            {deliveryType === 'delivery' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Delivery Address
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Hub: {selectedZone} (₦{deliveryFee.toLocaleString()})
                  </span>
                </div>

                {/* Zone selector */}
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as DeliveryZone)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-[#0C2B1E]"
                >
                  {DELIVERY_ZONES.filter((z) => !z.zone.includes('Pickup')).map((z) => (
                    <option key={z.zone} value={z.zone}>
                      {z.zone} — ₦{z.fee.toLocaleString()} ({z.estMinutes})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street name, building number, flat/suite *"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Closest landmark (e.g. Opposite Eko Hotel)"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Rider note (e.g. Call at the gate)"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Payment Option
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Paystack Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack_card')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'paystack_card'
                      ? 'border-[#0C2B1E] bg-[#0C2B1E]/5 ring-2 ring-[#0C2B1E]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-800" />
                      <span>Paystack Instant Online</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Debit Card (Mastercard/Visa/Verve), Bank Transfer, or USSD
                  </p>
                </button>

                {/* Payment on Delivery (Cash / POS) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pod_pos')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'pod_pos' || paymentMethod === 'pod_cash'
                      ? 'border-[#0C2B1E] bg-[#0C2B1E]/5 ring-2 ring-[#0C2B1E]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Payment on Delivery</span>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      POD
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pay with Cash or Wireless POS Card Terminal upon arrival
                  </p>
                </button>

              </div>
            </div>

            {/* Order Review Snapshot */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
              <div className="font-bold text-stone-800 flex items-center justify-between">
                <span>Order Summary ({cart.length} items)</span>
                <span className="text-[#0C2B1E] font-black">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-stone-200/80 text-[11px] text-stone-600">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="py-1 flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-stone-800">
                      ₦{item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 text-stone-500 flex justify-between text-[11px]">
                <span>Delivery: ₦{deliveryFee.toLocaleString()}</span>
                {promoDiscount > 0 && <span className="text-emerald-700 font-semibold">Promo: -₦{promoDiscount.toLocaleString()}</span>}
                {loyaltyDiscount > 0 && <span className="text-amber-700 font-semibold">Chop Points: -₦{loyaltyDiscount.toLocaleString()}</span>}
              </div>
            </div>

          </div>

          {/* Checkout Footer Action */}
          <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col gap-3">
            {/* If errorMsg exists, show it prominently right here above the button */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {isGuest && (
                  <button
                    type="button"
                    onClick={handleAutoFillGuest}
                    className="text-[11px] underline font-bold text-rose-900 shrink-0 hover:text-black cursor-pointer"
                  >
                    Quick Auto-Fill
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total Payable</span>
                  {isGuest && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Guest Order
                    </span>
                  )}
                </div>
                <span className="text-xl font-black text-[#0C2B1E]">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleInitiateOrder}
                disabled={isProcessingPayment}
                className="bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'paystack_card' ? `Pay ₦${totalAmount.toLocaleString()}` : 'Confirm & Place Order'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Paystack Simulated Modal */}
      {showPaystackModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-sky-900/30">
            {/* Paystack Top Blue Banner */}
            <div className="bg-[#0BA4DB] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className="font-bold text-sm tracking-wide">Paystack Secure Checkout</span>
              </div>
              <button
                onClick={() => setShowPaystackModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-stone-800">
              <div className="text-center pb-2 border-b border-stone-100">
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Paying to Laye Foods Ltd</p>
                <h3 className="text-2xl font-black text-stone-900 mt-1">
                  ₦{totalAmount.toLocaleString()}
                </h3>
                <p className="text-[11px] text-stone-400">Ref: pstk_ref_{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>

              {paystackStep === 'details' && (
                <div className="space-y-3">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Instant demo verification enabled for testing.</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="5399 •••• •••• 4821 (Mastercard)"
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-stone-500 uppercase">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="11/28"
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-500 uppercase">CVV</label>
                      <input
                        type="password"
                        readOnly
                        value="821"
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaystackStep('otp')}
                    className="w-full bg-[#0BA4DB] hover:bg-[#0993c5] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-2"
                  >
                    Authorize ₦{totalAmount.toLocaleString()}
                  </button>
                </div>
              )}

              {paystackStep === 'otp' && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-stone-600">Enter the 4-digit bank OTP sent to {customerPhone || '+234 803 •••• 890'}:</p>
                    <div className="text-[10px] text-amber-700 font-bold bg-amber-50 py-1 rounded">
                      Demo OTP: type <strong>1234</strong>
                    </div>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="1234"
                    className="w-full text-center text-2xl font-black tracking-widest p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#0BA4DB]"
                  />

                  <button
                    type="button"
                    onClick={handlePaystackSubmitOtp}
                    disabled={isProcessingPayment}
                    className="w-full bg-[#0BA4DB] hover:bg-[#0993c5] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Verify & Pay</span>
                    )}
                  </button>
                </div>
              )}

              {paystackStep === 'success' && (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="font-bold text-base text-stone-900">Payment Successful!</h4>
                  <p className="text-xs text-stone-500">Redirecting to live kitchen tracker...</p>
                </div>
              )}

              <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit TLS Encryption via Paystack Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
