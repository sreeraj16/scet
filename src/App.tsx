import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { MissedCollectionPromptModal } from './components/common/MissedCollectionPromptModal';
import { LoginPage } from './components/auth/LoginPage';

import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { ScheduleManagementView } from './components/citizen/ScheduleManagementView';
import { WasteDisposalGuide } from './components/citizen/WasteDisposalGuide';
import { WasteJourneyViewer } from './components/citizen/WasteJourneyViewer';

import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { SupervisorConsole } from './components/supervisor/SupervisorConsole';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OrgAdminDashboard } from './components/admin/OrgAdminDashboard';
import { SustainabilityDashboard } from './components/admin/SustainabilityDashboard';
import { RecyclerDashboard } from './components/recycler/RecyclerDashboard';
import { PlatformAdminConsole } from './components/platform/PlatformAdminConsole';
import { MarketplaceModule } from './components/marketplace/MarketplaceModule';
import { SystemHealthConsole } from './components/monitoring/SystemHealthConsole';
import { UnifiedLiveMap } from './components/monitoring/UnifiedLiveMap';
import { EventOutboxMonitor } from './components/monitoring/EventOutboxMonitor';
import { Recycle, ShieldCheck } from 'lucide-react';

const ViewRouter: React.FC = () => {
  const { activeRole, activeNavView } = useAuth();

  // Sub-view explicit navigation routing from Sidebar
  if (activeNavView === 'live_ops') return <SupervisorConsole />;
  if (activeNavView === 'unified_live_map' || activeNavView === 'heatmaps' || activeNavView === 'routes') return <UnifiedLiveMap />;
  if (activeNavView === 'event_outbox_monitor') return <EventOutboxMonitor />;
  if (activeNavView === 'system_health') return <SystemHealthConsole />;
  if (activeNavView === 'marketplace') return <MarketplaceModule />;
  if (activeNavView === 'schedules' || activeNavView === 'collections') return <ScheduleManagementView />;
  if (activeNavView === 'ai_classification' || activeNavView === 'waste_guide') return <WasteDisposalGuide />;
  if (activeNavView === 'waste_journey' || activeNavView === 'traceability') return <WasteJourneyViewer />;
  if (activeNavView === 'sustainability' || activeNavView === 'esg_reports' || activeNavView === 'analytics' || activeNavView === 'forecasting') return <SustainabilityDashboard />;
  if (activeNavView === 'fleet' || activeNavView === 'iot_devices' || activeNavView === 'collectors' || activeNavView === 'reports') return <SupervisorConsole />;
  if (activeNavView === 'recovery' || activeNavView === 'recyclers') return <RecyclerDashboard />;
  if (activeNavView === 'users' || activeNavView === 'organizations' || activeNavView === 'zones' || activeNavView === 'settings') return <PlatformAdminConsole />;

  // Default Role-based portal dashboards
  switch (activeRole) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'collector':
      return <CollectorDashboard />;
    case 'supervisor':
      return <SupervisorConsole />;
    case 'admin':
      return <AdminDashboard />;
    case 'organization_admin':
      return <OrgAdminDashboard />;
    case 'recycler':
      return <RecyclerDashboard />;
    case 'platform_admin':
      return <PlatformAdminConsole />;
    default:
      return <CitizenDashboard />;
  }
};

const MainAppLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Left Application Shell Navigation Sidebar */}
      <Sidebar />

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer />

      {/* Zero-Effort Missed Collection Automated Modal */}
      <MissedCollectionPromptModal />

      {/* Main App Content Area (Pushed right for desktop sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen w-full max-w-full overflow-x-hidden">
        
        {/* Top Command Navigation Header */}
        <Header />

        {/* Dynamic Surface */}
        <main className="flex-1 pb-12 w-full max-w-full overflow-x-hidden">
          <ViewRouter />
        </main>

        {/* Enterprise Footer */}
        <footer className={`${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
        } border-t text-xs py-6 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Recycle className="w-4 h-4" />
              </div>
              <div>
                <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  WasteLoop Operations Platform
                </span>
                <p className="text-[11px] text-slate-400">Multi-tenant Smart City & Circular Economy Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="flex items-center text-emerald-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                PostgreSQL RLS & Google OAuth Enabled
              </span>
              <span>•</span>
              <span>© 2026 WasteLoop Inc.</span>
            </div>

          </div>
        </footer>

      </div>

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
