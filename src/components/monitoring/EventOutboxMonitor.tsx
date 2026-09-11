import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Database,
  Layers,
  FileText,
  RotateCcw
} from 'lucide-react';
import { outboxEngine, OutboxEventRecord } from '../../lib/outboxEngine';
import { securityService } from '../../lib/securityService';

export const EventOutboxMonitor: React.FC = () => {
  const { activeOrg, currentUser } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [diagnostics, setDiagnostics] = useState(outboxEngine.getDiagnostics());
  const [activeTab, setActiveTab] = useState<'outbox' | 'dead_letter' | 'security_audit'>('outbox');

  const refreshMetrics = () => {
    setDiagnostics(outboxEngine.getDiagnostics());
  };

  useEffect(() => {
    const timer = setInterval(refreshMetrics, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleRetry = (id: string) => {
    outboxEngine.retryDeadLetter(id);
    refreshMetrics();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Zap className="w-6 h-6 animate-bounce-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight">Reliable Event Outbox & Observability Engine</h1>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  IDEMPOTENCY PROTECTED
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Asynchronous event-driven messaging layer with exponential backoff retries, replay protection & dead-letter queue isolation
              </p>
            </div>
          </div>

          <button
            onClick={refreshMetrics}
            className="flex items-center space-x-2 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* Realtime Metrics Summary Grid */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">TOTAL PUBLISHED</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{diagnostics.metrics.totalEventsPublished}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 block">COMPLETED EVENTS</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{diagnostics.completedCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">RETRIED ATTEMPTS</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{diagnostics.metrics.totalRetried}</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
            <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">DEAD LETTER QUEUE</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{diagnostics.deadLetterCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block">REPLAYS BLOCKED</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{diagnostics.metrics.duplicateBlockedCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('outbox')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'outbox' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Live Outbox Log ({diagnostics.events.length})
          </button>

          <button
            onClick={() => setActiveTab('dead_letter')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'dead_letter' 
                ? 'bg-rose-600 text-white shadow-md' 
                : isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Dead Letter Isolation ({diagnostics.deadLetterCount})
          </button>
        </div>

        {/* Outbox Events Table */}
        {activeTab === 'outbox' && (
          <div className="space-y-3">
            {diagnostics.events.length > 0 ? (
              diagnostics.events.map(ev => (
                <div key={ev.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {ev.event_type}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{ev.aggregate_type} #{ev.aggregate_id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Idempotency Key: <span className="font-mono text-slate-700 dark:text-slate-300">{ev.idempotency_key}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      ev.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      ev.status === 'processing' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {ev.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No events currently in the outbox stream.
              </div>
            )}
          </div>
        )}

        {/* Dead Letter Queue */}
        {activeTab === 'dead_letter' && (
          <div className="space-y-3">
            {diagnostics.events.filter(e => e.status === 'dead_letter').length > 0 ? (
              diagnostics.events.filter(e => e.status === 'dead_letter').map(ev => (
                <div key={ev.id} className="p-4 rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-rose-900 dark:text-rose-300">{ev.event_type}</span>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium mt-0.5">Error: {ev.last_error || 'Max retries exhausted'}</p>
                  </div>
                  <button
                    onClick={() => handleRetry(ev.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center space-x-1 shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-queue Event</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                ✓ Dead Letter Queue is clear. Zero failed unhandled events.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
