import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Plus, Activity, ArrowRight } from 'lucide-react';

export const PlatformAdminConsole: React.FC = () => {
  const { organizations, setOrganization, addOrganization } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('university');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    addOrganization(newOrgName, newOrgType);
    setSuccessMsg(`Organization "${newOrgName}" successfully onboarded with PostgreSQL RLS isolation!`);
    setNewOrgName('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-cyan-400 bg-emerald-100 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-emerald-300">
              SaaS Platform Master Console
            </span>
            <h1 className={`text-2xl font-extrabold mt-2 tracking-tight ${isLight ? 'text-emerald-950' : 'text-white'}`}>WasteLoop Multi-Tenant SaaS Engine</h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Global Organization Onboarding & PostgreSQL RLS Tenant Security</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3.5 py-1.5 rounded-full border border-emerald-300 flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-emerald-600" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Onboard New Organization Form */}
      <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className={`text-lg font-extrabold flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Plus className="w-5 h-5 text-emerald-600 mr-2" />
          Onboard New Organization Tenant
        </h3>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fade-in">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleCreateOrg} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Organization Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Swarnandhra Tech Institute"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className={`w-full border rounded-2xl px-3.5 py-2.5 font-semibold focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Organization Category</label>
            <select
              value={newOrgType}
              onChange={(e) => setNewOrgType(e.target.value)}
              className={`w-full border rounded-2xl px-3.5 py-2.5 font-semibold focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="university">🎓 College / University</option>
              <option value="restaurant">🍽️ Restaurant / Hotel</option>
              <option value="office">🏢 Office / Commercial</option>
              <option value="municipality">🏛️ Municipality / City</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Provision Tenant Schema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Active Organizations List */}
      <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className={`text-lg font-extrabold flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Building2 className="w-5 h-5 text-emerald-600 mr-2" />
          Active SaaS Platform Tenants ({organizations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {organizations.map(org => (
            <div key={org.id} className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{org.name}</h4>
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-brand-400 uppercase bg-emerald-100 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-emerald-300">
                  {org.subscription_plan}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Category: <strong className="text-emerald-700 dark:text-white capitalize">{org.category_label}</strong></p>
              <button
                onClick={() => setOrganization(org.id)}
                className={`w-full text-xs font-extrabold py-2 rounded-xl border transition ${
                  isLight ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100' : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                Switch Tenant View
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
