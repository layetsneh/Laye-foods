import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Bell,
  Award,
  User,
  LogIn,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  X,
  Flame,
  Search,
  Sparkles,
  Check,
  Tag,
} from 'lucide-react';
import { UserProfile, CartItem, AppNotification, DeliveryZone } from '../../types';
import { DELIVERY_ZONES } from '../../data/menuData';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  onLogout: () => void;
  setIsUserModalOpen: (open: boolean) => void;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  notifications: AppNotification[];
  setIsNotifCenterOpen: (open: boolean) => void;
  hasActiveOrder: boolean;
  selectedZone: DeliveryZone;
  setSelectedZone: (zone: DeliveryZone) => void;
  onSearchClick: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onApplyPromoCode?: (code: string) => void;
  appliedPromoCode?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cart,
  setIsCartOpen,
  user,
  isLoggedIn,
  onLogout,
  setIsUserModalOpen,
  setIsLoyaltyModalOpen,
  notifications,
  setIsNotifCenterOpen,
  hasActiveOrder,
  selectedZone,
  setSelectedZone,
  onSearchClick,
  onOpenAuth,
  onApplyPromoCode,
  appliedPromoCode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const handleApplyWelcomePromo = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('LAYEFIRST');
      }
    } catch {
      // ignore clipboard error
    }
    setPromoCopied(true);
    if (onApplyPromoCode) {
      onApplyPromoCode('LAYEFIRST');
    }
    setTimeout(() => {
      setPromoCopied(false);
    }, 4500);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu & Dishes' },
    { id: 'tracking', label: 'Order Tracking', badge: hasActiveOrder ? 'LIVE' : undefined },
    { id: 'loyalty', label: 'Chop Club' },
    ...(!isLoggedIn ? [{ id: 'auth', label: 'Login / Sign Up' }] : []),
  ];

  const isLayeFirstApplied = appliedPromoCode === 'LAYEFIRST' || promoCopied;

  return (
    <>
      {/* Top promotional bar - fully interactive and clickable */}
      <div className="bg-[#082016] text-[#FBBF24] border-b border-[#164E35]/60 text-xs py-2 px-3 sm:px-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          
          {/* 24/7 Delivery info button */}
          <button
            type="button"
            onClick={() => {
              setCurrentTab('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Browse all 24/7 authentic Nigerian feasts"
            className="flex items-center gap-2 font-medium tracking-wide hover:text-white transition-colors cursor-pointer group text-left"
          >
            <span className="inline-flex items-center gap-1 bg-[#F59E0B]/20 group-hover:bg-[#F59E0B] group-hover:text-gray-950 text-[#FBBF24] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors shrink-0">
              <Flame className="w-3 h-3 text-[#F59E0B] group-hover:text-gray-950 fill-[#F59E0B] group-hover:fill-gray-950" /> 24/7 Delivery
            </span>
            <span className="group-hover:underline underline-offset-2">
              Hot authentic Nigerian feasts delivered across Lagos & Abuja
            </span>
          </button>

          {/* Right action triggers: Promo Code & Chop Points */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#A7F3D0] flex-wrap justify-center">
            
            {/* Clickable Promo Code pill */}
            <button
              type="button"
              onClick={handleApplyWelcomePromo}
              title="Click to copy & apply code LAYEFIRST for 10% off"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border active:scale-95 shadow-sm ${
                isLayeFirstApplied
                  ? 'bg-emerald-900/90 border-emerald-400 text-emerald-200'
                  : 'bg-[#F59E0B]/15 hover:bg-[#F59E0B]/30 border-[#F59E0B]/60 text-white hover:text-[#FBBF24]'
              }`}
            >
              {isLayeFirstApplied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Code <strong className="text-[#FBBF24] font-bold">LAYEFIRST</strong> Applied (-10%)!</span>
                </>
              ) : (
                <>
                  <Tag className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span>Use Code <strong className="text-white underline decoration-[#F59E0B] font-bold">LAYEFIRST</strong> for 10% Off</span>
                  <span className="text-[9px] bg-[#F59E0B] hover:bg-amber-400 text-gray-950 font-black px-1.5 py-0.5 rounded uppercase ml-0.5 shadow-sm">
                    Apply
                  </span>
                </>
              )}
            </button>

            <span className="hidden sm:inline text-emerald-700">|</span>

            {/* Clickable Chop Points trigger */}
            <button
              type="button"
              onClick={() => setIsLoyaltyModalOpen(true)}
              title="Open Chop Club to see points, tiers and redeem rewards"
              className="flex items-center gap-1.5 hover:text-[#FBBF24] transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] group-hover:rotate-12 transition-transform" />
              <span className="group-hover:underline underline-offset-2">
                Earn 10 Chop Points per ₦1,000
              </span>
              <span className="text-[10px] text-[#FBBF24] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main sticky navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0C2B1E]/95 backdrop-blur-md shadow-xl py-3 border-b border-emerald-900/60'
            : 'bg-[#0C2B1E] py-4 border-b border-emerald-950/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-black border border-amber-500/40 shrink-0">
                  <img
                    src="/assets/aistudio/Laye_Foods_Chef_Logo_08b3c5a4.png"
                    alt="Laye Foods Chef Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#FBBF24] transition-colors">
                      Laye <span className="text-[#F59E0B]">Foods</span>
                    </span>
                  </div>
                  <p className="text-[10px] font-bold tracking-wider text-[#FBBF24] uppercase -mt-0.5">
                    Good Food • Better Mood
                  </p>
                </div>
              </button>

              {/* Delivery Zone Selector pill */}
              <div className="relative hidden lg:block ml-4">
                <button
                  onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                  className="flex items-center gap-1.5 bg-[#082016] hover:bg-[#123e2c] border border-emerald-800/60 text-emerald-100 text-xs px-3 py-1.5 rounded-full transition-all focus:outline-none"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="truncate max-w-[140px] font-medium">{selectedZone}</span>
                  <span className="text-[10px] text-emerald-400">▼</span>
                </button>

                {showZoneDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#082016] border border-emerald-700/60 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Select Delivery Hub
                    </div>
                    {DELIVERY_ZONES.map((z) => (
                      <button
                        key={z.zone}
                        onClick={() => {
                          setSelectedZone(z.zone);
                          setShowZoneDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          selectedZone === z.zone
                            ? 'bg-[#F59E0B] text-gray-950 font-bold'
                            : 'text-gray-200 hover:bg-emerald-900/60'
                        }`}
                      >
                        <span className="truncate">{z.zone}</span>
                        <span className="text-[11px] opacity-80">
                          {z.fee === 0 ? 'Free' : `₦${z.fee.toLocaleString()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.id === 'loyalty') {
                        setIsLoyaltyModalOpen(true);
                      } else if (link.id === 'auth') {
                        onOpenAuth('signin');
                      } else {
                        setCurrentTab(link.id);
                      }
                    }}
                    className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/10 font-semibold'
                        : 'text-emerald-100/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right action controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Search button */}
              <button
                onClick={onSearchClick}
                title="Search meals & ingredients"
                className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifCenterOpen(true)}
                title="Order updates & notifications"
                className="relative p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Chop Club Loyalty Badge */}
              <button
                onClick={() => setIsLoyaltyModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.loyaltyPoints} pts</span>
              </button>

              {/* User Profile / Switcher button */}
              <button
                onClick={() => setIsUserModalOpen(true)}
                title="Customer Profile & Settings"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700/80 text-emerald-100 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden xl:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </button>

              {/* Customer Auth / Sign Out button */}
              {!isLoggedIn ? (
                <button
                  onClick={() => onOpenAuth('signin')}
                  title="Customer Sign In & Register"
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'auth'
                      ? 'bg-[#F59E0B] text-gray-950 shadow-md'
                      : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-[#F59E0B]" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  title={`Signed in as ${user.name}. Click to Sign Out`}
                  aria-label="Sign Out"
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 border border-rose-700/80 hover:border-rose-500 text-rose-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap">Sign Out</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-950" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-950 text-[#FBBF24] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">
                  {cartSubtotal > 0 ? `₦${cartSubtotal.toLocaleString()}` : 'Cart'}
                </span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-900 bg-[#082016] px-4 pt-3 pb-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <MapPin className="w-4 h-4 text-[#F59E0B]" />
                <span>Delivery: {selectedZone}</span>
              </div>
              <button
                onClick={() => {
                  setIsLoyaltyModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#FBBF24] font-semibold flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                {user.loyaltyPoints} Chop Points
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'loyalty') {
                      setIsLoyaltyModalOpen(true);
                    } else if (link.id === 'auth') {
                      onOpenAuth('signin');
                    } else {
                      setCurrentTab(link.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium ${
                    currentTab === link.id
                      ? 'bg-[#F59E0B] text-gray-950 font-bold'
                      : 'bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    onOpenAuth('signin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-[#F59E0B] text-gray-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-amber-400 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              ) : (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Sign Out
                </button>
              )}
              <button
                onClick={() => {
                  setIsUserModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-emerald-900/80 text-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-700/50 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#F59E0B]" />
                My Account
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
