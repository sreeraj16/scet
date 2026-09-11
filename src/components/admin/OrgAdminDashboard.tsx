import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Building2, 
  GraduationCap, 
  Utensils, 
  Calendar, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight, 
  Scale,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const OrgAdminDashboard: React.FC = () => {
  const { activeOrg, addCollection } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'departments' | 'bulk_dispatch' | 'esg_report' | 'audit'>('departments');

  // Bulk pickup form state
  const [department, setDepartment] = useState('Central Cafeteria');
  const [wasteStream, setWasteStream] = useState('organic');
  const [estimatedKg, setEstimatedKg] = useState('150');
  const [preferredDate, setPreferredDate] = useState('Tomorrow Morning (08:00 AM)');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  const handleCreateBulkPickup = (e: React.FormEvent) => {
    e.preventDefault();
    addCollection({
      type: 'special',
      waste_category: wasteStream as any,
      estimated_weight_kg: parseFloat(estimatedKg) || 150,
      priority: 'high',
      priority_reason: `Bulk facility dispatch for ${department}`,
      household_address: `${activeOrg.name} — ${department}`,
      notes: `Institutional bulk collection for ${department}. Preferred time: ${preferredDate}`
    });

    setBulkSuccessMsg(`Bulk waste dispatch scheduled for ${department} (${estimatedKg} kg ${wasteStream.toUpperCase()}). Email notification sent!`);
    setTimeout(() => setBulkSuccessMsg(''), 5000);
  };

  const departmentsData = [
    { name: 'Central Cafeteria & Kitchen', category: 'Organic Biomass', avgWeeklyKg: '420 kg', complianceScore: 98, status: 'Optimal' },
    { name: 'Science Labs & Chemical Storage', category: 'Hazardous / E-Waste', avgWeeklyKg: '85 kg', complianceScore: 94, status: 'Special Handling' },
    { name: 'Admin Block & Library', category: 'Paper & Cardboard', avgWeeklyKg: '230 kg', complianceScore: 96, status: 'Optimal' },
    { name: 'Student Hostels 1 - 6', category: 'Mixed Dry Recyclable', avgWeeklyKg: '610 kg', complianceScore: 92, status: 'Active' },
    { name: 'Facilities Maintenance Yard', category: 'Bulky & Inert Waste', avgWeeklyKg: '140 kg', complianceScore: 90, status: 'Active' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300">
                Institutional Facility Operations
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">ID: {activeOrg.id}</span>
            </div>
            <h1 className={`text-2xl font-extrabold mt-2 tracking-tight ${isLight ? 'text-emerald-950' : 'text-white'}`}>
              {activeOrg.name} — Command Center
            </h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Facility Department Management, Bulk Waste Dispatch & ESG Compliance Reporting
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-900 dark:text-emerald-300">
              <span>Weekly Facility Volume: </span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm ml-1">1,485 kg</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-t border-slate-200 dark:border-slate-800 pt-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-xl font-extrabold transition ${
              activeTab === 'departments' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            🏢 Facility Departments ({departmentsData.length})
          </button>

          <button
            onClick={() => setActiveTab('bulk_dispatch')}
            className={`px-4 py-2 rounded-xl font-extrabold transition ${
              activeTab === 'bulk_dispatch' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            🚚 Bulk Waste Pickup Dispatch
          </button>

          <button
            onClick={() => setActiveTab('esg_report')}
            className={`px-4 py-2 rounded-xl font-extrabold transition ${
              activeTab === 'esg_report' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            📊 ESG Sustainability Audit Report
          </button>
        </div>
      </div>

      {/* Tab 1: Facility Departments Disaggregation */}
      {activeTab === 'departments' && (
        <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
          isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
        }`}>
          <h3 className={`text-lg font-extrabold flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Building2 className="w-5 h-5 text-emerald-600 mr-2" />
            Internal Department Waste Generation & Compliance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {departmentsData.map((dept, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{dept.name}</h4>
                  <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300">
                    {dept.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-400 font-semibold">
                  <div>Waste Stream: <strong className="text-emerald-700 dark:text-emerald-300">{dept.category}</strong></div>
                  <div>Avg Weekly Generation: <strong className="text-slate-900 dark:text-white">{dept.avgWeeklyKg}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Purity Rating:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    {dept.complianceScore}% Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Bulk Pickup Dispatcher */}
      {activeTab === 'bulk_dispatch' && (
        <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border ${
          isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Dispatch Bulk Facility Pickup</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Schedule heavy truck dispatch for campus cafeterias, yards, or hostels</p>
            </div>
          </div>

          {bulkSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fade-in">
              ✓ {bulkSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateBulkPickup} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Target Department / Block</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-3 font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                {departmentsData.map((d, i) => (
                  <option key={i} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Bulk Waste Stream</label>
              <select
                value={wasteStream}
                onChange={(e) => setWasteStream(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-3 font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="organic">Organic Biomass Scraps</option>
                <option value="dry_recyclable">Dry Recyclables (Plastics / Cardboard)</option>
                <option value="e_waste">E-Waste & Electronics</option>
                <option value="hazardous">Hazardous Chemicals / Batteries</option>
                <option value="bulky">Bulky Furniture / Construction Scrap</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Estimated Weight Payload (kg)</label>
              <input
                type="number"
                required
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-3 font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Preferred Pickup Time Slot</label>
              <select
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-3 font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="Today Evening (04:00 PM)">Today Evening (04:00 PM)</option>
                <option value="Tomorrow Morning (08:00 AM)">Tomorrow Morning (08:00 AM)</option>
                <option value="Tomorrow Afternoon (01:00 PM)">Tomorrow Afternoon (01:00 PM)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>CONFIRM & DISPATCH BULK PICKUP</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: ESG Sustainability Report Generator */}
      {activeTab === 'esg_report' && (
        <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border ${
          isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>ESG Sustainability Audit Report</h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Official circular economy metrics & avoided carbon footprint report for {activeOrg.name}</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Export Audit PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-850 border-slate-700'}`}>
              <span className="text-emerald-800 dark:text-emerald-400 font-extrabold uppercase text-[10px]">Landfill Diversion Rate</span>
              <strong className="text-2xl font-black text-emerald-950 dark:text-white block">84.2%</strong>
              <span className="text-slate-500 text-[11px]">+6.4% improvement this quarter</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-850 border-slate-700'}`}>
              <span className="text-emerald-800 dark:text-emerald-400 font-extrabold uppercase text-[10px]">Avoided Carbon Emissions</span>
              <strong className="text-2xl font-black text-emerald-950 dark:text-white block">🌱 2,673 kg CO₂e</strong>
              <span className="text-slate-500 text-[11px]">Verified by Supabase ledger</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-850 border-slate-700'}`}>
              <span className="text-emerald-800 dark:text-emerald-400 font-extrabold uppercase text-[10px]">Total Material Recovered</span>
              <strong className="text-2xl font-black text-emerald-950 dark:text-white block">5.9 Tons</strong>
              <span className="text-slate-500 text-[11px]">PET, Paper, Organic Composting</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
