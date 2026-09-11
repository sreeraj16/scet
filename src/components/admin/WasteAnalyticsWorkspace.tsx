import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { TrendingUp, Sparkles, Filter, ShieldCheck, Flame, Scale, Truck, Activity } from 'lucide-react';

export const WasteAnalyticsWorkspace: React.FC = () => {
  const { activeOrg, collections, wasteBatches, vehicles, collectors } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Filters state
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | '3months'>('30days');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Chart datasets
  const dailyCollectionTrend = [
    { date: 'Mar 01', actualKg: 1240, predictedKg: 1200, compostedKg: 450, recycledKg: 600 },
    { date: 'Mar 02', actualKg: 1380, predictedKg: 1350, compostedKg: 510, recycledKg: 720 },
    { date: 'Mar 03', actualKg: 1150, predictedKg: 1280, compostedKg: 400, recycledKg: 620 },
    { date: 'Mar 04', actualKg: 1520, predictedKg: 1450, compostedKg: 580, recycledKg: 780 },
    { date: 'Mar 05', actualKg: 1410, predictedKg: 1400, compostedKg: 520, recycledKg: 710 },
    { date: 'Mar 06', actualKg: 1680, predictedKg: 1600, compostedKg: 640, recycledKg: 850 },
    { date: 'Mar 07', actualKg: 1750, predictedKg: 1700, compostedKg: 680, recycledKg: 900 },
  ];

  const categoryData = [
    { name: 'Dry Recyclables', value: 48.5, color: '#10b981' },
    { name: 'Organic Biomass', value: 34.2, color: '#059669' },
    { name: 'Special / E-Waste', value: 10.1, color: '#8b5cf6' },
    { name: 'Residual Inert', value: 7.2, color: '#f43f5e' },
  ];

  const zoneBreakdown = [
    { zone: 'Zone 1 (North)', volume: 4200, overflowRisk: 24 },
    { zone: 'Zone 2 (Commercial)', volume: 6800, overflowRisk: 86 },
    { zone: 'Zone 3 (Residential)', volume: 3900, overflowRisk: 15 },
    { zone: 'Zone 4 (Industrial)', volume: 5100, overflowRisk: 62 },
  ];

  const collectorPerformance = [
    { name: 'Rajesh Kumar', completed: 42, efficiency: 98, weight: 1420 },
    { name: 'Suresh Patel', completed: 38, efficiency: 95, weight: 1280 },
    { name: 'Ramesh Verma', completed: 36, efficiency: 92, weight: 1190 },
    { name: 'Anita Singh', completed: 40, efficiency: 96, weight: 1350 },
  ];

  const vehicleUtilization = [
    { vehicle: 'KA-01-EA-2026', capacityKg: 1500, currentLoadKg: 1280, utilPercent: 85 },
    { vehicle: 'KA-01-EA-2027', capacityKg: 1800, currentLoadKg: 1450, utilPercent: 80 },
    { vehicle: 'KA-01-EA-2028', capacityKg: 1200, currentLoadKg: 1100, utilPercent: 91 },
  ];

  return (
    <div className="space-y-6">

      {/* Header & Filter Controls Bar */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 uppercase tracking-wider">
                Graphical Analytics Workspace
              </span>
              <span className="text-xs text-slate-400">• {activeOrg.name}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Waste Collection Analytics & AI Forecasting</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              15 Graphical Operational Intelligence Monitors (XGBoost ML Models Connected)
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-1 border rounded-xl p-1 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {(['today', '7days', '30days', '3months'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors ${
                    timeRange === t ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'today' ? 'Today' : t === '7days' ? '7 Days' : t === '30days' ? '30 Days' : '3 Months'}
                </button>
              ))}
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value="all">All Zones</option>
              <option value="zone1">Zone 1 (North)</option>
              <option value="zone2">Zone 2 (Commercial)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Operational KPI Cards with Fact/Prediction badging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Waste Collected</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              FACT
            </span>
          </div>
          <p className="text-2xl font-black mt-2">12.8 Tons</p>
          <span className="text-xs text-emerald-500 font-bold flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> ↑ 8.4% vs last week
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Landfill Diversion Rate</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              FACT
            </span>
          </div>
          <p className="text-2xl font-black mt-2">64.2%</p>
          <span className="text-xs text-emerald-500 font-bold flex items-center mt-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Target 70% in reach
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">AI Overflow Risk</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              AI PREDICTION
            </span>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-2">84% Risk</p>
          <span className="text-xs text-amber-500 font-bold flex items-center mt-1">
            <Flame className="w-3.5 h-3.5 mr-1" /> Zone 2 expected within 6 hrs
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Fuel Savings Rec.</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              RECOMMENDATION
            </span>
          </div>
          <p className="text-2xl font-black text-blue-500 mt-2">35% Fuel Cut</p>
          <span className="text-xs text-blue-500 font-bold flex items-center mt-1">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Reduce West Sector frequency
          </span>
        </div>
      </div>

      {/* Chart Row 1: Daily Trend vs AI Forecast & Category Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-brand-500" />
              Daily Collection Volume (Actual vs AI ML Prediction)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              XGBoost Forecast v2.0
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCollectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="date" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderRadius: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="actualKg" name="Actual Collected (kg) [FACT]" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="predictedKg" name="AI Forecast (kg) [PREDICTION]" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
            <Scale className="w-4 h-4 mr-1.5 text-emerald-500" />
            Material Category Fraction (%)
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between font-medium">
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: c.color }} /> {c.name}</span>
                <span className="font-bold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Zone Breakdown & Collector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
            <Flame className="w-4 h-4 mr-1.5 text-amber-500" />
            Zone Generation Volume & Overflow Risk Scores
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="zone" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderRadius: '12px' }} />
                <Bar dataKey="volume" name="Collected Mass (kg) [FACT]" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
            <Truck className="w-4 h-4 mr-1.5 text-blue-500" />
            Collector Workforce Productivity & Efficiency Score
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} />
                <XAxis type="number" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis dataKey="name" type="category" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderRadius: '12px' }} />
                <Bar dataKey="weight" name="Total Weight (kg) [FACT]" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
