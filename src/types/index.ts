export type MealCategory =
  | 'all'
  | 'swallows-soups'
  | 'rice-dishes'
  | 'grills-suya'
  | 'seafood'
  | 'small-chops'
  | 'drinks-beverages';

export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';

export interface PortionOption {
  name: string;
  priceModifier: number; // e.g. 0 for standard, 2500 for mega
  description: string;
}

export interface ChoiceOption {
  name: string;
  extraPrice: number;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nativeName?: string;
  description: string;
  basePrice: number; // in NGN (₦)
  category: MealCategory;
  image: string;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  spiceLevel: SpiceLevel;
  dietaryTags: ('Halal' | 'Pescatarian' | 'Gluten-Free Swallow' | 'Vegetarian' | 'High Protein' | 'Nut-Free')[];
  allergens: string[];
  portions: PortionOption[];
  proteinChoices?: ChoiceOption[];
  swallowChoices?: ChoiceOption[];
  availableAddons: AddonOption[];
}

export interface CartItem {
  cartItemId: string; // unique instance id
  menuItemId: string;
  name: string;
  image: string;
  basePrice: number;
  selectedPortion: PortionOption;
  selectedProtein?: ChoiceOption;
  selectedSwallow?: ChoiceOption;
  selectedSpiceLevel: SpiceLevel;
  selectedAddons: AddonOption[];
  specialInstructions?: string;
  unitPrice: number; // calculated base + portion + protein + swallow + addons
  quantity: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'pod_cash'
  | 'pod_pos'
  | 'paystack_card'
  | 'bank_transfer'
  | 'ussd';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DeliveryZone =
  | 'Victoria Island / Ikoyi'
  | 'Lekki Phase 1 / Oniru'
  | 'Ajah / Chevron'
  | 'Ikeja GRA / Maryland'
  | 'Surulere / Yaba'
  | 'Abuja Central / Wuse II'
  | 'Garki / Maitama'
  | 'Store Pickup (Victoria Island)';

export interface DeliveryZoneFee {
  zone: DeliveryZone;
  fee: number;
  estMinutes: string;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface CourierDetails {
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  currentLat?: number;
  currentLng?: number;
  photoUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryZone: DeliveryZone;
  deliveryAddress: string;
  landmark?: string;
  deliveryInstructions?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  promoCodeApplied?: string;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  timeline: OrderTimelineItem[];
  courier?: CourierDetails;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime: string;
  loyaltyPointsEarned: number;
}

export type LoyaltyTier = 'Bronze Foodie' | 'Silver Connoisseur' | 'Gold Chop Master';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  tier: LoyaltyTier;
  loyaltyPoints: number;
  totalOrdersCount: number;
  totalSpent: number;
  addresses: {
    id: string;
    label: string; // 'Home' | 'Office' | 'Other'
    address: string;
    zone: DeliveryZone;
    landmark?: string;
    isDefault: boolean;
  }[];
  favorites: string[]; // menuItem IDs
  dietaryPreferences?: string[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  rewardType: 'discount_naira' | 'free_item' | 'free_delivery';
  discountValue?: number;
  freeItemName?: string;
  code: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'loyalty' | 'promo' | 'system';
  read: boolean;
  orderId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  replyStatus: 'pending' | 'resolved';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  recommendedItemId?: string;
}
