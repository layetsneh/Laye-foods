import React from 'react';
import { ChefHat, CreditCard, Bike, Award, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Pick & Customize Feast',
      desc: 'Select your preferred swallow (smooth amala, poundo, eba), rich native soup, meat cuts, and personal spice heat.',
      icon: ChefHat,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      num: '02',
      title: 'Secure Checkout',
      desc: 'Pay instantly via Paystack card, bank transfer, USSD, or select Cash / POS Card on Delivery upon arrival.',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      num: '03',
      title: 'Live GPS Bike Tracking',
      desc: 'Follow your dedicated motorcycle courier in real-time as your meal travels in heated thermal bags.',
      icon: Bike,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      num: '04',
      title: 'Chop Bellefull & Earn Rewards',
      desc: 'Relish authentic Nigerian cooking and automatically earn Chop Club points for free meals and discounts.',
      icon: Award,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
    },
  ];

  return (
    <section className="py-16 bg-[#082016] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#F59E0B]/20 text-[#FBBF24] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Laye Foods Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-['Playfair_Display',serif]">
            How Ordering Works
          </h2>
          <p className="text-emerald-100/80 text-sm">
            From our kitchen pots to your dining table in four seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-[#0C2B1E] border border-emerald-900/80 rounded-3xl p-6 space-y-4 hover:border-[#F59E0B]/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${st.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-[#F59E0B] opacity-60">
                    {st.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-white">{st.title}</h3>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
