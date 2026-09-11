import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Leaf } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const SustainabilityDashboard: React.FC = () => {
  const { activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const pieData = [
    { name: 'Composted Organic', value: 12.7, color: '#10b981' },
    { name: 'Recovered Plastics', value: 10.2, color: '#059669' },
    { name: 'Paper & Cardboard', value: 5.4, color: '#f59e0b' },
    { name: 'Metals & Glass', value: 2.8, color: '#047857' },
    { name: 'E-Waste & Special', value: 1.4, color: '#0d9488' },
    { name: 'Sanitary Disposal', value: 16.0, color: '#94a3b8' },
  ];

  const monthlyTrend = [
    { month: 'May', Total: 42.0, Diverted: 24.5 },
    { month: 'Jun', Total: 44.5, Diverted: 27.0 },
    { month: 'Jul', Total: 46.2, Diverted: 29.1 },
    { month: 'Aug', Total: 47.8, Diverted: 30.5 },
    { month: 'Sep', Total: 48.5, Diverted: 32.5 },
  ];

  return (
    <div className={`p-6 rounded-3xl shadow-xl space-y-6 border ${
      isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sustainability & Carbon Intelligence</h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Landfill diversion rate, material recovery, and avoided emissions</p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/20 font-extrabold">
          ESTIMATED IMPACT
        </span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded-2xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
        }`}>
          <span className={`text-[11px] font-bold uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Waste Generated</span>
          <h3 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>48.5 Tons</h3>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+1.5% from last month</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-850 border-emerald-500/40'
        }`}>
          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase">Landfill Diversion Rate</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">67.0%</h3>
          <p className={`text-[10px] ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>32.5 Tons diverted</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-850 border-cyan-500/40'
        }`}>
          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-cyan-400 uppercase">Avoided CO₂ Equivalent</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-cyan-400">18.4 MT</h3>
          <p className={`text-[10px] ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Based on EPA WARM model</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-850 border-purple-500/40'
        }`}>
          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-purple-400 uppercase">Recovered Material Value</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-purple-300">$1,420.50</h3>
          <p className={`text-[10px] ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>CleanTech Recycler Transactions</p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Material Breakdown */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Material Stream Recovery Allocation (Tons)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} Tons`, 'Mass']} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#334155' : '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Monthly Landfill Diversion Trend */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Monthly Generation vs Landfill Diversion Trend
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="month" stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} />
                <Tooltip formatter={(val: any) => [`${val} Tons`, 'Volume']} />
                <Legend wrapperStyle={{ fontSize: '11px', color: isLight ? '#334155' : '#cbd5e1' }} />
                <Bar dataKey="Total" fill={isLight ? '#cbd5e1' : '#334155'} name="Total Generated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Diverted" fill="#10b981" name="Landfill Diverted" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
