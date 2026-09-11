import React, { useState, useEffect } from 'react';
import { securityService } from '../../lib/securityService';
import { eventQueue } from '../../lib/eventQueue';
import { reliabilityEngine, ReliabilityAlert } from '../../lib/reliabilityEngine';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  RotateCw, 
  CheckCircle2, 
  Server, 
  Database, 
  Radio, 
  Layers, 
  Lock, 
  Zap, 
  Key,
  Users,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';

export const SystemHealthConsole: React.FC = () => {
  const { activeOrg, currentUser, activeRole, auditLogs } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Metrics State
  const [metrics, setMetrics] = useState(eventQueue.getMetrics());
  const [alerts, setAlerts] = useState<ReliabilityAlert[]>(reliabilityEngine.getAlerts());
  const [rateLimitStatus, setRateLimitStatus] = useState(securityService.checkRateLimit('system-console'));

  // Test inputs state
  const [testSanitizeInput, setTestSanitizeInput] = useState('<script>alert("xss")</script>');
  const [sanitizedOutput, setSanitizedOutput] = useState('');
  const [testMfaCode, setTestMfaCode] = useState('884910');
  const [mfaResult, setMfaResult] = useState<boolean | null>(null);

  // Refresh Loop
  const refreshMetrics = () => {
    setMetrics(eventQueue.getMetrics());
    setAlerts(reliabilityEngine.getAlerts());
    setRateLimitStatus(securityService.checkRateLimit('system-console'));
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTestSanitize = () => {
    setSanitizedOutput(securityService.sanitizeInput(testSanitizeInput));
  };

  const handleTestMfa = () => {
    setMfaResult(securityService.verifyMfaCode(testMfaCode));
  };

  const handleRetryDLQ = (eventId: string) => {
    eventQueue.retryDeadLetter(eventId);
    refreshMetrics();
  };

  const handleSimulateEvent = () => {
    eventQueue.publish('SENSOR_PING', {
      deviceId: 'IOT-TEST-99',
      fillLevel: 92,
      timestamp: new Date().toISOString()
    });
    refreshMetrics();
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* Header Banner */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-2xl shadow-xl transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white shadow-emerald-700/10' 
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-800/40'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-emerald-200 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Central Control & Operations Assurance
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Security, Event Queue & Health Monitor
          </h1>
          <p className="text-emerald-100 text-xs mt-1">
            Real-time telemetry monitoring for API rate limits, event-driven queue throughput, dead-letter retries, and multi-tenant security isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateEvent}
            className="bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Zap className="w-4 h-4 text-emerald-700" /> Dispatch Test Sensor Event
          </button>
          <button
            onClick={refreshMetrics}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight ? 'bg-emerald-800 text-white border-emerald-700 hover:bg-emerald-900' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
          <div className={`flex justify-between items-center text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>API Security & Rate Limiter</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {rateLimitStatus.remaining} / 60 Tokens
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Token Bucket Active (Strict XSS / SQLi)
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
          <div className={`flex justify-between items-center text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Active Event Broker Queue</span>
            <div className="p-2 bg-teal-500/10 text-teal-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {metrics.completedCount} Processed
          </div>
          <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5" /> {metrics.pendingInQueue} Pending in Queue
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
          <div className={`flex justify-between items-center text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Dead-Letter Queue (DLQ)</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {metrics.deadLetterCount} Failed Events
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {metrics.deadLetterCount === 0 ? '0 Exceptions recorded' : 'Requires manual retry audit'}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'}`}>
          <div className={`flex justify-between items-center text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Tenant Data Isolation</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-600 rounded-xl">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-2 font-mono text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {activeOrg.name}
          </div>
          <div className="text-[11px] text-cyan-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> RLS Isolation Enforced
          </div>
        </div>
      </div>

      {/* Interactive Security Testing & Event Queue Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & Validation Interactive Suite */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
        }`}>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Controls & Input Validator
          </h3>

          <div className="space-y-4 text-xs">
            {/* Input Sanitizer Test */}
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>XSS / SQLi Payload Sanitizer</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testSanitizeInput}
                  onChange={(e) => setTestSanitizeInput(e.target.value)}
                  className={`flex-1 rounded-lg p-2 font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <button
                  onClick={handleTestSanitize}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs shadow-md shadow-emerald-600/20"
                >
                  Sanitize
                </button>
              </div>
              {sanitizedOutput && (
                <div className="bg-emerald-50 p-2.5 rounded-lg font-mono text-[11px] text-emerald-800 border border-emerald-200">
                  Clean Output: {sanitizedOutput}
                </div>
              )}
            </div>

            {/* MFA TOTP Test */}
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>MFA OTP Code Verification</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP (e.g. 884910)"
                  value={testMfaCode}
                  onChange={(e) => setTestMfaCode(e.target.value)}
                  className={`flex-1 rounded-lg p-2 font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <button
                  onClick={handleTestMfa}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-2 rounded-lg text-xs shadow-md shadow-teal-600/20"
                >
                  Verify OTP
                </button>
              </div>
              {mfaResult !== null && (
                <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  mfaResult ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {mfaResult ? <Check className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
                  {mfaResult ? 'MFA Token Validated Successfully' : 'Invalid OTP format (Must be 6 digits)'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reliability Alerts & Failure Recovery Console */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/60 border-slate-700/60'
        }`}>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Operational Failure & Mitigation Log
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className={`text-xs py-8 text-center rounded-xl ${isLight ? 'bg-slate-50 text-slate-500' : 'bg-slate-900 text-slate-400'}`}>
                No active operational failures detected. All systems healthy.
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {a.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.autoMitigated ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {a.autoMitigated ? 'AUTO-MITIGATED' : 'ACTION REQUIRED'}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{a.description}</p>
                  {a.mitigationNotes && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-mono font-semibold">
                      ✓ {a.mitigationNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dead-Letter Queue Management Section */}
      {metrics.deadLetterEvents.length > 0 && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-800/60 border-rose-500/40'
        }`}>
          <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Dead-Letter Queue (DLQ) Exception Audit
          </h3>

          <div className="space-y-3">
            {metrics.deadLetterEvents.map(evt => (
              <div key={evt.id} className={`p-4 rounded-xl border flex justify-between items-center text-xs ${
                isLight ? 'bg-white border-rose-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div>
                  <div className="font-mono text-emerald-700 font-bold">{evt.id} | Topic: {evt.topic}</div>
                  <div className="text-slate-500 mt-1">Error: {evt.errorMessage || 'Retry limit exceeded'}</div>
                </div>
                <button
                  onClick={() => handleRetryDLQ(evt.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Re-queue Event
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
