import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Bankole Elegbede',
      location: 'Lekki Phase 1, Lagos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      dish: 'Amala & Ewedu with Catfish',
      rating: 5,
      comment:
        'The Amala was silky smooth with zero lumps, and the catfish was fresh and tender. Tasted just like an authentic Ibadan high-table meal, but packaged so cleanly and delivered in 25 minutes.',
    },
    {
      name: 'Dr. Chioma Nwachukwu',
      location: 'Victoria Island, Lagos',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      dish: 'Native Seafood Okro Royal Bowl',
      rating: 5,
      comment:
        'Ordered the Seafood Okro at 1:45 AM after late hospital rounds. The rider had thermal hot bags, so the crabs and tiger prawns arrived bubbling hot! Best 24/7 food delivery in Lagos without question.',
    },
    {
      name: 'Alhaji Garba Usman',
      location: 'Wuse II, Abuja',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      dish: 'Lagos Street Suya & Jollof Combo',
      rating: 5,
      comment:
        'The roasted yaji on the suya was authentic Northern quality—nutty, spicy, and perfectly charred over coal. Their Chop Club loyalty system already earned me two free orders!',
    },
  ];

  return (
    <section className="py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-[#F59E0B]">
            WHAT NIGERIAN FOODIES SAY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-['Playfair_Display',serif]">
            Loved by 10,000+ Hungry Customers
          </h2>
          <p className="text-stone-600 text-sm">
            Hear from our regulars enjoying 24/7 swallows and grills across Lagos and Abuja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-stone-200" />
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border border-amber-300"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{rev.name}</h4>
                  <p className="text-[11px] text-stone-500">{rev.location}</p>
                  <p className="text-[10px] text-emerald-800 font-bold mt-0.5">Favorite: {rev.dish}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
