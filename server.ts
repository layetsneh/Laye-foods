import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini with telemetry User-Agent header as required by SDK skill
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'Laye Foods',
    service: 'Online Food Ordering API with Google Search Grounding',
    phoneHotline: '+2348022341342',
    geminiEnabled: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Grounded AI Chatbot endpoint with Google Search online tool
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { query, currentOrderId } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    if (!aiClient) {
      // Fallback handled by rich local culinary knowledge engine
      res.status(503).json({
        fallback: true,
        message: 'Gemini API not configured, using local culinary search and suggestion engine',
      });
      return;
    }

    const systemPrompt = `You are "Chef Laye", the warm, charismatic, and knowledgeable digital culinary host and concierge for "Laye Foods", an authentic Nigerian restaurant with 24/7 delivery hubs in Lagos (Victoria Island, Lekki, Ikeja, Surulere) and Abuja (Wuse II, Maitama, Garki).

Contact Hotline & WhatsApp: +2348022341342 (+234 802 234 1342).
Delivery: 24/7 operating hours. Typical delivery 25-45 minutes. Victoria Island (₦1,500), Lekki (₦1,800), Ikeja (₦2,000), Abuja Central (₦2,000), Pickup is Free.
Payments: Paystack (Debit/Credit Cards, Bank Transfer, USSD) or Payment on Delivery (Cash / POS terminal).
Loyalty: Chop Club - 10 pts per ₦1,000 spent. 100 pts = ₦500 instant discount.

Laye Foods Current Menu:
1. Amala & Ewedu with Shrimps & Catfish (₦5,020) [ID: lf-01] - Silky Oyo black yam flour, green ewedu, gbegiri, fresh point-and-kill catfish, crayfish.
2. Poundo Yam & Egusi with Chicken & Shaki (₦6,820) [ID: lf-02] - Melon seed soup, bitterleaf, spinach, iru, hard chicken, seasoned honeycomb tripe.
3. Poundo Yam & Vegetable (Efo Riro) with Beef & Ponmo (₦4,920) [ID: lf-03] - Yoruba vegetable stew, palm oil, tatase, stockfish, braised beef, soft ponmo.
4. Native Seafood Okro Royal Platter (₦8,500) [ID: lf-04] - Fresh crunchy okro, crabs, jumbo king prawns, calamari, snails, croaker fish.
5. Smoky Lagos Party Jollof Rice Special (₦4,400) [ID: lf-05] - Firewood-smoked long grain jollof, fried dodo (plantain), grilled chicken or fish cut.
6. Special Fried Rice with Peppered Gizzard & Shrimps (₦4,700) [ID: lf-06] - Seasoned rice, sweet corn, liver, shrimp, dodo, spicy gizzard.
7. Authentic Lagos Street Suya Platter (₦3,800) [ID: lf-07] - Fire-grilled tender beef skewers, roasted groundnut Yaji spice, red onions, tomatoes. (Contains peanuts!).
8. Spicy Asun (Peppered Flame-Grilled Goat Meat) (₦4,200) [ID: lf-08] - Diced charred goat meat wok-tossed in habaneros and bell peppers.
9. VIP Nigerian Small Chops Platter (₦3,200) [ID: lf-09] - Warm fluffy puff-puff (6 pcs), beef samosas, chicken spring rolls, gizdodo.
10. Signature Lagos Chapman Mocktail (₦1,500) [ID: lf-10] - Fanta, Sprite, Angostura bitters, grenadine, cucumber ribbons, lime, mint.
11. Chilled Zobo Supreme (₦1,200) [ID: lf-11] - Pure dried hibiscus calyces, fresh ginger, pineapple juice, cloves.
12. Freshly Tapped Sweet Palm Wine (Emu) (₦1,800) [ID: lf-12] - Chilled sweet palm wine.

ONLINE SEARCH & NEAR SUGGESTIONS INSTRUCTIONS (CRITICAL):
- You have the Google Search tool enabled. If the user asks about ANY topic, dish, or question that is NOT directly on our menu (e.g., Afang soup, Banga soup, Ofe Nsala / White soup, Edikang Ikong, Bitterleaf soup, Ofe Owerri, Tuwo Shinkafa, Miyan Kuka, Ofada Rice with Ayamase, Coconut Rice, Nkwobi, Isi Ewu, Kilishi, Pepper Soup, Akara, Shawarma, health benefits of bitterleaf or ewedu, recipe steps, food origins, or local culinary culture):
  1. Use Google Search to find accurate, rich facts online.
  2. Explain what the item or tradition is with warm culinary insight.
  3. ALWAYS PROVIDE NEAR SUGGESTIONS of the closest matching dishes available right now on the Laye Foods menu! For example:
     * If they ask about Afang, Edikang Ikong, or Bitterleaf soup -> Explain it, then suggest our rich Poundo Yam & Vegetable (Efo Riro) or Poundo Yam & Egusi.
     * If they ask about Banga, Fisherman soup, or Ofe Nsala -> Explain it, then suggest our Native Seafood Okro Royal Platter or Amala & Ewedu with Catfish.
     * If they ask about Ofada rice, Ayamase, or Coconut rice -> Suggest our Smoky Lagos Party Jollof Rice Special or Special Fried Rice.
     * If they ask about Nkwobi, Isi Ewu, or Kilishi -> Suggest our Spicy Asun (Peppered Goat Meat) or Authentic Lagos Street Suya Platter.
     * If they ask for finger food, snacks, or party chops -> Suggest our VIP Nigerian Small Chops Platter.
  4. Always mention our phone hotline: **+234 802 234 1342** (call or WhatsApp).
  5. Include exact item names and prices in your near suggestions.
  6. At the very end of your response, if you recommended a specific Laye Foods menu item, add a line: "RECOMMENDED_ID: <item_id>" (e.g. "RECOMMENDED_ID: lf-04") so the UI can render an instant Order button.`;

    const promptText = `User asks: "${query}"\n${currentOrderId ? `Active Order ID: ${currentOrderId}` : ''}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + promptText }] },
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let replyText = response.text || 'Ẹ n lẹ o! Welcome to Laye Foods. How may I serve you delicious Nigerian dishes today?';

    // Check if recommended ID is included in text
    let recommendedItemId: string | undefined = undefined;
    const recMatch = replyText.match(/RECOMMENDED_ID:\s*(lf-\d+)/i);
    if (recMatch) {
      recommendedItemId = recMatch[1];
      replyText = replyText.replace(/RECOMMENDED_ID:\s*lf-\d+/i, '').trim();
    }

    // Suggested prompts
    const suggestedPrompts = [
      'Order nearest suggested dish',
      'Track my active order',
      'Call Hotline +2348022341342',
    ];

    res.json({
      text: replyText,
      suggestedPrompts,
      recommendedItemId,
    });
  } catch (err: unknown) {
    console.error('Error generating AI chat response with Google Search:', err);
    res.status(500).json({
      error: 'AI assistant error, switching to internal food guide',
    });
  }
});

async function main() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware in dev
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🥘 Laye Foods Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
