import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const MissedCollectionPromptModal: React.FC = () => {
  const { missedCollectionPromptOpen, respondToMissedCollectionPrompt } = useAuth();
  const [autoTimer, setAutoTimer] = useState<number>(30); // 30 second auto-confirm timer

  useEffect(() => {
    let interval: any;
    if (missedCollectionPromptOpen) {
      setAutoTimer(30);
      interval = setInterval(() => {
        setAutoTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Default to YES if no response
            respondToMissedCollectionPrompt(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [missedCollectionPromptOpen]);

  if (!missedCollectionPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in relative overflow-hidden">
        
        {/* Top Status Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-brand-500" />

        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Zero-Effort Verification
              </span>
              <span className="text-xs text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                Auto-confirm in {autoTimer}s
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Automatic Missed-Collection Check</h3>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          We couldn't confirm today's morning collection window (7:00 AM - 9:00 AM) with your assigned collector vehicle. 
          <br /><br />
          <strong>Was your waste collected today?</strong>
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => respondToMissedCollectionPrompt(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>YES, Collected</span>
          </button>

          <button
            onClick={() => respondToMissedCollectionPrompt(false)}
            className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>NO, Missed</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          Note: If you do not respond, the system defaults to YES (confirmed) and no complaint is raised.
        </p>

      </div>
    </div>
  );
};
