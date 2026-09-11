import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Map, 
  Factory, 
  Bot, 
  Leaf, 
  History, 
  Settings, 
  AlertTriangle, 
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { OperationalMap } from './OperationalMap';
import { CoarseSortingTracker } from './CoarseSortingTracker';
import { AIOperationsAssistant } from './AIOperationsAssistant';
import { SustainabilityDashboard } from './SustainabilityDashboard';
import { AuditLogViewer } from './AuditLogViewer';
import { SaaSConfigurator } from './SaaSConfigurator';
import { WasteAnalyticsWorkspace } from './WasteAnalyticsWorkspace';

export const AdminDashboard: React.FC = () => {
  const { activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'map' | 'coarse' | 'ai' | 'sustainability' | 'audit' | 'config'>('overview');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header & Tab Navigation Bar */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl shadow-xl transition-colors duration-300 border ${
        isLight 
          ? 'bg-white border-emerald-100 shadow-emerald-500/5' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border inline-block ${
            isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            Municipal Eco Operations & Circular Hub
          </span>
          <h1 className={`text-xl sm:text-2xl font-extrabold mt-2 tracking-tight break-words ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeOrg.name} Dashboard</h1>
          <p className={`text-xs mt-1 break-words ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Multi-Tenant Isolation RLS Active • Production SaaS Interface</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Situation Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'map' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab('coarse')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'coarse' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Coarse Sorting</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'ai' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('sustainability')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'sustainability' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Sustainability</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-slate-700 text-white' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 ${
              activeTab === 'config' ? 'bg-slate-700 text-white' : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && <WasteAnalyticsWorkspace />}
      {activeTab === 'map' && <OperationalMap />}
      {activeTab === 'coarse' && <CoarseSortingTracker />}
      {activeTab === 'ai' && <AIOperationsAssistant />}
      {activeTab === 'sustainability' && <SustainabilityDashboard />}
      {activeTab === 'audit' && <AuditLogViewer />}
      {activeTab === 'config' && <SaaSConfigurator />}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Situation Awareness Workflow Section */}
          <div className={`p-6 rounded-3xl shadow-xl space-y-6 border ${
            isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-slate-800">
              <h2 className={`text-lg font-extrabold uppercase tracking-wider flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
                Situation Awareness Framework
              </h2>
              <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Current State → Live Alerts → Predictions → Actions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              
              {/* Step 1: Current State */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'}`}>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-cyan-400 uppercase block">1. Current Operational State</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Active Trucks:</span>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>2 Vehicles</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Total Pickups Today:</span>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>18 Stops</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>MRF Ingest:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">48.0 kg</strong>
                  </div>
                </div>
              </div>

              {/* Step 2: Live IoT Alerts */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-850 border-slate-700'}`}>
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 uppercase block">2. Live IoT Alerts</span>
                <div className="space-y-1">
                  <p className={`font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>⚠️ Zone 4 Bin #86 Overflow</p>
                  <p className={isLight ? 'text-slate-700' : 'text-slate-400'}>86% fill level reached</p>
                  <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-300">SLA Critical</span>
                </div>
              </div>

              {/* Step 3: ML Predictions */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-850 border-slate-700'}`}>
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-purple-400 uppercase block">3. ML Forecasting</span>
                <div className="space-y-1">
                  <p className={`font-bold ${isLight ? 'text-purple-950' : 'text-purple-300'}`}>Next Week Forecast</p>
                  <p className={isLight ? 'text-slate-700' : 'text-slate-400'}>Expected +14.2% Plastic</p>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-purple-300">XGBoost Confidence 92%</span>
                </div>
              </div>

              {/* Step 4: Recommended Action */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-850 border-slate-700'}`}>
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase block">4. Automated Action</span>
                <div className="space-y-1">
                  <p className={`font-bold ${isLight ? 'text-emerald-950' : 'text-emerald-300'}`}>Reroute Compactor #1</p>
                  <p className={isLight ? 'text-slate-700' : 'text-slate-400'}>Dispatched via OSRM</p>
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-500 transition"
                  >
                    View Operational Map
                  </button>
                </div>
              </div>

            </div>
          </div>

          <OperationalMap />
        </div>
      )}

    </div>
  );
};
