import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile, DeliveryZone } from '../../types';
import { DELIVERY_ZONES } from '../../data/menuData';
import { DEMO_USERS, saveStoredUser, saveStoredIsLoggedIn, triggerPushNotification } from '../../services/storage';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { sounds } from '../../services/soundEffects';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
  initialMode?: 'signin' | 'signup';
  currentUser?: UserProfile;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onNavigateHome,
  initialMode = 'signin',
  currentUser,
  isLoggedIn = false,
  onLogout,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>('Victoria Island / Ikoyi');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Click quick login for testing
  const handleQuickDemoLogin = (userKey: 'regular' | 'vip') => {
    const target = DEMO_USERS[userKey];
    if (target) {
      saveStoredUser(target);
      saveStoredIsLoggedIn(true);
      onAuthSuccess(target);
      sounds.playSuccessFanfare();
      triggerPushNotification(
        `Welcome back, ${target.name.split(' ')[0]}!`,
        `You have ${target.loyaltyPoints} Chop Club points in your wallet.`,
        'loyalty'
      );
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signInEmail.trim(),
          password: signInPassword.trim(),
        });
        if (!error && data.user) {
          const authenticatedUser: UserProfile = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || signInEmail.split('@')[0],
            email: data.user.email || signInEmail,
            phone: data.user.user_metadata?.phone || '+234 803 123 4567',
            role: 'customer',
            tier: 'Silver Connoisseur',
            loyaltyPoints: 340,
            totalOrdersCount: 6,
            totalSpent: 48500,
            addresses: [
              {
                id: 'addr-' + Date.now(),
                label: 'Home',
                address: 'Victoria Island, Lagos',
                zone: 'Victoria Island / Ikoyi',
                isDefault: true,
              },
            ],
            favorites: ['lf-01', 'lf-02'],
          };
          saveStoredUser(authenticatedUser);
          saveStoredIsLoggedIn(true);
          onAuthSuccess(authenticatedUser);
          sounds.playSuccessFanfare();
          return;
        }
      }

      // 2. Local fallback login
      const loggedUser: UserProfile = {
        id: 'usr-' + Date.now(),
        name: signInEmail.split('@')[0].replace('.', ' '),
        email: signInEmail.trim(),
        phone: '+234 803 456 7890',
        role: 'customer',
        tier: 'Bronze Foodie',
        loyaltyPoints: 100,
        totalOrdersCount: 1,
        totalSpent: 9020,
        addresses: [
          {
            id: 'addr-default',
            label: 'Home',
            address: 'Victoria Island, Lagos',
            zone: 'Victoria Island / Ikoyi',
            isDefault: true,
          },
        ],
        favorites: ['lf-01', 'lf-02'],
      };

      saveStoredUser(loggedUser);
      saveStoredIsLoggedIn(true);
      onAuthSuccess(loggedUser);
      sounds.playSuccessFanfare();
      triggerPushNotification(
        `Welcome to Laye Foods, ${loggedUser.name}!`,
        'Logged in successfully. Explore our piping-hot menu.',
        'system'
      );
    } catch {
      setErrorMsg('Login failed. Please check credentials or use Quick Demo Login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth SignUp
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: signUpEmail.trim(),
          password: signUpPassword.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              zone: selectedZone,
            },
          },
        });
        if (error) {
          console.warn('Supabase signup notice:', error.message);
        }
      }

      // Create new customer profile with 50 welcome points
      const newUser: UserProfile = {
        id: 'usr-' + Date.now(),
        name: fullName.trim(),
        email: signUpEmail.trim(),
        phone: phone.trim() || '+234 803 000 0000',
        role: 'customer',
        tier: 'Bronze Foodie',
        loyaltyPoints: 50, // Welcome bonus points!
        totalOrdersCount: 0,
        totalSpent: 0,
        addresses: [
          {
            id: 'addr-new',
            label: 'Home',
            address: selectedZone,
            zone: selectedZone,
            isDefault: true,
          },
        ],
        favorites: ['lf-01', 'lf-05'],
        dietaryPreferences: ['Fresh Native Ingredients'],
      };

      saveStoredUser(newUser);
      saveStoredIsLoggedIn(true);
      onAuthSuccess(newUser);
      sounds.playSuccessFanfare();

      triggerPushNotification(
        `🎉 Account Created! +50 Chop Points Added`,
        `Welcome to the Laye Foods Chop Club! Use code LAYEFIRST for 10% off your first meal.`,
        'loyalty'
      );
    } catch {
      setErrorMsg('Could not complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-fade-in text-stone-800">
      
      {/* Outer Card with 2 columns on desktop */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Brand Imagery & Welcome Pitch (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0C2B1E] via-[#082016] to-[#04120d] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black border border-amber-500/50 shadow-md flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Laye_Foods_Chef_Logo_08b3c5a4.png"
                  alt="Laye Foods Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  Laye <span className="text-[#F59E0B]">Foods</span>
                </h3>
                <p className="text-[10px] font-bold text-[#FBBF24] tracking-wider uppercase">
                  Good Food • Better Mood
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <span className="inline-block bg-[#F59E0B]/20 text-[#FBBF24] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
                ⭐ Chop Club Member Benefits
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-['Playfair_Display',serif] leading-tight">
                {mode === 'signin' ? 'Welcome Back to Your Feast' : 'Join the Inner Circle of Nigerian Foodies'}
              </h2>
              <p className="text-emerald-100/80 text-xs leading-relaxed">
                Enjoy 24/7 piping-hot delivery across Lagos & Abuja, track your dispatch rider in real-time, and earn Chop Points for every bite.
              </p>
            </div>
          </div>

          {/* Member perks checklist */}
          <div className="relative z-10 pt-8 space-y-2.5 text-xs text-emerald-200/90 border-t border-emerald-900/60 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              <span>10% Welcome Discount (Code: LAYEFIRST)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              <span>Earn 10 Chop Points per ₦1,000 spent</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              <span>Save multiple delivery addresses for instant checkout</span>
            </div>
          </div>

          <div className="relative z-10 pt-6">
            <button
              onClick={onNavigateHome}
              className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>← Back to Storefront Menu</span>
            </button>
          </div>
        </div>

        {/* Right Side: Auth Forms (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          <div>
            {isLoggedIn && currentUser && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold">Currently signed in as {currentUser.name}</p>
                    <p className="text-[11px] text-emerald-700">{currentUser.email || currentUser.phone} • {currentUser.tier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Go to Menu
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mode Toggle Switch */}
            <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Create Account (Free)
              </button>
            </div>

            {/* Error / Success Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Email Address or Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. tola.adebayo@gmail.com"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setErrorMsg('Please use one of the Quick Demo Login accounts below for instant access.')}
                      className="text-[11px] text-[#0C2B1E] hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Laye Foods</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Adeleke"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Mobile Phone *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Delivery Zone *</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value as DeliveryZone)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-medium"
                    >
                      {DELIVERY_ZONES.map((z) => (
                        <option key={z.zone} value={z.zone}>{z.zone}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Create Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0C2B1E] bg-stone-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Welcome Gift:</strong> 50 Chop Points will be credited to your new wallet immediately upon sign-up!
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Free Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick 1-Click Demo Accounts Strip */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Fast 1-Click Demo Logins (For Quick Testing):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('regular')}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-all"
              >
                <span className="font-bold text-stone-900 block truncate">Tola Adebayo</span>
                <span className="text-[10px] text-emerald-700">Silver Member (340 pts)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vip')}
                className="p-2.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-left transition-all"
              >
                <span className="font-bold text-amber-950 block truncate">Chief Emeka Obi</span>
                <span className="text-[10px] text-amber-700">VIP Gold Master (1,850 pts)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
