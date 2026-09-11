import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  Recycle, 
  MapPin,
  Leaf,
  GraduationCap,
  Utensils,
  Building2,
  Landmark,
  Plus,
  Route,
  ArrowRight
} from 'lucide-react';
import { SpecialWasteConcierge } from './SpecialWasteConcierge';
import { WasteDisposalGuide } from './WasteDisposalGuide';
import { WasteJourneyViewer } from './WasteJourneyViewer';
import { ReportProblemModal } from './ReportProblemModal';
import { ScheduleManagementView } from './ScheduleManagementView';
import { RecurringScheduleWizard } from './RecurringScheduleWizard';

export const CitizenDashboard: React.FC = () => {
  const { collections, setMissedCollectionPromptOpen, activeOrg } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'home' | 'schedules' | 'special' | 'guide' | 'journey'>('home');
  const [reportOpen, setReportOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const isLight = theme === 'light';
  const todayCollection = collections[0]; // Active morning collection

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Banner — Eco-Friendly Design */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
        isLight 
          ? 'bg-white border-emerald-200 shadow-emerald-500/5 text-slate-900' 
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Header Title */}
        <div className="space-y-2 border-b pb-5 border-emerald-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-400/30 inline-flex items-center">
                <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-300" />
                Zero-Effort Eco Portal
              </span>

              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-900 dark:text-slate-200 border border-emerald-200 dark:border-slate-700">
                {activeOrg.name} ({activeOrg.type})
              </span>
            </div>

            <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-emerald-950' : 'text-white'}`}>
              Citizen Waste Intelligence
            </h1>
            <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              📍 Home Address • Sector 1 • Zone 1
            </p>
          </div>

          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Recurring Schedule</span>
          </button>
        </div>

        {/* Portal Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 border ${
              activeTab === 'home'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Today's Status</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 border ${
              activeTab === 'schedules'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('special')}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 border ${
              activeTab === 'special'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Special Waste</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 border ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>AI Waste Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`py-3 px-4 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 border ${
              activeTab === 'journey'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Waste Journey</span>
          </button>
        </div>
      </div>

      {/* Main Tab Surface */}
      {activeTab === 'schedules' && <ScheduleManagementView />}

      {activeTab === 'special' && <SpecialWasteConcierge />}
      {activeTab === 'guide' && <WasteDisposalGuide />}
      {activeTab === 'journey' && <WasteJourneyViewer />}

      {activeTab === 'home' && (
        <div className="space-y-6">

          {/* Section 6 Specification: NEXT COLLECTION CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>NEXT COLLECTION</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Tomorrow · 8:00–10:00 AM
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-emerald-400" />📍 Home</span>
                  <span className="flex items-center"><Truck className="w-4 h-4 mr-1 text-emerald-400" />🚛 Collector Assigned: Rajesh Kumar</span>
                  <span className="flex items-center"><Truck className="w-4 h-4 mr-1 text-emerald-400" />🚚 Vehicle: KA-01-EA-2026</span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold text-white border border-white/20">
                    Dry Recyclable
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold text-white border border-white/20">
                    Wet Organic
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setActiveTab('schedules')}
                  className="px-6 py-3 rounded-2xl bg-white text-emerald-950 font-extrabold text-xs shadow-lg hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Section 6 Specification: MY COLLECTION SCHEDULE SUMMARY */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>My Collection Schedule (This Week)</span>
              <button onClick={() => setActiveTab('schedules')} className="text-xs text-emerald-600 hover:underline">Manage</button>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {[
                { day: 'Mon', active: true, done: true },
                { day: 'Tue', active: true, done: true },
                { day: 'Wed', active: true, next: true },
                { day: 'Thu', active: true, done: false },
                { day: 'Fri', active: true, done: false },
                { day: 'Sat', active: false, done: false },
                { day: 'Sun', active: false, done: false },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center ${
                    d.next 
                      ? 'border-emerald-500 bg-emerald-500/10 font-bold' 
                      : d.done 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold block">{d.day}</span>
                  <span className="text-[10px] block mt-1">
                    {d.done ? '✓ Done' : d.next ? '→ Next' : d.active ? 'Upcoming' : 'Off'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <span>📍 Location: <strong>Home Address</strong></span>
                <span>Frequency: <strong>Every 2 Days</strong></span>
                <span className="flex items-center text-emerald-500 font-bold">● Active Service</span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setWizardOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Edit Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setReportOpen(true)}
              className={`p-5 rounded-3xl border text-left transition-all hover:border-emerald-500 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">Report Issue</h4>
              <p className="text-xs text-slate-400 mt-1">Overflow, missed pickup, or illegal dumping evidence</p>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`p-5 rounded-3xl border text-left transition-all hover:border-emerald-500 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">AI Waste Guide</h4>
              <p className="text-xs text-slate-400 mt-1">Take photo or search item for instant disposal advice</p>
            </button>

            <button
              onClick={() => setActiveTab('special')}
              className={`p-5 rounded-3xl border text-left transition-all hover:border-emerald-500 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">Special Waste Concierge</h4>
              <p className="text-xs text-slate-400 mt-1">Request pickup for bulk furniture, electronics, mattress</p>
            </button>
          </div>

        </div>
      )}

      {/* Modals */}
      <ReportProblemModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      <RecurringScheduleWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />

    </div>
  );
};
