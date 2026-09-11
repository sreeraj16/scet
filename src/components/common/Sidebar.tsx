import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import { 
  Recycle, 
  LayoutDashboard, 
  Truck, 
  Calendar, 
  Activity, 
  Map, 
  Users, 
  BrainCircuit, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  PackageCheck, 
  Building2, 
  GitCompare, 
  Route, 
  Leaf, 
  FileText, 
  AlertCircle, 
  HelpCircle, 
  Bell, 
  Shield, 
  MapPin, 
  Settings,
  ShoppingBag,
  Cpu,
  Compass,
  Zap,
  X,
  LogOut
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  rolesAllowed: UserRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activeRole, activeNavView, setActiveNavView, sidebarOpen, setSidebarOpen, logout } = useAuth();
  const { theme } = useTheme();

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Main Overview', icon: <LayoutDashboard className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin', 'recycler', 'organization_admin', 'platform_admin'] },
      ]
    },
    {
      title: 'OPERATIONS & GIS',
      items: [
        { id: 'live_ops', label: 'Command Overview', icon: <LayoutDashboard className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin', 'recycler', 'organization_admin', 'platform_admin'] },
        { id: 'unified_live_map', label: 'Unified GIS Map', icon: <Compass className="w-4 h-4" />, rolesAllowed: ['supervisor', 'admin', 'platform_admin', 'municipal_admin'] },
        { id: 'collections', label: 'Collection Schedule', icon: <Calendar className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin'] },
        { id: 'fleet', label: 'Fleet Management', icon: <Truck className="w-4 h-4" />, rolesAllowed: ['supervisor', 'admin'] },
        { id: 'routes', label: 'Dynamic Route Planner', icon: <Map className="w-4 h-4" />, rolesAllowed: ['collector', 'supervisor', 'admin'] },
        { id: 'iot_devices', label: 'IoT Smart Bins', icon: <Activity className="w-4 h-4" />, rolesAllowed: ['supervisor', 'admin'] },
        { id: 'collectors', label: 'Collector Roster', icon: <Users className="w-4 h-4" />, rolesAllowed: ['supervisor', 'admin'] },
      ]
    },
    {
      title: 'WASTE INTELLIGENCE',
      items: [
        { id: 'analytics', label: 'Waste Analytics', icon: <TrendingUp className="w-4 h-4" />, rolesAllowed: ['admin', 'supervisor', 'organization_admin', 'platform_admin'] },
        { id: 'ai_classification', label: 'AI Classification', icon: <BrainCircuit className="w-4 h-4" />, rolesAllowed: ['citizen', 'supervisor', 'admin', 'recycler'] },
        { id: 'heatmaps', label: 'Overflow Heatmaps', icon: <Flame className="w-4 h-4" />, rolesAllowed: ['supervisor', 'admin'] },
        { id: 'forecasting', label: 'AI Generation Forecast', icon: <Sparkles className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin'] },
      ]
    },
    {
      title: 'CIRCULAR ECONOMY',
      items: [
        { id: 'marketplace', label: 'Material Marketplace', icon: <ShoppingBag className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin', 'recycler', 'organization_admin', 'platform_admin'] },
        { id: 'recovery', label: 'Material Recovery', icon: <PackageCheck className="w-4 h-4" />, rolesAllowed: ['admin', 'recycler', 'organization_admin'] },
        { id: 'recyclers', label: 'Recycler Partners', icon: <Building2 className="w-4 h-4" />, rolesAllowed: ['admin', 'recycler'] },
        { id: 'traceability', label: 'Batch Traceability', icon: <GitCompare className="w-4 h-4" />, rolesAllowed: ['citizen', 'admin', 'recycler', 'organization_admin'] },
        { id: 'waste_journey', label: 'Waste Journey', icon: <Route className="w-4 h-4" />, rolesAllowed: ['citizen', 'admin', 'recycler'] },
      ]
    },
    {
      title: 'SUSTAINABILITY',
      items: [
        { id: 'sustainability', label: 'ESG Impact Dashboard', icon: <Leaf className="w-4 h-4" />, rolesAllowed: ['citizen', 'admin', 'organization_admin', 'platform_admin'] },
        { id: 'esg_reports', label: 'ESG Reports', icon: <FileText className="w-4 h-4" />, rolesAllowed: ['admin', 'organization_admin'] },
      ]
    },
    {
      title: 'COMMUNITY',
      items: [
        { id: 'reports', label: 'Issue Reports', icon: <AlertCircle className="w-4 h-4" />, rolesAllowed: ['citizen', 'supervisor', 'admin'] },
        { id: 'waste_guide', label: 'AI Waste Guide', icon: <HelpCircle className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin'] },
        { id: 'notifications', label: 'Notification Center', icon: <Bell className="w-4 h-4" />, rolesAllowed: ['citizen', 'collector', 'supervisor', 'admin', 'recycler', 'organization_admin', 'platform_admin'] },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'system_health', label: 'System & Security Console', icon: <Cpu className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin', 'supervisor', 'organization_admin'] },
        { id: 'event_outbox_monitor', label: 'Event Outbox Engine', icon: <Zap className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin', 'supervisor'] },
        { id: 'users', label: 'User Roster', icon: <Users className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin'] },
        { id: 'organizations', label: 'Tenants & Orgs', icon: <Shield className="w-4 h-4" />, rolesAllowed: ['platform_admin'] },
        { id: 'zones', label: 'Collection Zones', icon: <MapPin className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin'] },
        { id: 'settings', label: 'SaaS Configurator', icon: <Settings className="w-4 h-4" />, rolesAllowed: ['admin', 'platform_admin'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Left Sidebar Surface */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 border-r flex flex-col transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'light' 
            ? 'bg-white border-slate-200 text-slate-700' 
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-600">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-brand-600 dark:text-brand-400 block leading-none">
                WASTELOOP
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
                Smart City Ops
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => {
            const filteredItems = group.items.filter(item => item.rolesAllowed.includes(activeRole));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {filteredItems.map(item => {
                    const isActive = activeNavView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNavView(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                            : theme === 'light'
                              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Role Identity Card Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center space-x-3 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
              {activeRole.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate capitalize">{activeRole.replace('_', ' ')}</p>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Active Session
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center space-x-2 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
};
