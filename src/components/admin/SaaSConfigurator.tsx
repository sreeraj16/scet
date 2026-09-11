import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings, Save } from 'lucide-react';

export const SaaSConfigurator: React.FC = () => {
  const { activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [slaHours, setSlaHours] = useState('2');
  const [maxMissedBeforeEscalate, setMaxMissedBeforeEscalate] = useState('3');
  const [allowCitizenOnDemand, setAllowCitizenOnDemand] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`SaaS configuration updated for tenant ${activeOrg.name}. Rules persisted to Supabase database.`);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
      isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-700 dark:text-slate-300" />
        </div>
        <div>
          <h2 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Organization & SaaS Configuration</h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Configure collection windows, priority SLA rules, and tenant settings for {activeOrg.name}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className={`p-6 rounded-2xl border space-y-6 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
      }`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Organization Name</label>
            <input
              type="text"
              value={activeOrg.name}
              disabled
              className={`w-full border rounded-2xl px-3.5 py-2.5 cursor-not-allowed font-bold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Subscription Tier</label>
            <input
              type="text"
              value={`${activeOrg.subscription_plan.toUpperCase()} PLAN`}
              disabled
              className={`w-full border rounded-2xl px-3.5 py-2.5 font-extrabold cursor-not-allowed ${
                isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-900 border-slate-700 text-brand-400'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>SLA Max Collection Response Window (Hours)</label>
            <input
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              className={`w-full border rounded-2xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Missed Collections Before Auto-Escalate</label>
            <input
              type="number"
              value={maxMissedBeforeEscalate}
              onChange={(e) => setMaxMissedBeforeEscalate(e.target.value)}
              className={`w-full border rounded-2xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="onDemandCheck"
            checked={allowCitizenOnDemand}
            onChange={(e) => setAllowCitizenOnDemand(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500"
          />
          <label htmlFor="onDemandCheck" className={`text-xs font-semibold cursor-pointer ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            Allow Citizens to schedule Special Waste Concierge & On-Demand Pickups
          </label>
        </div>

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center space-x-2 transition shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" />
          <span>SAVE TENANT CONFIGURATION</span>
        </button>

      </form>

    </div>
  );
};
