import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Trash2,
  Volume2,
  Sparkles,
  Truck,
  Award,
} from 'lucide-react';
import { AppNotification } from '../../types';
import {
  getStoredNotifications,
  saveStoredNotifications,
  triggerPushNotification,
} from '../../services/storage';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  setNotifications: (notifs: AppNotification[]) => void;
  onNavigateToOrder?: (orderId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  onNavigateToOrder,
}) => {
  const [browserPermission, setBrowserPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestBrowserPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        triggerPushNotification(
          '🔔 Push Notifications Enabled!',
          'You will now receive live updates when your swallow is cooking and dispatched.',
          'system'
        );
      }
    }
  };

  const handleTestPush = () => {
    const testCases = [
      {
        title: '👨‍🍳 Kitchen Update: Egusi & Poundo Yam',
        msg: 'Chef Babatunde is plating your soup with extra soft shaki and catfish!',
        type: 'order' as const,
      },
      {
        title: '🛵 Rider Tunde is 3 mins away!',
        msg: 'Motorcycle LAG-482-VI is approaching your gate on Bishop Oluwole St.',
        type: 'order' as const,
      },
      {
        title: '⭐ 120 Chop Points Credited!',
        msg: 'Your loyalty wallet just leveled up. You are 160 pts away from Gold Tier!',
        type: 'loyalty' as const,
      },
    ];
    const pick = testCases[Math.floor(Math.random() * testCases.length)];
    triggerPushNotification(pick.title, pick.msg, pick.type);
    setNotifications(getStoredNotifications());
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    saveStoredNotifications([]);
    setNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-stone-800">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden relative border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0C2B1E] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F59E0B] text-gray-950 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Notification Center</h2>
              <p className="text-xs text-emerald-300">Live order pings & Chop Club alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission & Test Banner */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Browser Push Notifications:</span>
            {browserPermission === 'granted' ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
              </span>
            ) : (
              <button
                onClick={requestBrowserPush}
                className="bg-[#0C2B1E] hover:bg-[#164E35] text-[#FBBF24] px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all"
              >
                Enable Push
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleTestPush}
              className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Volume2 className="w-3 h-3" />
              <span>Simulate Live Push Alert</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-stone-500 hover:text-stone-800 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-stone-300" />
              <p className="font-semibold">No notifications right now.</p>
              <p className="text-[11px]">You will receive updates when you place an order!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.orderId && onNavigateToOrder) {
                    onNavigateToOrder(notif.orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-stone-50/70 border-stone-200 text-stone-600'
                    : 'bg-white border-amber-300 shadow-sm text-stone-900 ring-1 ring-amber-400/40'
                } ${notif.orderId ? 'cursor-pointer hover:bg-emerald-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs">{notif.title}</h4>
                  <span className="text-[10px] text-stone-400 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{notif.message}</p>
                {notif.orderId && (
                  <span className="text-[10px] text-emerald-800 font-bold mt-1.5 block">
                    Tap to open Live Order Tracking →
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
            <button
              onClick={handleClearAll}
              className="text-stone-400 hover:text-rose-600 font-medium flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-800 text-white font-bold rounded-xl text-xs hover:bg-black"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
