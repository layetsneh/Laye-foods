import { LoyaltyReward } from '../types';

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew-01',
    title: '₦500 Instant Discount',
    description: 'Slash ₦500 off your current order instantly at checkout.',
    pointsCost: 100,
    rewardType: 'discount_naira',
    discountValue: 500,
    code: 'CHOP500',
  },
  {
    id: 'rew-02',
    title: 'Free Chilled Zobo Supreme',
    description: 'Get a complimentary ice-cold 500ml Zobo Supreme with your meal.',
    pointsCost: 150,
    rewardType: 'free_item',
    freeItemName: 'Chilled Zobo Supreme (500ml)',
    discountValue: 1200,
    code: 'FREEZOBO',
  },
  {
    id: 'rew-03',
    title: 'Free Delivery Voucher',
    description: 'Waive 100% of the delivery dispatch fee for any zone in Lagos or Abuja.',
    pointsCost: 200,
    rewardType: 'free_delivery',
    discountValue: 2000,
    code: 'FREERIDE',
  },
  {
    id: 'rew-04',
    title: 'Free VIP Small Chops Box',
    description: 'Feast on fresh warm puff-puff, samosas, spring rolls, and gizdodo.',
    pointsCost: 280,
    rewardType: 'free_item',
    freeItemName: 'VIP Nigerian Small Chops Platter',
    discountValue: 3200,
    code: 'FREECHOPS',
  },
  {
    id: 'rew-05',
    title: '₦2,500 Big Chop Feast Discount',
    description: 'A heavy ₦2,500 markdown on family packs, seafood bowls, or group orders.',
    pointsCost: 450,
    rewardType: 'discount_naira',
    discountValue: 2500,
    code: 'CHOP2500',
  },
];

export const VALID_PROMO_CODES: Record<string, { type: 'percentage' | 'fixed' | 'free_shipping'; value: number; minSubtotal: number; description: string }> = {
  LAYEFIRST: {
    type: 'percentage',
    value: 10,
    minSubtotal: 3000,
    description: '10% Welcome Discount for your first Laye Foods order',
  },
  CHOPBELLEFULL: {
    type: 'fixed',
    value: 1000,
    minSubtotal: 8000,
    description: '₦1,000 instant discount on orders ₦8,000 and above',
  },
  NAIJA247: {
    type: 'free_shipping',
    value: 2500,
    minSubtotal: 6000,
    description: 'Free priority delivery in Lagos & Abuja',
  },
};
