import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Calendar, 
  Clock, 
  Truck, 
  User, 
  MapPin, 
  CheckCircle2, 
  Pause, 
  Play, 
  Edit, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { RecurringScheduleWizard } from './RecurringScheduleWizard';

export const ScheduleManagementView: React.FC = () => {
  const { collections, activeOrg } = useAuth();
  const { theme } = useTheme();

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'collected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Collected</span>;
      case 'collector_en_route':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center animate-pulse"><Truck className="w-3 h-3 mr-1" /> En Route</span>;
      case 'missed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Missed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center"><Clock className="w-3 h-3 mr-1" /> Scheduled</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Active Recurring Service
              </span>
              <span className="text-xs text-slate-400">• {activeOrg.name}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Collection Schedule Management</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated logistics configuration for home & campus waste pickups.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isPaused 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md hover:bg-emerald-700' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume Schedule' : 'Pause Service'}</span>
            </button>

            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Recurring Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Calendar Grid Preview */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
          <Calendar className="w-4 h-4 mr-1.5 text-brand-500" />
          Weekly Pickup Matrix
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {[
            { day: 'Mon', date: 'Mar 09', status: 'completed', text: 'Collected' },
            { day: 'Tue', date: 'Mar 10', status: 'completed', text: 'Collected' },
            { day: 'Wed', date: 'Mar 11', status: 'today', text: 'Upcoming 8:00 AM' },
            { day: 'Thu', date: 'Mar 12', status: 'scheduled', text: 'Scheduled' },
            { day: 'Fri', date: 'Mar 13', status: 'scheduled', text: 'Scheduled' },
            { day: 'Sat', date: 'Mar 14', status: 'scheduled', text: 'Special Dry Pickup' },
            { day: 'Sun', date: 'Mar 15', status: 'off', text: 'No Pickup' },
          ].map((d, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition-all ${
                d.status === 'today'
                  ? 'border-brand-500 bg-brand-500/10 font-bold shadow-sm'
                  : d.status === 'completed'
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{d.day}</span>
              <span className="text-xs font-extrabold block my-0.5">{d.date}</span>
              <span className="text-[10px] font-semibold block truncate mt-1">
                {d.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming & Past Collections List */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
          <span>Active Collection Tasks</span>
          <span className="text-xs text-slate-400 font-normal">{collections.length} Total Tasks</span>
        </h3>

        <div className="space-y-3">
          {collections.map(col => (
            <div
              key={col.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(col.status)}
                  <span className="text-xs font-bold capitalize">{col.waste_category} Pickup</span>
                  <span className="text-[11px] text-slate-400">• Task #{col.id.substring(col.id.length - 6)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {col.household_address}</span>
                  <span className="flex items-center"><Truck className="w-3.5 h-3.5 mr-1 text-slate-400" /> {col.vehicle_id || 'KA-01-EA-2026'}</span>
                  <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1 text-slate-400" /> {col.collector_name || 'Rajesh Kumar'}</span>
                  {col.actual_weight_kg && (
                    <span className="font-bold text-emerald-500">• {col.actual_weight_kg} kg verified</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWizardOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RecurringScheduleWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};
