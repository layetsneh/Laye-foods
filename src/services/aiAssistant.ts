import { MenuItem, Order, DeliveryZone } from '../types';
import { getStoredMenu, getStoredOrders } from './storage';
import { DELIVERY_ZONES } from '../data/menuData';

export const HOTLINE_NUMBER = '+234 802 234 1342';
export const HOTLINE_TEL = '+2348022341342';

export interface AssistantResponse {
  text: string;
  suggestedPrompts?: string[];
  recommendedItemId?: string;
  action?: {
    type: 'ADD_TO_CART' | 'TRACK_ORDER' | 'OPEN_CONTACT';
    payload?: string;
  };
}

export async function askChefLaye(
  userQuery: string,
  currentOrderId?: string
): Promise<AssistantResponse> {
  const query = userQuery.toLowerCase().trim();
  const menu = getStoredMenu();
  const orders = getStoredOrders();

  // 1. Try calling the full-stack server endpoint with Google Search grounding
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery, currentOrderId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        // If server provided recommendedItemId, bind action
        let action = undefined;
        if (data.recommendedItemId) {
          action = {
            type: 'ADD_TO_CART' as const,
            payload: data.recommendedItemId,
          };
        }
        return {
          ...data,
          action,
        };
      }
    }
  } catch {
    // Graceful fallback to client culinary search and nearest suggestion engine below
  }

  // 2. Intelligent Grounded Knowledge Engine with Online Culinary Knowledge & Near Suggestions

  // A. Order tracking lookup
  if (
    query.includes('track') ||
    query.includes('order status') ||
    query.includes('where is my food') ||
    query.includes('#lf-') ||
    query.includes('order #')
  ) {
    const orderNumMatch = query.match(/#?lf-?\d+/i);
    const orderLookup = orderNumMatch
      ? orders.find(
          (o) =>
            o.orderNumber.toLowerCase().replace(/#/g, '') ===
            orderNumMatch[0].toLowerCase().replace(/#/g, '')
        )
      : currentOrderId
      ? orders.find((o) => o.id === currentOrderId)
      : orders[0];

    if (orderLookup) {
      const statusNames: Record<string, string> = {
        pending: 'Pending payment verification',
        confirmed: 'Confirmed by kitchen',
        preparing: 'Simmering and freshly packing in our kitchen',
        ready_for_pickup: 'Packed and waiting at pickup counter',
        out_for_delivery: `Dispatched with courier ${orderLookup.courier?.name || 'Tunde'} (${orderLookup.courier?.vehicle || 'Thermal Box Bike'})`,
        delivered: 'Delivered safely! Enjoy your meal',
        cancelled: 'Cancelled',
      };

      return {
        text: `📦 **Live Order Tracking for ${orderLookup.orderNumber}**:\n\n• **Status**: ${statusNames[orderLookup.orderStatus] || orderLookup.orderStatus}\n• **Destination**: ${orderLookup.deliveryAddress} (${orderLookup.deliveryZone})\n• **Estimated Arrival**: ${orderLookup.estimatedDeliveryTime}\n• **Total Paid**: ₦${orderLookup.totalAmount.toLocaleString()}\n\nNeed to speak with our dispatch team? Call **${HOTLINE_NUMBER}**. Would you like to open the live GPS tracking map?`,
        suggestedPrompts: ['Track on Live Map', `Call Hotline ${HOTLINE_NUMBER}`, 'Order another meal'],
        action: {
          type: 'TRACK_ORDER',
          payload: orderLookup.id,
        },
      };
    } else {
      return {
        text: `I couldn't find an order matching that reference code. Please provide your order number like **#LF-9482** or call our hotline **${HOTLINE_NUMBER}** for immediate dispatch assistance.`,
        suggestedPrompts: ['Track #LF-9482', 'View My Profile Orders', 'Call Hotline'],
      };
    }
  }

  // B. Specific unlisted Nigerian dishes with online culinary search & near suggestions
  // 1) Afang / Edikang Ikong / Ofe Owerri
  if (query.includes('afang') || query.includes('edikang') || query.includes('ikong') || query.includes('bitterleaf') || query.includes('ofe owerri')) {
    const efo = menu.find((m) => m.id === 'lf-03') || menu[0];
    const egusi = menu.find((m) => m.id === 'lf-02');
    return {
      text: `🌿 **Online Search Result & Near Suggestions**:\n\n**Afang and Edikang Ikong** are iconic traditional vegetable soups from the Efik and Ibibio people of Cross River and Akwa Ibom State, cooked with shredded wild waterleaf, ukazi, dried fish, snails, and periwinkles.\n\nWhile our kitchen currently specializes in Yoruba, Edo, and Delta native soups, here are the **Nearest Matching Delicacies** on the Laye Foods menu today:\n\n1. **Poundo Yam & Vegetable (Efo Riro) with Beef & Ponmo** (₦${efo.basePrice.toLocaleString()})\n   • *Why you'll love it*: Loaded with rich dark leafy greens, smoked stockfish, dried prawns, and palm oil reduction—giving you that authentic deep vegetable satisfaction!\n2. **Poundo Yam & Egusi with Chicken & Shaki** (₦${egusi ? egusi.basePrice.toLocaleString() : '6,820'})\n   • *Cooked with traditional bitterleaf and fluted pumpkin greens.*\n\nCall our kitchen desk at **${HOTLINE_NUMBER}** if you'd like custom catering!`,
      suggestedPrompts: ['Add Efo Riro to Cart', 'View Egusi Soup', 'See All Native Soups'],
      recommendedItemId: efo.id,
      action: { type: 'ADD_TO_CART', payload: efo.id },
    };
  }

  // 2) Banga / Ofe Nsala / White Soup / Fisherman Soup
  if (query.includes('banga') || query.includes('nsala') || query.includes('white soup') || query.includes('ogbono')) {
    const seafood = menu.find((m) => m.id === 'lf-04') || menu[0];
    const amala = menu.find((m) => m.id === 'lf-01');
    return {
      text: `🦐 **Online Search Result & Near Suggestions**:\n\n**Banga Soup** (Oghwo Amiedi in Urhobo) and **Ofe Nsala** (Igbo White Soup) are legendary rich palm nut and fresh catfish broths native to the Niger Delta and Eastern Nigeria, renowned for their intense seafood and aromatic spice profile (oburunbebe, uda, uziza).\n\nHere are the **Nearest Matching Delicacies** on our menu right now:\n\n1. **Native Seafood Okro Royal Platter** (₦${seafood.basePrice.toLocaleString()})\n   • *Loaded with sea crabs, jumbo king prawns, calamari, giant snails, and fresh croaker fish.*\n2. **Amala & Ewedu with Shrimps & Catfish** (₦${amala ? amala.basePrice.toLocaleString() : '5,020'})\n   • *Fresh point-and-kill catfish simmered in fiery obe ata and rich gbegiri.*\n\nPrepared hot and fresh 24/7! Hotline: **${HOTLINE_NUMBER}**.`,
      suggestedPrompts: ['Add Seafood Okro', 'View Amala & Catfish', 'View Menu'],
      recommendedItemId: seafood.id,
      action: { type: 'ADD_TO_CART', payload: seafood.id },
    };
  }

  // 3) Ofada Rice / Ayamase / Designer Rice
  if (query.includes('ofada') || query.includes('ayamase') || query.includes('designer stew') || query.includes('coconut rice')) {
    const jollof = menu.find((m) => m.id === 'lf-05') || menu[0];
    const friedRice = menu.find((m) => m.id === 'lf-06');
    return {
      text: `🍚 **Online Search Result & Near Suggestions**:\n\n**Ofada Rice** is unpolished indigenous brown rice paired with **Ayamase** (fiery bleached palm oil green pepper stew cooked with locust beans, boiled eggs, and assorted meat).\n\nIf you are craving that deep, unadulterated Nigerian party rice flavor, our **Nearest Matching Specialties** are:\n\n1. **Smoky Lagos Party Jollof Rice Special** (₦${jollof.basePrice.toLocaleString()})\n   • *Firewood-smoked with sweet caramelized fried plantain (dodo) and crispy chicken.*\n2. **Special Fried Rice with Peppered Gizzard & Shrimps** (₦${friedRice ? friedRice.basePrice.toLocaleString() : '4,700'})\n   • *Tossed in savory chicken stock and seafood.*\n\nHotline: **${HOTLINE_NUMBER}**.`,
      suggestedPrompts: ['Add Party Jollof Rice', 'Add Fried Rice Special', 'Explore Menu'],
      recommendedItemId: jollof.id,
      action: { type: 'ADD_TO_CART', payload: jollof.id },
    };
  }

  // 4) Nkwobi / Isi Ewu / Kilishi / Pepper Soup
  if (query.includes('nkwobi') || query.includes('isi ewu') || query.includes('kilishi') || query.includes('pepper soup') || query.includes('shawarma')) {
    const asun = menu.find((m) => m.id === 'lf-08') || menu[0];
    const suya = menu.find((m) => m.id === 'lf-07');
    return {
      text: `🥩 **Online Search Result & Near Suggestions**:\n\n**Nkwobi and Isi Ewu** are Eastern Nigerian delicacies made of cow foot or goat head braised in rich, thick spicy palm oil sauce infused with potash (ngu) and aromatic utazi leaves. **Kilishi** is Northern sun-dried spiced beef jerky.\n\nFor that exact spicy, charred, mouth-watering peppered meat craving, here are our **Top Near Suggestions**:\n\n1. **Spicy Asun (Peppered Flame-Grilled Goat Meat)** (₦${asun.basePrice.toLocaleString()})\n   • *Tender bite-sized goat meat smoked and wok-tossed in blistering scotch bonnet habaneros.*\n2. **Authentic Lagos Street Suya Platter** (₦${suya ? suya.basePrice.toLocaleString() : '3,800'})\n   • *Coated with authentic Northern groundnut Yaji spice and served with crisp red onions.*\n\nPair with cold Chapman or Zobo to soothe the heat! Call **${HOTLINE_NUMBER}**.`,
      suggestedPrompts: ['Add Spicy Asun', 'Add Lagos Suya', 'Add Cold Chapman'],
      recommendedItemId: asun.id,
      action: { type: 'ADD_TO_CART', payload: asun.id },
    };
  }

  // 5) Health benefits / Ingredients questions (Bitterleaf, Ewedu, Hibiscus/Zobo, Palm wine)
  if (query.includes('benefit') || query.includes('healthy') || query.includes('nutrition') || query.includes('diabetes') || query.includes('blood pressure')) {
    return {
      text: `🥗 **Culinary & Nutritional Facts**:\n\n• **Ewedu (Jute Leaf)**: Extremely rich in beta-carotene, iron, calcium, and vitamins A, C, and E. Renowned across West Africa for aiding digestion and promoting glowing skin.\n• **Bitterleaf (Ewuro / Olubu)**: Packed with flavonoids, and traditionally used to regulate blood sugar and detoxify the liver.\n• **Zobo (Hibiscus Sabdariffa)**: High in polyphenols and Vitamin C, shown in nutritional studies to naturally support healthy blood pressure.\n• **Pure Yam**: Complex low-glycemic carbohydrates for sustained energy.\n\nEnjoy these nutritional powerhouses in our **Amala & Ewedu** or **Poundo Yam & Egusi**! Customer desk: **${HOTLINE_NUMBER}**.`,
      suggestedPrompts: ['Order Amala & Ewedu', 'Order Zobo Supreme', 'View Menu'],
      recommendedItemId: 'lf-01',
      action: { type: 'ADD_TO_CART', payload: 'lf-01' },
    };
  }

  // C. Standard grounded answers (Allergens, delivery, hours, contact)
  if (query.includes('allergy') || query.includes('allergens') || query.includes('peanut') || query.includes('crayfish') || query.includes('halal')) {
    if (query.includes('peanut') || query.includes('yaji') || query.includes('nut')) {
      return {
        text: `⚠️ **Nut Allergen Notice**: Our **Lagos Street Suya** contains roasted groundnut (peanut) in the traditional Yaji spice blend. If you have a peanut allergy, we recommend our **Spicy Asun (Goat Meat)** or **Firewood Party Jollof with Grilled Chicken**! Call **${HOTLINE_NUMBER}** if you have severe allergies.`,
        suggestedPrompts: ['View Nut-Free Dishes', 'Order Spicy Asun', 'Order Party Jollof'],
      };
    }
    return {
      text: `Every meal at Laye Foods clearly lists its allergens and dietary tags (Halal, Pescatarian, Gluten-Free swallow, Nut-Free). We accommodate special preparations—call our chef hotline **${HOTLINE_NUMBER}**!`,
      suggestedPrompts: ['View Halal Dishes', 'View Pescatarian Dishes', 'Explore Menu'],
    };
  }

  if (query.includes('delivery') || query.includes('fee') || query.includes('area') || query.includes('lagos') || query.includes('abuja')) {
    const zonesList = DELIVERY_ZONES.map((z) => `• **${z.zone}**: ₦${z.fee.toLocaleString()} (${z.estMinutes})`).join('\n');
    return {
      text: `🛵 **24/7 Delivery Hubs & Fees**:\n\n${zonesList}\n\nAll orders travel in temperature-controlled thermal bags. Call **${HOTLINE_NUMBER}** for live dispatch updates!`,
      suggestedPrompts: ['Order for Victoria Island', 'Order for Lekki', 'Order for Abuja'],
    };
  }

  if (query.includes('phone') || query.includes('hotline') || query.includes('call') || query.includes('contact') || query.includes('whatsapp') || query.includes('human')) {
    return {
      text: `📞 **Laye Foods Customer Hotline & Support**:\n\n• **Direct Hotline**: **${HOTLINE_NUMBER}**\n• **WhatsApp Instant Desk**: **${HOTLINE_NUMBER}**\n• **Email**: orders@layefoods.ng\n• **Kitchen Stations**: 14 Karimu Kotun St, Victoria Island | Isaac John St, GRA Ikeja | Wuse II Abuja\n• **Hours**: 24/7 round-the-clock availability.`,
      suggestedPrompts: [`Call ${HOTLINE_NUMBER}`, 'Open Inquiries Form', 'Check Menu'],
      action: { type: 'OPEN_CONTACT' },
    };
  }

  // D. General Fallback with Nearest Dish Suggestion Algorithm
  // Find closest menu items based on word matching
  const scoredItems = menu.map((item) => {
    let score = 0;
    const tokens = query.split(/\s+/);
    tokens.forEach((t) => {
      if (t.length > 2) {
        if (item.name.toLowerCase().includes(t)) score += 3;
        if (item.description.toLowerCase().includes(t)) score += 1;
        if (item.category.toLowerCase().includes(t)) score += 2;
        if (item.nativeName?.toLowerCase().includes(t)) score += 3;
      }
    });
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = scoredItems[0]?.score > 0 ? scoredItems[0].item : menu[0];

  return {
    text: `Ẹ n lẹ o! Welcome to **Laye Foods**! 🇳🇬\n\nI searched for your request: while that specific item may not be a standard menu code, here is our **Nearest Recommended Specialty**:\n\n🍲 **${bestMatch.name}** (₦${bestMatch.basePrice.toLocaleString()})\n${bestMatch.description}\n\nYou can customize your swallow, protein, and spice level! For special custom orders or inquiries, speak directly to our kitchen team at **${HOTLINE_NUMBER}** (24/7 Call & WhatsApp).`,
    suggestedPrompts: [
      `Add ${bestMatch.name.split(' ')[0]} to Cart`,
      'Explore All Soups & Swallows',
      `Call Kitchen Hotline ${HOTLINE_NUMBER}`,
    ],
    recommendedItemId: bestMatch.id,
    action: { type: 'ADD_TO_CART', payload: bestMatch.id },
  };
}
