import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import { getOfflineQueue } from '../../lib/offlineQueue';
import { 
  Recycle, 
  Building2, 
  User, 
  Bell, 
  Wifi, 
  WifiOff, 
  Sun,
  Moon,
  Search,
  Menu,
  GraduationCap,
  Utensils,
  Landmark,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    organizations, 
    activeOrg, 
    setOrganization, 
    activeRole, 
    setRole, 
    notifications,
    isOffline,
    setIsOffline,
    syncOfflineQueue,
    sidebarOpen,
    setSidebarOpen,
    setNotificationDrawerOpen,
    logout,
    currentUser
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const offlineQueue = getOfflineQueue();

  const handleToggleOffline = () => {
    if (isOffline) {
      setIsOffline(false);
      syncOfflineQueue();
    } else {
      setIsOffline(true);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'College / University': return <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Hotel': return <Utensils className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Municipality': return <Landmark className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Building2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const rolesList: { id: UserRole; name: string }[] = [
    { id: 'citizen', name: 'Citizen Generator' },
    { id: 'collector', name: 'Field Collector' },
    { id: 'supervisor', name: 'Zone Supervisor' },
    { id: 'admin', name: 'Municipal Admin' },
    { id: 'recycler', name: 'Recycler Partner' },
    { id: 'organization_admin', name: 'Organization Admin' },
    { id: 'platform_admin', name: 'Platform Admin' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`sticky top-0 z-30 h-16 border-b transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white text-slate-900 border-slate-200 shadow-xs' 
        : 'bg-slate-900 text-slate-100 border-slate-800'
    }`}>
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left Side: Sidebar Toggle & Global Search */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Input */}
          <div className="relative w-full hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search WasteLoop (Tasks, Batches, Vehicles, Locations)..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-750 text-white'
              }`}
            />
          </div>
        </div>

        {/* Right Side: Command Controls & Tenant Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Organization Tenant Selector */}
          <div className="relative flex items-center">
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              {getCategoryIcon(activeOrg.type)}
              <select
                value={activeOrg.id}
                onChange={(e) => setOrganization(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {org.name} ({org.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live GIS Operational Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Operations Live</span>
          </div>

          {/* Online/Offline Queue Toggle */}
          <button
            onClick={handleToggleOffline}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isOffline 
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}
            title="Network Connectivity Mode"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
            <span className="hidden md:inline">{isOffline ? `Offline (${offlineQueue.length})` : 'Online'}</span>
          </button>

          {/* Theme Toggle (Dark/Light Button) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              theme === 'light' 
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
            }`}
            title="Toggle Dark/Light Mode"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notification Drawer Trigger */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className={`relative p-2 rounded-xl border transition-colors ${
              theme === 'light' 
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer focus:outline-none ${
                theme === 'light' 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-emerald-600 text-white border-emerald-600'
              }`}
            >
              {rolesList.map(r => (
                <option key={r.id} value={r.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                  Role: {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl py-2 z-50 transition-all ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{activeRole.replace('_', ' ')} • {activeOrg.name}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
