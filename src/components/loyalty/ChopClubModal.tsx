import React, { useState } from 'react';
import {
  X,
  Award,
  Sparkles,
  Gift,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile, LoyaltyReward } from '../../types';
import { LOYALTY_REWARDS } from '../../data/loyaltyRewards';
import { triggerPushNotification, saveStoredUser } from '../../services/storage';
import { sounds } from '../../services/soundEffects';

interface ChopClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onApplyRewardCode: (code: string) => void;
}

export const ChopClubModal: React.FC<ChopClubModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onApplyRewardCode,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemedRewardId, setRedeemedRewardId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine tier progress
  let nextTierName = 'Silver Connoisseur';
  let nextTierPoints = 500;
  let progressPct = Math.min(100, Math.round((user.loyaltyPoints / 500) * 100));

  if (user.loyaltyPoints >= 500 && user.loyaltyPoints < 1500) {
    nextTierName = 'Gold Chop Master';
    nextTierPoints = 1500;
    progressPct = Math.min(100, Math.round(((user.loyaltyPoints - 500) / 1000) * 100));
  } else if (user.loyaltyPoints >= 1500) {
    nextTierName = 'Maximum VIP Master';
    nextTierPoints = 1500;
    progressPct = 100;
  }

  const handleRedeem = (reward: LoyaltyReward) => {
    if (user.loyaltyPoints < reward.pointsCost) return;

    sounds.playAddToCart();
    const updatedUser: UserProfile = {
      ...user,
      loyaltyPoints: user.loyaltyPoints - reward.pointsCost,
    };
    saveStoredUser(updatedUser);
    onUpdateUser(updatedUser);

    setRedeemedRewardId(reward.id);
    onApplyRewardCode(reward.code);

    triggerPushNotification(
      `🎁 Reward Claimed: ${reward.title}`,
      `Your code ${reward.code} has been applied to your cart!`,
      'loyalty'
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border border-stone-200 text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-br from-[#0C2B1E] via-[#082016] to-[#04120d] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-gray-950 rounded-2xl shadow-lg">
                <Award className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FBBF24]">
                  Laye Foods Rewards
                </span>
                <h2 className="text-2xl font-black">The Chop Club</h2>
              </div>
            </div>

            {/* Wallet card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-200">Current Points Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#FBBF24]">
                    {user.loyaltyPoints}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Chop Points
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Worth approx. ₦{((Math.floor(user.loyaltyPoints / 100)) * 500).toLocaleString()} in instant discounts
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] text-stone-300 uppercase font-bold block">Current Tier</span>
                <span className="inline-block bg-[#F59E0B] text-gray-950 font-black text-xs px-3 py-1 rounded-full shadow-md mt-1">
                  {user.tier}
                </span>
              </div>
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-emerald-200">
                <span>Tier Milestone</span>
                <span>
                  {user.loyaltyPoints} / {nextTierPoints} pts to {nextTierName}
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* How to earn banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl">
              <span className="text-xl">🍲</span>
              <h4 className="font-bold text-xs text-stone-900 mt-1">1. Chop Delicious Meals</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Earn 10 points per ₦1,000 automatically on every delivery.</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl">
              <span className="text-xl">⭐</span>
              <h4 className="font-bold text-xs text-stone-900 mt-1">2. Level Up Tiers</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Unlock 1.5x point multipliers & free priority delivery.</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl">
              <span className="text-xl">🎁</span>
              <h4 className="font-bold text-xs text-stone-900 mt-1">3. Redeem Treats</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Swap points for cash discounts, puff puff & free drinks.</p>
            </div>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-700" />
                <span>Redeemable Rewards Catalog</span>
              </h3>
              <span className="text-[11px] text-stone-500">Click to apply to cart</span>
            </div>

            <div className="space-y-2.5">
              {LOYALTY_REWARDS.map((reward) => {
                const canAfford = user.loyaltyPoints >= reward.pointsCost;
                const isClaimed = redeemedRewardId === reward.id;

                return (
                  <div
                    key={reward.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      canAfford
                        ? 'border-emerald-200 bg-white hover:border-[#0C2B1E] shadow-sm'
                        : 'border-stone-200 bg-stone-50/70 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 font-bold shrink-0 text-sm">
                        {reward.pointsCost} pts
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">{reward.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">{reward.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                            Code: {reward.code}
                          </span>
                          <button
                            onClick={() => handleCopy(reward.code)}
                            className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
                          >
                            {copiedCode === reward.code ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy className="w-3 h-3" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isClaimed
                            ? 'bg-emerald-600 text-white'
                            : canAfford
                            ? 'bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] shadow-md active:scale-95'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Redeem Reward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier Privileges Overview */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
              Chop Club Tier Perks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-amber-800 block">Bronze Foodie (0-499)</span>
                <p className="text-[11px] text-stone-500">10 pts per ₦1k spent. Access to seasonal menus.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-600 block">Silver Connoisseur (500+)</span>
                <p className="text-[11px] text-stone-500">12 pts per ₦1k spent. 1 free Zobo mocktail voucher.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-300 bg-amber-50/50 space-y-1">
                <span className="font-bold text-amber-700 block">Gold Chop Master (1500+)</span>
                <p className="text-[11px] text-stone-700 font-medium">15 pts per ₦1k. 100% Free delivery & VIP priority dispatch.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
