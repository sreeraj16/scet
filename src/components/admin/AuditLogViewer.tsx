import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { History } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border transition-colors duration-300 ${
      isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center">
            <History className="w-5 h-5 text-emerald-700 dark:text-slate-300" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>System Security & Operational Audit Log</h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Immutable audit record of weight edits, tenant switches, and administrative actions</p>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/20 font-bold">
          COMPLIANT AUDIT TRAIL
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {auditLogs.map(log => (
          <div key={log.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700/80'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {log.action}
                </span>
                <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Entity: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.entity_type} #{log.entity_id}</strong></span>
              </div>
              <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{log.details}</p>
            </div>

            <div className={`text-right text-[11px] font-semibold whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <div>Actor: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{log.user_name}</strong> ({log.role})</div>
              <div>{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
