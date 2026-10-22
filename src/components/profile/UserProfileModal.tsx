import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Award,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Plus,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { UserProfile, Order, DeliveryZone } from '../../types';
import { DEMO_USERS, saveStoredUser } from '../../services/storage';
import { DELIVERY_ZONES } from '../../data/menuData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  orders: Order[];
  onSelectOrderToTrack: (order: Order) => void;
  onReorder: (order: Order) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  orders,
  onSelectOrderToTrack,
  onReorder,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newZone, setNewZone] = useState<DeliveryZone>('Victoria Island / Ikoyi');
  const [showAddAddress, setShowAddAddress] = useState(false);

  if (!isOpen) return null;

  const handleSwitchAccount = (accountKey: 'regular' | 'vip' | 'admin') => {
    const targetUser = DEMO_USERS[accountKey];
    if (targetUser) {
      saveStoredUser(targetUser);
      onUpdateUser(targetUser);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    const newAddr = {
      id: 'addr-' + Date.now(),
      label: newAddressLabel,
      address: newStreet.trim(),
      zone: newZone,
      isDefault: user.addresses.length === 0,
    };

    const updatedUser = {
      ...user,
      addresses: [...user.addresses, newAddr],
    };
    saveStoredUser(updatedUser);
    onUpdateUser(updatedUser);
    setNewStreet('');
    setShowAddAddress(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-stone-800">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0C2B1E] to-[#123e2c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-gray-950 font-black text-xl flex items-center justify-center shadow-lg uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black">{user.name}</h2>
              <p className="text-xs text-emerald-300">
                {user.email} • <span className="text-[#FBBF24] font-bold">{user.tier}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Switcher Pill bar */}
        <div className="bg-amber-50 p-2.5 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">
            Switch Demo Account:
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleSwitchAccount('regular')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                user.id === 'usr-901'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-amber-100'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleSwitchAccount('vip')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                user.id === 'usr-vip-77'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-amber-100'
              }`}
            >
              VIP Gold (1,850 pts)
            </button>
            <button
              onClick={() => handleSwitchAccount('admin')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                user.id === 'usr-adm-01'
                  ? 'bg-[#0C2B1E] text-[#FBBF24] shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-amber-100'
              }`}
            >
              Admin Head
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 text-xs font-bold bg-stone-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-[#0C2B1E] text-[#0C2B1E] bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Profile & Chop Points
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 text-center transition-all ${
              activeTab === 'addresses'
                ? 'border-b-2 border-[#0C2B1E] text-[#0C2B1E] bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Saved Delivery Hubs ({user.addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center transition-all ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#0C2B1E] text-[#0C2B1E] bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Past Orders ({orders.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Loyalty Balance</span>
                  <span className="text-xl font-black text-[#0C2B1E] mt-0.5 block">
                    {user.loyaltyPoints} Chop Points
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                    {user.tier} Member
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Lifetime Feasts</span>
                  <span className="text-xl font-black text-stone-900 mt-0.5 block">
                    ₦{user.totalSpent.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    {user.totalOrdersCount} Completed Orders
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-bold text-stone-700 block">Contact Information</label>
                <div className="space-y-2 text-stone-600">
                  <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {user.dietaryPreferences && (
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="font-bold text-stone-700 block">Taste & Spice Preferences</label>
                  <div className="flex flex-wrap gap-1.5">
                    {user.dietaryPreferences.map((pref) => (
                      <span key={pref} className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold">
                        ✓ {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 mt-0.5">{addr.address}</p>
                        <p className="text-[10px] text-emerald-800 font-medium mt-0.5">{addr.zone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showAddAddress ? (
                <form onSubmit={handleAddAddress} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                      placeholder="Label (e.g. Office, Mom's House)"
                      className="p-2 rounded-xl border border-stone-200"
                    />
                    <select
                      value={newZone}
                      onChange={(e) => setNewZone(e.target.value as DeliveryZone)}
                      className="p-2 rounded-xl border border-stone-200 bg-white"
                    >
                      {DELIVERY_ZONES.filter((z) => !z.zone.includes('Pickup')).map((z) => (
                        <option key={z.zone} value={z.zone}>{z.zone}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="Full street address..."
                    className="w-full p-2 rounded-xl border border-stone-200"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 text-stone-500 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0C2B1E] text-[#FBBF24] font-bold px-4 py-1.5 rounded-xl shadow-xs"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="w-full py-2.5 border-2 border-dashed border-stone-300 rounded-2xl text-stone-600 font-bold flex items-center justify-center gap-1.5 hover:border-stone-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: PAST ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-center text-stone-400 py-6">No previous orders found.</p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-white space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{ord.orderNumber}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                        {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <span className="font-black text-stone-900">₦{ord.totalAmount.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSelectOrderToTrack(ord);
                            onClose();
                          }}
                          className="text-emerald-800 hover:underline font-bold"
                        >
                          Track Map →
                        </button>
                        <button
                          onClick={() => {
                            onReorder(ord);
                            onClose();
                          }}
                          className="bg-stone-900 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-black"
                        >
                          Re-Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {onLogout ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 text-white rounded-xl font-bold text-xs hover:bg-black cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
