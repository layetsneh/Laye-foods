import {
  MenuItem,
  Order,
  UserProfile,
  AppNotification,
  ContactMessage,
  AuditLogItem,
  OrderStatus,
  OrderTimelineItem,
  CourierDetails,
} from '../types';
import { INITIAL_MENU_ITEMS } from '../data/menuData';
import { sounds } from './soundEffects';
import { syncOrderToSupabase, syncContactMessageToSupabase } from './supabase';

const STORAGE_KEYS = {
  MENU: 'laye_foods_menu_v3',
  ORDERS: 'laye_foods_orders_v1',
  USER: 'laye_foods_user_v1',
  IS_LOGGED_IN: 'laye_foods_is_logged_in_v1',
  ACTIVE_ORDER_ID: 'laye_foods_active_order_id_v1',
  NOTIFICATIONS: 'laye_foods_notifications_v1',
  CONTACT_MESSAGES: 'laye_foods_contact_messages_v1',
  AUDIT_LOGS: 'laye_foods_audit_logs_v1',
  PUSH_ENABLED: 'laye_foods_push_permission_v1',
};

export const INITIAL_USER: UserProfile = {
  id: 'usr-901',
  name: 'Tola Adebayo',
  email: 'tola.adebayo@gmail.com',
  phone: '+234 803 456 7890',
  role: 'customer',
  tier: 'Silver Connoisseur',
  loyaltyPoints: 340,
  totalOrdersCount: 6,
  totalSpent: 48500,
  addresses: [
    {
      id: 'addr-01',
      label: 'Home',
      address: 'Plot 14B, Bishop Oluwole Street, Victoria Island',
      zone: 'Victoria Island / Ikoyi',
      landmark: 'Opposite Eko Hotel Gate 3',
      isDefault: true,
    },
    {
      id: 'addr-02',
      label: 'Office',
      address: 'Ocean Crest Tower, Admiralty Way, Lekki Phase 1',
      zone: 'Lekki Phase 1 / Oniru',
      landmark: '4th Floor, Suite 402',
      isDefault: false,
    },
  ],
  favorites: ['lf-01', 'lf-02', 'lf-05', 'lf-07'],
};

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Diner',
  email: '',
  phone: '',
  role: 'customer',
  tier: 'Bronze Foodie',
  loyaltyPoints: 0,
  totalOrdersCount: 0,
  totalSpent: 0,
  addresses: [],
  favorites: [],
};

export const DEMO_USERS: Record<string, UserProfile> = {
  regular: INITIAL_USER,
  vip: {
    id: 'usr-vip-77',
    name: 'Chief Emeka Obi',
    email: 'emeka.obi@nigeriaenergy.ng',
    phone: '+234 802 888 9911',
    role: 'customer',
    tier: 'Gold Chop Master',
    loyaltyPoints: 1850,
    totalOrdersCount: 28,
    totalSpent: 265000,
    addresses: [
      {
        id: 'addr-vip-1',
        label: 'Ikoyi Penthouse',
        address: 'Bourdillon Road, Old Ikoyi',
        zone: 'Victoria Island / Ikoyi',
        landmark: 'White high-rise near Southern Sun',
        isDefault: true,
      },
    ],
    favorites: ['lf-02', 'lf-04', 'lf-08', 'lf-10'],
    dietaryPreferences: ['Extra Pepper', 'Pescatarian'],
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Chef Babatunde (Kitchen Head)',
    email: 'kitchen.manager@layefoods.ng',
    phone: '+234 814 111 2233',
    role: 'admin',
    tier: 'Gold Chop Master',
    loyaltyPoints: 9999,
    totalOrdersCount: 140,
    totalSpent: 890000,
    addresses: [
      {
        id: 'addr-hq',
        label: 'Central Kitchen',
        address: '14 Karimu Kotun St, Victoria Island, Lagos',
        zone: 'Victoria Island / Ikoyi',
        landmark: 'Laye Foods Culinary HQ',
        isDefault: true,
      },
    ],
    favorites: ['lf-01', 'lf-04', 'lf-07'],
  },
};

const DEFAULT_COURIER: CourierDetails = {
  name: 'Tunde Bakare',
  phone: '+234 809 123 4567',
  vehicle: 'Honda Ace 125 (Thermal Food Box Bike)',
  plateNumber: 'LAG-482-VI',
  rating: 4.95,
  currentLat: 6.4281,
  currentLng: 3.4219,
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '#LF-9482',
    customerId: 'usr-901',
    customerName: 'Tola Adebayo',
    customerPhone: '+234 803 456 7890',
    customerEmail: 'tola.adebayo@gmail.com',
    deliveryType: 'delivery',
    deliveryZone: 'Victoria Island / Ikoyi',
    deliveryAddress: 'Plot 14B, Bishop Oluwole Street, Victoria Island',
    landmark: 'Opposite Eko Hotel Gate 3',
    items: [
      {
        cartItemId: 'c-seed-1',
        menuItemId: 'lf-01',
        name: 'Amala & Ewedu with Shrimps & Catfish',
        image: '/assets/aistudio/amala_6da2a111.jpg',
        basePrice: 5020,
        selectedPortion: { name: 'Standard Plate', priceModifier: 0, description: '' },
        selectedProtein: { name: 'Fresh Catfish & Shrimps (Default)', extraPrice: 0 },
        selectedSwallow: { name: 'Amala Dudu (Oyo Yam Flour)', extraPrice: 0 },
        selectedSpiceLevel: 'hot',
        selectedAddons: [{ id: 'add-dodo', name: 'Fried Sweet Plantain (Dodo)', price: 1000 }],
        unitPrice: 6020,
        quantity: 1,
        totalPrice: 6020,
      },
      {
        cartItemId: 'c-seed-2',
        menuItemId: 'lf-10',
        name: 'Signature Lagos Chapman Mocktail',
        image: '/assets/aistudio/mocktail_f44a7ab8.jpg',
        basePrice: 1500,
        selectedPortion: { name: 'Mason Jar (500ml)', priceModifier: 0, description: '' },
        selectedSpiceLevel: 'mild',
        selectedAddons: [],
        unitPrice: 1500,
        quantity: 1,
        totalPrice: 1500,
      },
    ],
    subtotal: 7520,
    deliveryFee: 1500,
    discountAmount: 0,
    loyaltyPointsUsed: 0,
    loyaltyDiscount: 0,
    totalAmount: 9020,
    paymentMethod: 'paystack_card',
    paymentStatus: 'paid',
    orderStatus: 'out_for_delivery',
    timeline: [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Customer sent order with Paystack Card verification',
        timestamp: '18 mins ago',
        completed: true,
      },
      {
        status: 'confirmed',
        title: 'Payment Confirmed',
        description: '₦9,020 received and verified by server',
        timestamp: '16 mins ago',
        completed: true,
      },
      {
        status: 'preparing',
        title: 'Kitchen Fire on!',
        description: 'Chef packaged fresh Ewedu & piping hot Amala',
        timestamp: '10 mins ago',
        completed: true,
      },
      {
        status: 'out_for_delivery',
        title: 'Rider Dispatched',
        description: 'Rider Tunde is en route with thermal hot bag',
        timestamp: '4 mins ago',
        completed: true,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Meal handed over to customer',
        timestamp: 'Est. in 12 mins',
        completed: false,
      },
    ],
    courier: DEFAULT_COURIER,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: '12 - 15 mins',
    loyaltyPointsEarned: 90,
  },
  {
    id: 'ord-1002',
    orderNumber: '#LF-8921',
    customerId: 'usr-901',
    customerName: 'Tola Adebayo',
    customerPhone: '+234 803 456 7890',
    customerEmail: 'tola.adebayo@gmail.com',
    deliveryType: 'delivery',
    deliveryZone: 'Victoria Island / Ikoyi',
    deliveryAddress: 'Plot 14B, Bishop Oluwole Street, Victoria Island',
    items: [
      {
        cartItemId: 'c-seed-3',
        menuItemId: 'lf-02',
        name: 'Poundo Yam & Egusi with Chicken & Shaki',
        image: '/assets/aistudio/poundo_and_egusi_e24b4767.jpg',
        basePrice: 6820,
        selectedPortion: { name: 'Standard Meal', priceModifier: 0, description: '' },
        selectedSpiceLevel: 'medium',
        selectedAddons: [],
        unitPrice: 6820,
        quantity: 2,
        totalPrice: 13640,
      },
    ],
    subtotal: 13640,
    deliveryFee: 1500,
    discountAmount: 1000,
    promoCodeApplied: 'CHOPBELLEFULL',
    loyaltyPointsUsed: 0,
    loyaltyDiscount: 0,
    totalAmount: 14140,
    paymentMethod: 'pod_pos',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    timeline: [
      { status: 'pending', title: 'Order Placed', description: '', timestamp: 'Yesterday', completed: true },
      { status: 'confirmed', title: 'Order Confirmed', description: '', timestamp: 'Yesterday', completed: true },
      { status: 'preparing', title: 'Kitchen Prepared', description: '', timestamp: 'Yesterday', completed: true },
      { status: 'out_for_delivery', title: 'Out for Delivery', description: '', timestamp: 'Yesterday', completed: true },
      { status: 'delivered', title: 'Delivered Successfully', description: '', timestamp: 'Yesterday', completed: true },
    ],
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: 'Delivered',
    loyaltyPointsEarned: 140,
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🛵 Rider Tunde is on the way!',
    message: 'Your order #LF-9482 (Amala & Ewedu) is hot in transit. Estimated arrival: 12 mins.',
    timestamp: '4 mins ago',
    type: 'order',
    read: false,
    orderId: 'ord-1001',
  },
  {
    id: 'notif-2',
    title: '⭐ 90 Chop Points Credited!',
    message: 'You earned 90 loyalty points on your recent order. Keep chopping to reach Gold Tier!',
    timestamp: '18 mins ago',
    type: 'loyalty',
    read: false,
  },
  {
    id: 'notif-3',
    title: '🔥 Weekend Suya & Jollof Bonanza',
    message: 'Use promo code NAIJA247 for free delivery on orders above ₦6,000.',
    timestamp: '2 hours ago',
    type: 'promo',
    read: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-01',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    adminName: 'Chef Babatunde',
    action: 'Stock Replenished',
    details: 'Fresh catfish and crayfish restocked from Oron port supply.',
  },
  {
    id: 'aud-02',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    adminName: 'Kitchen Manager',
    action: 'Order Dispatched',
    details: 'Order #LF-9482 assigned to Courier Tunde Bakare (Bike LAG-482-VI).',
  },
];

const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'Funke Oladipo',
    email: 'funke.o@fintechlagos.com',
    phone: '+234 802 334 5566',
    subject: 'Corporate Lunch Catering (50 Packs)',
    message: 'Good day Laye Foods team, do you provide customized branded party packs of Jollof & Asun for our tech team demo day in VI next Thursday?',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
    replyStatus: 'pending',
  },
];

export const getStoredMenu = (): MenuItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (raw) {
      const parsed: MenuItem[] = JSON.parse(raw);
      // Ensure all standard menu items use current authentic uploaded images
      const initialMap = new Map(INITIAL_MENU_ITEMS.map((m) => [m.id, m.image]));
      const updated = parsed.map((item) => {
        const freshImage = initialMap.get(item.id);
        return freshImage ? { ...item, image: freshImage } : item;
      });
      return updated;
    }
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
  return INITIAL_MENU_ITEMS;
};

export const saveStoredMenu = (menu: MenuItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_SEED_ORDERS));
  return INITIAL_SEED_ORDERS;
};

export const saveStoredOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  if (orders.length > 0) {
    syncOrderToSupabase(orders[0]).catch(() => {});
  }
};

export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  return INITIAL_USER;
};

export const saveStoredUser = (user: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getStoredIsLoggedIn = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // If not explicitly set yet, check if a stored user exists from prior sessions
    const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
    if (userRaw) {
      const u = JSON.parse(userRaw);
      return Boolean(u && u.id && u.id !== 'guest');
    }
  } catch {
    //
  }
  return true;
};

export const saveStoredIsLoggedIn = (isLoggedIn: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
};

export const getActiveOrderId = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
    if (raw) return raw;
  } catch {
    //
  }
  return 'ord-1001';
};

export const setActiveOrderId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER_ID, id);
};

export const getStoredNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifs: AppNotification[]): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};

export const getStoredAuditLogs = (): AuditLogItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
};

export const saveStoredAuditLogs = (logs: AuditLogItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
};

export const getStoredContactMessages = (): ContactMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(INITIAL_CONTACT_MESSAGES));
  return INITIAL_CONTACT_MESSAGES;
};

export const saveStoredContactMessages = (msgs: ContactMessage[]): void => {
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(msgs));
  if (msgs.length > 0) {
    syncContactMessageToSupabase(msgs[0]).catch(() => {});
  }
};

/**
 * Trigger an in-app + browser push notification
 */
export const triggerPushNotification = (
  title: string,
  message: string,
  type: AppNotification['type'] = 'order',
  orderId?: string
) => {
  sounds.playNotification();

  // 1. Add to in-app notification center
  const existing = getStoredNotifications();
  const newNotif: AppNotification = {
    id: 'notif-' + Date.now(),
    title,
    message,
    timestamp: 'Just now',
    type,
    read: false,
    orderId,
  };
  saveStoredNotifications([newNotif, ...existing]);

  // 2. Dispatch custom event for real-time React UI updates
  window.dispatchEvent(new CustomEvent('laye_notification', { detail: newNotif }));

  // 3. Web Push API if granted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch {
        // Ignored
      }
    }
  }
};
