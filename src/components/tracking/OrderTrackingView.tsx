import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ChefHat,
  Bike,
  Package,
  RotateCcw,
  Search,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { triggerPushNotification, saveStoredOrders, getStoredOrders } from '../../services/storage';
import { sounds } from '../../services/soundEffects';

interface OrderTrackingViewProps {
  activeOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  activeOrder,
  onSelectOrder,
  onReorder,
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [simulatedProgress, setSimulatedProgress] = useState(65);

  const allOrders = getStoredOrders();

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const clean = searchCode.trim().toLowerCase().replace(/#/g, '');
    if (!clean) return;

    const found = allOrders.find(
      (o) => o.orderNumber.toLowerCase().replace(/#/g, '') === clean || o.id === clean
    );

    if (found) {
      onSelectOrder(found);
      setSearchCode('');
    } else {
      setSearchError('Order not found. Please try #LF-9482 or check your Profile.');
    }
  };

  const advanceOrderStatus = (newStatus: OrderStatus) => {
    if (!activeOrder) return;

    const updatedTimeline = activeOrder.timeline.map((step) => {
      if (step.status === newStatus) {
        return { ...step, completed: true, timestamp: 'Just now' };
      }
      return step;
    });

    const statusTitles: Record<OrderStatus, string> = {
      pending: 'Order Received',
      confirmed: 'Order Confirmed',
      preparing: 'Chef is Cooking 🍳',
      ready_for_pickup: 'Ready at Counter 🛍️',
      out_for_delivery: 'Rider is on the Way 🛵',
      delivered: 'Delivered Safely 🎉',
      cancelled: 'Order Cancelled',
    };

    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Your order was submitted.',
      confirmed: 'Kitchen has accepted your order.',
      preparing: 'Chef Babatunde is cooking your fresh soup and swallow!',
      ready_for_pickup: 'Your food is neatly packaged and waiting at Victoria Island hub.',
      out_for_delivery: 'Rider Tunde Bakare has picked up your thermal food bag.',
      delivered: 'Rider arrived! Chop bellefull and enjoy your meal.',
      cancelled: 'Order was cancelled.',
    };

    const updatedOrder: Order = {
      ...activeOrder,
      orderStatus: newStatus,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    };

    // Save to storage
    const updatedOrders = allOrders.map((o) => (o.id === activeOrder.id ? updatedOrder : o));
    saveStoredOrders(updatedOrders);
    onSelectOrder(updatedOrder);

    // Play sound and trigger push notification
    sounds.playNotification();
    triggerPushNotification(
      statusTitles[newStatus],
      statusMessages[newStatus],
      'order',
      activeOrder.id
    );
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'preparing':
        return 3;
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = activeOrder ? getStatusStepIndex(activeOrder.orderStatus) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in text-stone-800">
      
      {/* Header and Lookup Bar */}
      <div className="bg-[#0C2B1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B] text-gray-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Bike className="w-3.5 h-3.5" />
            <span>Real-Time Kitchen & Dispatch Tracking</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-['Playfair_Display',serif]">
            Track Your Food In Flight
          </h1>

          <p className="text-emerald-100/90 text-sm max-w-xl">
            Watch your meal transition from the kitchen firewood to the thermal delivery motorcycle in real time.
          </p>

          {/* Search box for tracking other orders */}
          <form onSubmit={handleSearchOrder} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Order # (e.g. #LF-9482)"
                className="w-full bg-white text-stone-900 text-xs pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
            >
              Track Order
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-300 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-4 h-4" /> {searchError}
            </p>
          )}
        </div>
      </div>

      {!activeOrder ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <h3 className="text-lg font-bold text-stone-800">No Active Order Selected</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Enter an order ID above (e.g. #LF-9482) or choose one of your recent meals from the menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main tracking timeline & visual map (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Status Pipeline Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-stone-900">
                      Order {activeOrder.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      activeOrder.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeOrder.orderStatus === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {activeOrder.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed at {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activeOrder.deliveryZone}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-4 py-2 rounded-2xl">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Estimated Arrival</span>
                    <span className="text-sm font-black text-stone-900">
                      {activeOrder.estimatedDeliveryTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { step: 1, label: 'Received', icon: Package },
                    { step: 2, label: 'Kitchen Prep', icon: ChefHat },
                    { step: 3, label: 'Out with Rider', icon: Bike },
                    { step: 4, label: 'Delivered', icon: CheckCircle2 },
                  ].map((s) => {
                    const isDone = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    const Icon = s.icon;
                    return (
                      <div key={s.step} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-[#0C2B1E] text-[#FBBF24] shadow-md scale-105'
                              : 'bg-stone-100 text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-amber-400/40 animate-pulse' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-bold ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Linear progress bar */}
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-[#F59E0B] h-full transition-all duration-700 rounded-full"
                    style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Simulated Delivery Graphic / Route Visualizer */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-6 text-white min-h-[220px] flex flex-col justify-between shadow-inner">
                {/* SVG route line decoration */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 180 Q 150 40 300 120 T 600 60" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="6,6" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-300">Live GPS Courier Telemetry</span>
                  </div>
                  <span className="text-xs text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-white/10 font-mono">
                    Speed: 38 km/h • Ozumba Mbadiwe Way
                  </span>
                </div>

                {/* Animated Rider and Destination Points */}
                <div className="relative z-10 py-6 flex items-center justify-between px-4 sm:px-12">
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-2xl bg-[#0C2B1E] border border-emerald-500/50 flex items-center justify-center text-xl shadow-lg mx-auto mb-1">
                      🍲
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300 block">VI Kitchen Hub</span>
                    <span className="text-[10px] text-stone-400">Order Dispatched</span>
                  </div>

                  {/* Rider in motion */}
                  <div
                    className="flex flex-col items-center transition-all duration-1000"
                    style={{ transform: `scale(1.1)` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-gray-950 flex items-center justify-center shadow-2xl animate-bounce">
                      <Bike className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-amber-300 mt-1">Rider Tunde</span>
                    <span className="text-[10px] text-stone-300 bg-black/60 px-2 py-0.5 rounded-full mt-0.5">
                      {activeOrder.orderStatus === 'delivered' ? 'Arrived' : 'In Transit'}
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-lg mx-auto mb-1">
                      📍
                    </div>
                    <span className="text-[11px] font-bold text-amber-200 block">Delivery Address</span>
                    <span className="text-[10px] text-stone-400 truncate max-w-[120px] inline-block">
                      {activeOrder.deliveryAddress}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-stone-400 border-t border-white/10 pt-3">
                  <span>Destination: {activeOrder.deliveryZone}</span>
                  <span className="text-amber-400 font-semibold">Thermal Insulation: 82°C Piping Hot</span>
                </div>
              </div>

              {/* DEMO SIMULATION CONTROLS */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Interactive Demo: Advance Order Status
                  </span>
                  <span className="text-[11px] text-amber-700">Test push notifications & triggers</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => advanceOrderStatus('confirmed')}
                    className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-all shadow-sm"
                  >
                    1. Confirm Order
                  </button>
                  <button
                    onClick={() => advanceOrderStatus('preparing')}
                    className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-all shadow-sm"
                  >
                    2. Kitchen Preparing
                  </button>
                  <button
                    onClick={() => advanceOrderStatus('out_for_delivery')}
                    className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-all shadow-sm"
                  >
                    3. Rider Dispatched
                  </button>
                  <button
                    onClick={() => advanceOrderStatus('delivered')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    4. Mark Delivered!
                  </button>
                </div>
              </div>

            </div>

            {/* Step by Step Timeline details */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Full Fulfillment Audit Trail
              </h3>
              <div className="space-y-4">
                {activeOrder.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1">
                      {step.completed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${step.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                          {step.title}
                        </span>
                        <span className="text-[11px] text-stone-400">{step.timestamp}</span>
                      </div>
                      {step.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar: Courier card & Order Item breakdown (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Courier Card */}
            {activeOrder.courier && (
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                  Assigned Dispatch Rider
                </span>

                <div className="flex items-center gap-3">
                  <img
                    src={activeOrder.courier.photoUrl}
                    alt={activeOrder.courier.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-amber-300"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{activeOrder.courier.name}</h4>
                    <p className="text-xs text-stone-500">{activeOrder.courier.vehicle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] bg-stone-100 text-stone-700 font-mono font-bold px-2 py-0.5 rounded">
                        {activeOrder.courier.plateNumber}
                      </span>
                      <span className="text-xs font-bold text-amber-600">
                        ★ {activeOrder.courier.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`tel:${activeOrder.courier.phone}`}
                    className="flex-1 bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Rider</span>
                  </a>
                </div>
              </div>
            )}

            {/* Delivery address details */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                Delivery Location
              </span>
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">{activeOrder.customerName}</p>
                  <p>{activeOrder.deliveryAddress}</p>
                  {activeOrder.landmark && (
                    <p className="text-stone-500 italic mt-0.5">Landmark: {activeOrder.landmark}</p>
                  )}
                  <p className="text-stone-500 mt-0.5">Phone: {activeOrder.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Meal Snapshot ({activeOrder.items.length})
                </span>
                <span className="text-xs font-bold text-stone-900">
                  ₦{activeOrder.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3 divide-y divide-stone-100">
                {activeOrder.items.map((it) => (
                  <div key={it.cartItemId} className="pt-2 flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-stone-900 truncate">{it.name}</p>
                      <p className="text-[10px] text-stone-500">
                        {it.quantity}x • ₦{it.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Re-order CTA */}
              <button
                onClick={() => onReorder(activeOrder)}
                className="w-full mt-2 bg-stone-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Re-Order This Exact Feast</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
