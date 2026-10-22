import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  CartItem,
  Order,
  UserProfile,
  DeliveryZone,
  MealCategory,
  AppNotification,
} from './types';
import {
  getStoredMenu,
  getStoredOrders,
  saveStoredOrders,
  getStoredUser,
  saveStoredUser,
  getStoredIsLoggedIn,
  saveStoredIsLoggedIn,
  GUEST_USER,
  getActiveOrderId,
  setActiveOrderId,
  getStoredNotifications,
  saveStoredNotifications,
  triggerPushNotification,
} from './services/storage';
import { sounds } from './services/soundEffects';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Home Components
import { HeroSection } from './components/home/HeroSection';
import { FeaturedSection } from './components/home/FeaturedSection';
import { HowItWorks } from './components/home/HowItWorks';
import { Testimonials } from './components/home/Testimonials';

// Menu & Customizer Components
import { MenuPage } from './components/menu/MenuPage';
import { MealCustomizerModal } from './components/menu/MealCustomizerModal';

// Cart & Checkout Components
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';

// Tracking & Admin Components
import { OrderTrackingView } from './components/tracking/OrderTrackingView';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals
import { ChopClubModal } from './components/loyalty/ChopClubModal';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ContactModal } from './components/contact/ContactModal';
import { AboutModal } from './components/about/AboutModal';

// Auth Components
import { AuthPage } from './components/auth/AuthPage';
import { HomeAuthBanner } from './components/home/HomeAuthBanner';

// AI Assistant
import { ChefLayeChat } from './components/ai/ChefLayeChat';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [targetCategory, setTargetCategory] = useState<MealCategory>('all');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Core Data
  const [menu, setMenu] = useState<MenuItem[]>(getStoredMenu());
  const [orders, setOrders] = useState<Order[]>(getStoredOrders());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStoredIsLoggedIn());
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications());
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>('Victoria Island / Ikoyi');

  // Active Order for tracking
  const [activeOrderId, setActiveOrderIdState] = useState<string>(getActiveOrderId());
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || null;

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('laye_foods_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Discounts & Loyalty
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedMealForCustomizer, setSelectedMealForCustomizer] = useState<MenuItem | null>(null);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Floating notification toast
  const [floatingToast, setFloatingToast] = useState<{ title: string; message: string } | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('laye_foods_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Listen for real-time notification events
  useEffect(() => {
    const handleNotificationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (customEvent.detail) {
        setNotifications((prev) => [customEvent.detail, ...prev]);
        setFloatingToast({
          title: customEvent.detail.title,
          message: customEvent.detail.message,
        });
        setTimeout(() => setFloatingToast(null), 5000);
      }
    };

    window.addEventListener('laye_notification', handleNotificationEvent);
    return () => window.removeEventListener('laye_notification', handleNotificationEvent);
  }, []);

  // Quick add standard plate
  const handleQuickAdd = (item: MenuItem) => {
    sounds.playAddToCart();
    const standardPortion = item.portions[0] || { name: 'Standard Plate', priceModifier: 0, description: '' };
    const defaultProtein = item.proteinChoices && item.proteinChoices.length > 0 ? item.proteinChoices[0] : undefined;
    const defaultSwallow = item.swallowChoices && item.swallowChoices.length > 0 ? item.swallowChoices[0] : undefined;

    const unitPrice = item.basePrice + (defaultProtein?.extraPrice || 0) + (defaultSwallow?.extraPrice || 0);

    const newCartItem: CartItem = {
      cartItemId: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.basePrice,
      selectedPortion: standardPortion,
      selectedProtein: defaultProtein,
      selectedSwallow: defaultSwallow,
      selectedSpiceLevel: item.spiceLevel,
      selectedAddons: [],
      unitPrice,
      quantity: 1,
      totalPrice: unitPrice,
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  // Add customized item
  const handleAddCustomizedItem = (customizedItem: CartItem) => {
    setCart((prev) => [...prev, customizedItem]);
    setIsCartOpen(true);
  };

  // Quantity adjustments
  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // When order completed at checkout
  const handleOrderCompleted = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    setActiveOrderIdState(newOrder.id);
    setActiveOrderId(newOrder.id);

    // Update user stats
    const updatedUser: UserProfile = {
      ...user,
      loyaltyPoints: user.loyaltyPoints - newOrder.loyaltyPointsUsed + newOrder.loyaltyPointsEarned,
      totalOrdersCount: user.totalOrdersCount + 1,
      totalSpent: user.totalSpent + newOrder.totalAmount,
    };
    setUser(updatedUser);
    saveStoredUser(updatedUser);

    // Transition to tracking tab
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (order: Order) => {
    sounds.playAddToCart();
    const clonedItems: CartItem[] = order.items.map((it) => ({
      ...it,
      cartItemId: 'reord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    }));
    setCart(clonedItems);
    setIsCartOpen(true);
  };

  const handleOpenItemDetails = (item: MenuItem) => {
    setSelectedMealForCustomizer(item);
    setIsCustomizerOpen(true);
  };

  const handleToggleFavorite = (itemId: string) => {
    const isFav = user.favorites.includes(itemId);
    const updatedFavs = isFav
      ? user.favorites.filter((id) => id !== itemId)
      : [...user.favorites, itemId];

    const updatedUser = { ...user, favorites: updatedFavs };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setCurrentTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    sounds.playTabSwitch();
    setIsLoggedIn(false);
    saveStoredIsLoggedIn(false);
    setUser(GUEST_USER);
    saveStoredUser(GUEST_USER);
    setFloatingToast({
      title: '👋 Signed Out',
      message: 'You have been signed out. Explore our menu anytime!',
    });
    setTimeout(() => setFloatingToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-stone-900 selection:bg-[#F59E0B] selection:text-gray-950">
      
      {/* Real-time floating push alert toast */}
      {floatingToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#0C2B1E] text-white border-2 border-[#F59E0B] rounded-2xl p-4 shadow-2xl max-w-sm flex items-start gap-3 animate-bounce">
          <span className="text-2xl">🔔</span>
          <div className="flex-1 min-w-0 text-xs">
            <h4 className="font-bold text-[#FBBF24]">{floatingToast.title}</h4>
            <p className="text-emerald-100 mt-0.5 leading-relaxed">{floatingToast.message}</p>
          </div>
          <button
            onClick={() => setFloatingToast(null)}
            className="text-stone-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        setIsUserModalOpen={setIsUserModalOpen}
        setIsLoyaltyModalOpen={setIsLoyaltyModalOpen}
        notifications={notifications}
        setIsNotifCenterOpen={setIsNotifCenterOpen}
        hasActiveOrder={!!activeOrder && activeOrder.orderStatus !== 'delivered'}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        onSearchClick={() => {
          setCurrentTab('menu');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <>
            <HeroSection
              onOrderNowClick={() => {
                setCurrentTab('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCategory={(cat) => {
                setTargetCategory(cat);
                setCurrentTab('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenItem={handleOpenItemDetails}
              featuredItems={menu.filter((m) => m.isPopular)}
            />

            <FeaturedSection
              menu={menu}
              onOpenDetails={handleOpenItemDetails}
              onQuickAdd={handleQuickAdd}
              favorites={user.favorites}
              onToggleFavorite={handleToggleFavorite}
              onViewAllMenu={() => {
                setCurrentTab('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* User Login & Sign Up Portal on the Home Page */}
            <HomeAuthBanner
              user={user}
              isLoggedIn={isLoggedIn}
              onOpenAuth={handleOpenAuth}
              onOpenProfile={() => setIsUserModalOpen(true)}
              onOpenLoyalty={() => setIsLoyaltyModalOpen(true)}
              onLogout={handleLogout}
            />

            <HowItWorks />

            <Testimonials />
          </>
        )}

        {/* VIEW: USER AUTHENTICATION (LOGIN & SIGN UP PAGE) */}
        {currentTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            currentUser={user}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            onAuthSuccess={(authedUser) => {
              setUser(authedUser);
              setIsLoggedIn(true);
              saveStoredUser(authedUser);
              saveStoredIsLoggedIn(true);
              setCurrentTab('home');
            }}
            onNavigateHome={() => setCurrentTab('home')}
          />
        )}

        {/* VIEW 2: FULL MENU */}
        {currentTab === 'menu' && (
          <MenuPage
            menu={menu}
            onOpenDetails={handleOpenItemDetails}
            onQuickAdd={handleQuickAdd}
            favorites={user.favorites}
            onToggleFavorite={handleToggleFavorite}
            initialCategory={targetCategory}
          />
        )}

        {/* VIEW 3: LIVE ORDER TRACKING */}
        {currentTab === 'tracking' && (
          <OrderTrackingView
            activeOrder={activeOrder}
            onSelectOrder={(ord) => {
              setActiveOrderIdState(ord.id);
              setActiveOrderId(ord.id);
            }}
            onReorder={handleReorder}
          />
        )}

        {/* VIEW 4: ADMIN DASHBOARD (SEPARATE DEDICATED PAGE) */}
        {currentTab === 'admin' && (
          <AdminDashboard
            onBackToStore={() => setCurrentTab('home')}
            onSelectOrderToTrack={(ord) => {
              setActiveOrderIdState(ord.id);
              setActiveOrderId(ord.id);
              setCurrentTab('tracking');
            }}
          />
        )}

        {/* VIEW 5: ABOUT */}
        {currentTab === 'about' && (
          <div className="py-12">
            <AboutModal
              isOpen={true}
              onClose={() => setCurrentTab('home')}
              onExploreMenu={() => setCurrentTab('menu')}
            />
          </div>
        )}

        {/* VIEW 6: CONTACT */}
        {currentTab === 'contact' && (
          <div className="py-12">
            <ContactModal
              isOpen={true}
              onClose={() => setCurrentTab('home')}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        setCurrentTab={setCurrentTab}
        setIsLoyaltyModalOpen={setIsLoyaltyModalOpen}
        setIsContactModalOpen={setIsContactModalOpen}
        setIsAboutModalOpen={setIsAboutModalOpen}
        onOpenAuth={handleOpenAuth}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOpenProfile={() => setIsUserModalOpen(true)}
      />

      {/* Floating AI Assistant ("Chef Laye") */}
      <ChefLayeChat
        onOpenItemModal={handleOpenItemDetails}
        onNavigateToTracking={(orderId) => {
          if (orderId) {
            setActiveOrderIdState(orderId);
            setActiveOrderId(orderId);
          }
          setCurrentTab('tracking');
        }}
        onOpenContact={() => setIsContactModalOpen(true)}
        currentOrderId={activeOrder?.id}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        user={user}
        selectedZone={selectedZone}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        appliedPromo={appliedPromo}
        setAppliedPromo={setAppliedPromo}
        useLoyaltyPoints={useLoyaltyPoints}
        setUseLoyaltyPoints={setUseLoyaltyPoints}
        loyaltyPointsToUse={user.loyaltyPoints}
      />

      {/* Meal Customization Modal */}
      <MealCustomizerModal
        item={selectedMealForCustomizer}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedMealForCustomizer(null);
        }}
        onAddToCart={handleAddCustomizedItem}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        appliedPromo={appliedPromo}
        useLoyaltyPoints={useLoyaltyPoints}
        loyaltyPointsToUse={user.loyaltyPoints}
        onOrderCompleted={handleOrderCompleted}
        onClearCart={() => setCart([])}
      />

      {/* Chop Club Loyalty Modal */}
      <ChopClubModal
        isOpen={isLoyaltyModalOpen}
        onClose={() => setIsLoyaltyModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onApplyRewardCode={(code) => {
          setPromoCode(code);
          setIsLoyaltyModalOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Notification Center Popover */}
      <NotificationCenter
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        onNavigateToOrder={(ordId) => {
          setActiveOrderIdState(ordId);
          setActiveOrderId(ordId);
          setCurrentTab('tracking');
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
        orders={orders}
        onSelectOrderToTrack={(ord) => {
          setActiveOrderIdState(ord.id);
          setActiveOrderId(ord.id);
          setCurrentTab('tracking');
        }}
        onReorder={handleReorder}
        onLogout={handleLogout}
      />

      {/* Contact & FAQ Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onExploreMenu={() => {
          setIsAboutModalOpen(false);
          setCurrentTab('menu');
        }}
      />

    </div>
  );
}
