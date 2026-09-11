import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { 
    notifications, 
    notificationDrawerOpen, 
    setNotificationDrawerOpen,
    markNotificationRead,
    clearNotifications 
  } = useAuth();
  const { theme } = useTheme();

  const [filter, setFilter] = useState<'all' | 'alert' | 'success' | 'info'>('all');

  if (!notificationDrawerOpen) return null;

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setNotificationDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md border-l shadow-2xl transition-all duration-300 flex flex-col ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}>

          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-base">Notification Center</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </div>

            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex space-x-1">
              {(['all', 'alert', 'success', 'info'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filter === f 
                      ? 'bg-brand-600 text-white' 
                      : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications in this category</p>
              </div>
            ) : (
              filteredNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !n.read 
                      ? 'bg-brand-500/5 border-brand-500/30' 
                      : theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 ml-2">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
            Realtime updates active via Supabase Realtime Engine
          </div>

        </div>
      </div>
    </div>
  );
};
