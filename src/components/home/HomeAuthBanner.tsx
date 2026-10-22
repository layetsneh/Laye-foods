import React from 'react';
import { Sparkles, User, LogIn, LogOut, Award, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface HomeAuthBannerProps {
  user: UserProfile;
  isLoggedIn: boolean;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenProfile?: () => void;
  onOpenLoyalty?: () => void;
  onLogout?: () => void;
}

export const HomeAuthBanner: React.FC<HomeAuthBannerProps> = ({
  user,
  isLoggedIn,
  onOpenAuth,
  onOpenProfile,
  onOpenLoyalty,
  onLogout,
}) => {
  return (
    <section className="py-6 bg-[#082016] border-y border-emerald-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0C2B1E] via-[#092218] to-[#0C2B1E] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left copy */}
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 text-[#FBBF24] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? 'Chop Club Member Lounge' : 'Chop Club Loyalty & Member Privileges'}</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Playfair_Display',serif]">
              {isLoggedIn
                ? `Welcome back, ${user.name}!`
                : 'Join Laye Foods & Chop Bellefull'}
            </h3>

            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl">
              {isLoggedIn ? (
                <>
                  You are recognized as a <strong className="text-[#FBBF24]">{user.tier}</strong> member with{' '}
                  <strong className="text-white">{user.loyaltyPoints} Chop Points</strong> available. Redeem points at checkout for instant cash discounts!
                </>
              ) : (
                'Earn 10 points for every ₦1,000 spent. Redeem points for cash discounts, free puff puff, and cold zobo. New signups receive 50 bonus points instantly!'
              )}
            </p>
          </div>

          {/* Right action buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 shrink-0">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#FBBF24]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-3 rounded-2xl bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Create Account (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenProfile}
                  className="px-5 py-3 rounded-2xl bg-[#F59E0B] hover:bg-[#ea9407] text-gray-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile & Orders</span>
                </button>

                <button
                  onClick={onOpenLoyalty}
                  className="px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-xs hover:bg-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{user.loyaltyPoints} Points</span>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="px-3 py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/50 text-rose-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
