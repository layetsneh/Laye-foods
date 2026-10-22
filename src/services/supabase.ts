import { createClient } from '@supabase/supabase-js';
import { Order, MenuItem, ContactMessage } from '../types';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://nyqvmuyansslnirrkpjx.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_e51o5FLr6AZ_DTJnbMaQmA_7hfJ_ieb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
      !SUPABASE_URL.includes('your-project') &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

/**
 * Sync an order to Supabase orders table
 */
export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail,
      delivery_type: order.deliveryType,
      delivery_zone: order.deliveryZone,
      delivery_address: order.deliveryAddress,
      landmark: order.landmark || null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount_amount: order.discountAmount,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      order_status: order.orderStatus,
      estimated_delivery_time: order.estimatedDeliveryTime,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    });
    if (error) {
      console.warn('Supabase orders sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync network fallback:', err);
    return false;
  }
}

/**
 * Fetch orders from Supabase if table exists
 */
export async function fetchSupabaseOrders(): Promise<any[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Sync contact message to Supabase
 */
export async function syncContactMessageToSupabase(msg: ContactMessage): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('contact_messages').insert({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      reply_status: msg.replyStatus,
      created_at: msg.createdAt,
    });
    if (error) {
      console.warn('Supabase contact message sync notice:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
