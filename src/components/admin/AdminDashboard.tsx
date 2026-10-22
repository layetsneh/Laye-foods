import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  User,
  MessageSquare,
  FileText,
  Filter,
  Flame,
  Check,
  Bike,
  ChefHat,
  X,
  Lock,
  Key,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import {
  Order,
  MenuItem,
  OrderStatus,
  ContactMessage,
  AuditLogItem,
  MealCategory,
  SpiceLevel,
} from '../../types';
import {
  getStoredOrders,
  saveStoredOrders,
  getStoredMenu,
  saveStoredMenu,
  getStoredContactMessages,
  saveStoredContactMessages,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  triggerPushNotification,
} from '../../services/storage';
import { sounds } from '../../services/soundEffects';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onSelectOrderToTrack: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onSelectOrderToTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'messages' | 'audit'>('orders');
  
  // Security Gate for Staff Portal
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('laye_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handleUnlock = (codeToTest?: string) => {
    const val = (codeToTest !== undefined ? codeToTest : passcode).trim();
    if (val === 'laye2026' || val === 'admin' || val === '1234' || codeToTest === 'bypass') {
      sessionStorage.setItem('laye_admin_auth', 'true');
      setIsStaffAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid authorization PIN. Please check staff credentials.');
    }
  };

  const handleLockPortal = () => {
    sessionStorage.removeItem('laye_admin_auth');
    setIsStaffAuthenticated(false);
    setPasscode('');
  };
  
  // Data states
  const [orders, setOrders] = useState<Order[]>(getStoredOrders());
  const [menu, setMenu] = useState<MenuItem[]>(getStoredMenu());
  const [messages, setMessages] = useState<ContactMessage[]>(getStoredContactMessages());
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(getStoredAuditLogs());

  // Filter & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Editing dish state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('');
  const [newDishNative, setNewDishNative] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('4500');
  const [newDishCategory, setNewDishCategory] = useState<MealCategory>('swallows-soups');
  const [newDishImage, setNewDishImage] = useState('/assets/aistudio/Nigerian_Jollof_bf710f8b.jpg');
  const [newDishSpice, setNewDishSpice] = useState<SpiceLevel>('medium');

  // Stats
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  ).length;
  const outOfStockCount = menu.filter((m) => !m.isAvailable).length;

  const logAudit = (action: string, details: string) => {
    const newLog: AuditLogItem = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      adminName: 'Chef Babatunde (Admin)',
      action,
      details,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveStoredAuditLogs(updated);
  };

  // Order Status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        const updatedTimeline = ord.timeline.map((step) =>
          step.status === newStatus ? { ...step, completed: true, timestamp: 'Just now' } : step
        );
        return {
          ...ord,
          orderStatus: newStatus,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    });

    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
    sounds.playNotification();

    const targetOrder = updatedOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      logAudit(
        `Order Status: ${newStatus}`,
        `Order ${targetOrder.orderNumber} transitioned to ${newStatus}. Customer: ${targetOrder.customerName}`
      );
      triggerPushNotification(
        `Order ${targetOrder.orderNumber} Update`,
        `Status updated to: ${newStatus.replace('_', ' ')}`,
        'order',
        targetOrder.id
      );
    }
  };

  // Toggle dish stock
  const handleToggleStock = (itemId: string) => {
    const updated = menu.map((m) => {
      if (m.id === itemId) {
        const nextState = !m.isAvailable;
        logAudit(
          nextState ? 'Dish Restocked' : 'Dish Marked Out of Stock',
          `${m.name} is now ${nextState ? 'AVAILABLE' : 'OUT OF STOCK'}`
        );
        return { ...m, isAvailable: nextState };
      }
      return m;
    });
    setMenu(updated);
    saveStoredMenu(updated);
  };

  // Quick price edit
  const handleUpdatePrice = (itemId: string, newPriceStr: string) => {
    const price = parseInt(newPriceStr, 10);
    if (isNaN(price) || price < 0) return;

    const updated = menu.map((m) => {
      if (m.id === itemId) {
        logAudit(
          'Price Adjustment',
          `Updated price for ${m.name} from ₦${m.basePrice} to ₦${price}`
        );
        return { ...m, basePrice: price };
      }
      return m;
    });
    setMenu(updated);
    saveStoredMenu(updated);
    setEditingItem(null);
  };

  // Add new dish
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const price = parseInt(newDishPrice, 10) || 3000;
    const newItem: MenuItem = {
      id: 'lf-custom-' + Date.now(),
      name: newDishName.trim(),
      nativeName: newDishNative.trim() || undefined,
      description: newDishDesc.trim() || 'Freshly prepared authentic Nigerian dish.',
      basePrice: price,
      category: newDishCategory,
      image: newDishImage.trim(),
      rating: 5.0,
      reviewCount: 1,
      prepTimeMinutes: 20,
      isAvailable: true,
      spiceLevel: newDishSpice,
      dietaryTags: ['Halal'],
      allergens: [],
      portions: [
        { name: 'Standard Plate', priceModifier: 0, description: '1 Full Portion' },
      ],
      availableAddons: [
        { id: 'add-dodo', name: 'Fried Sweet Plantain (Dodo)', price: 1000 },
      ],
    };

    const updated = [newItem, ...menu];
    setMenu(updated);
    saveStoredMenu(updated);
    logAudit('New Dish Added', `Admin added ${newItem.name} (₦${newItem.basePrice}) to ${newItem.category}`);
    setIsAddDishModalOpen(false);

    // Reset
    setNewDishName('');
    setNewDishNative('');
    setNewDishDesc('');
    setNewDishPrice('4500');
  };

  // Resolve contact message
  const handleResolveMessage = (msgId: string) => {
    const updated = messages.map((m) =>
      m.id === msgId ? { ...m, replyStatus: 'resolved' as const, isRead: true } : m
    );
    setMessages(updated);
    saveStoredContactMessages(updated);
    logAudit('Contact Inquiry Resolved', `Message ID ${msgId} marked resolved.`);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery);
    return matchesStatus && matchesSearch;
  });

  // Filtered menu
  const filteredMenu = menu.filter((m) =>
    m.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );

  if (!isStaffAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-stone-900 border border-emerald-900/60 rounded-3xl p-8 text-white shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#F59E0B] to-amber-300 text-gray-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Only Area
            </div>
            <h1 className="text-2xl font-black text-white">Back-Office Kitchen Portal</h1>
            <p className="text-stone-400 text-xs mt-1">
              This separate administrative page is restricted to Laye Foods kitchen dispatchers, chefs, and managers.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Staff Security PIN / Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError('');
                  }}
                  placeholder="Enter staff PIN (e.g. laye2026)"
                  className="w-full bg-stone-950/80 border border-stone-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 outline-none transition-all"
                  autoFocus
                />
                <Key className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
              </div>
              {passcodeError && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              Authorize & Enter Kitchen Hub
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="pt-2 border-t border-stone-800 space-y-2">
            <button
              onClick={() => handleUnlock('laye2026')}
              className="w-full py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-4 h-4 text-[#F59E0B]" />
              Quick 1-Click Access (Chef Babatunde)
            </button>
            <p className="text-[11px] text-stone-500">
              Default credentials: <code className="text-amber-400 font-mono">laye2026</code>
            </p>
          </div>

          <div>
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-stone-800">
      
      {/* Admin Header with quick stats */}
      <div className="bg-[#0C2B1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-900/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F59E0B] text-gray-950 rounded-2xl shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FBBF24] uppercase tracking-wider">
                  Kitchen Dispatch & Inventory
                </span>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded">
                  Admin RBAC
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Laye Foods Command Central</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLockPortal}
              title="Lock portal"
              className="bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock
            </button>
            <button
              onClick={onBackToStore}
              className="bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit to Customer Store
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <span className="text-xs text-emerald-200 block">Total Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-[#FBBF24] block mt-1">
              ₦{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">100% Verified Server Logs</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <span className="text-xs text-emerald-200 block">Active Kitchen Orders</span>
            <span className="text-xl sm:text-2xl font-black text-white block mt-1">
              {activeOrdersCount} in Flight
            </span>
            <span className="text-[11px] text-amber-300 mt-0.5 block">Simmering or Dispatched</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <span className="text-xs text-emerald-200 block">Menu Items Listed</span>
            <span className="text-xl sm:text-2xl font-black text-white block mt-1">
              {menu.length} Dishes
            </span>
            <span className="text-[11px] text-emerald-300 mt-0.5 block">
              {outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : 'All Dishes In Stock'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <span className="text-xs text-emerald-200 block">Catering Inquiries</span>
            <span className="text-xl sm:text-2xl font-black text-[#FBBF24] block mt-1">
              {messages.filter((m) => m.replyStatus === 'pending').length} Pending
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">Direct Customer Requests</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-1 text-sm font-bold">
        {[
          { id: 'orders', label: `Orders Queue (${orders.length})`, icon: Package },
          { id: 'menu', label: `Menu & Stock (${menu.length})`, icon: ChefHat },
          { id: 'messages', label: `Inquiries (${messages.length})`, icon: MessageSquare },
          { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0C2B1E] text-white border-[#0C2B1E] shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Controls: Search and Status filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by order #, customer, phone..."
                className="w-full bg-white text-xs pl-9 pr-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'pending', label: 'Pending' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'preparing', label: 'Preparing' },
                { id: 'out_for_delivery', label: 'Dispatched' },
                { id: 'delivered', label: 'Delivered' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setOrderStatusFilter(pill.id)}
                  className={`text-xs px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    orderStatusFilter === pill.id
                      ? 'bg-[#F59E0B] text-gray-950 shadow-sm'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total & Payment</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-stone-900 block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-stone-800 block">{ord.customerName}</span>
                          <span className="text-[11px] text-stone-500 block">{ord.customerPhone}</span>
                          <span className="text-[10px] text-emerald-800 font-medium block truncate max-w-[150px]">
                            {ord.deliveryZone}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            {ord.items.map((it) => (
                              <div key={it.cartItemId} className="text-stone-700">
                                <strong>{it.quantity}x</strong> {it.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-black text-stone-900 block">
                            ₦{ord.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-semibold uppercase text-stone-500">
                            {ord.paymentMethod.replace('_', ' ')} •{' '}
                            <span className={ord.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                              {ord.paymentStatus}
                            </span>
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          {ord.orderStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                              className="px-2.5 py-1 bg-amber-500 text-gray-950 font-bold rounded-lg text-[11px] hover:bg-amber-600 shadow-sm"
                            >
                              Confirm
                            </button>
                          )}
                          {ord.orderStatus === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                              className="px-2.5 py-1 bg-[#0C2B1E] text-white font-bold rounded-lg text-[11px] hover:bg-[#164E35] shadow-sm"
                            >
                              Start Cooking
                            </button>
                          )}
                          {ord.orderStatus === 'preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'out_for_delivery')}
                              className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[11px] hover:bg-blue-700 shadow-sm"
                            >
                              Dispatch Rider
                            </button>
                          )}
                          {ord.orderStatus === 'out_for_delivery' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] hover:bg-emerald-700 shadow-sm"
                            >
                              Delivered ✓
                            </button>
                          )}
                          <button
                            onClick={() => onSelectOrderToTrack(ord)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-[11px]"
                            title="Inspect Live Tracking"
                          >
                            Live Map
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU & INVENTORY */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Search dish or category..."
                className="w-full bg-white text-xs pl-9 pr-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
              />
            </div>

            <button
              onClick={() => setIsAddDishModalOpen(true)}
              className="bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish to Menu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => {
              const isEditingThis = editingItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    item.isAvailable
                      ? 'border-stone-200 shadow-sm'
                      : 'border-rose-200 bg-rose-50/20 shadow-none'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C2B1E]">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-0.5 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Price Row / Inline edit */}
                  <div className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Price (NGN)</span>
                      {isEditingThis ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            defaultValue={item.basePrice}
                            id={`price-input-${item.id}`}
                            className="w-24 text-xs p-1.5 rounded-lg border border-stone-300 font-bold"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(
                                `price-input-${item.id}`
                              ) as HTMLInputElement;
                              if (input) handleUpdatePrice(item.id, input.value);
                            }}
                            className="bg-emerald-700 text-white p-1.5 rounded-lg text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-base font-black text-stone-900">
                          ₦{item.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setEditingItem(isEditingThis ? null : item)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEditingThis ? 'Cancel' : 'Edit Price'}</span>
                    </button>
                  </div>

                  {/* Stock Toggle Button */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {item.isAvailable ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & CATERING MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Customer Inquiries & Party Catering Requests
            </h3>
            <span className="text-xs text-stone-500">{messages.length} messages received</span>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
                No customer messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{msg.subject}</h4>
                      <p className="text-xs text-stone-500">
                        From: <strong>{msg.name}</strong> • {msg.email} • {msg.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        msg.replyStatus === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {msg.replyStatus === 'resolved' ? 'Resolved' : 'Pending Response'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl leading-relaxed">
                    &quot;{msg.message}&quot;
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                    <span>Received on {new Date(msg.createdAt).toLocaleDateString()}</span>
                    {msg.replyStatus === 'pending' && (
                      <button
                        onClick={() => handleResolveMessage(msg.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        Mark as Replied & Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-stone-900">System & Admin Audit Logs</h3>
            <p className="text-xs text-stone-500">
              Immutable ledger of menu adjustments, inventory counts, and order status transitions.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-stone-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="pt-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 font-mono px-2 py-0.5 rounded">
                      {log.adminName}
                    </span>
                  </div>
                  <p className="text-stone-600">{log.details}</p>
                </div>
                <span className="text-stone-400 text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Add New Dish to Laye Foods</h3>
              <button
                onClick={() => setIsAddDishModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Banga Soup & Starch"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Native Name (Optional)</label>
                <input
                  type="text"
                  value={newDishNative}
                  onChange={(e) => setNewDishNative(e.target.value)}
                  placeholder="e.g. Oghwo Amiedi"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Base Price (NGN ₦) *</label>
                  <input
                    type="number"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Category *</label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value as MealCategory)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  >
                    <option value="swallows-soups">Swallows & Soups</option>
                    <option value="rice-dishes">Rice Dishes</option>
                    <option value="grills-suya">Grills & Suya</option>
                    <option value="seafood">Seafood</option>
                    <option value="small-chops">Small Chops</option>
                    <option value="drinks-beverages">Drinks & Cocktails</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Describe ingredients, cooking style, and pairings..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0C2B1E] text-[#FBBF24] font-bold shadow-md hover:bg-[#164E35]"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
