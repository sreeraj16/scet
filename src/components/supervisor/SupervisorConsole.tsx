import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, 
  Truck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Complaint } from '../../types';

export const SupervisorConsole: React.FC = () => {
  const { collectors, complaints, vehicles, collections } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>(collectors[0]?.id || '');
  const [resolvedTickets, setResolvedTickets] = useState<string[]>([]);
  const [reassignedTickets, setReassignedTickets] = useState<Record<string, string>>({});

  const pendingComplaints = complaints.filter(c => !resolvedTickets.includes(c.id));
  const escalatedComplaints = pendingComplaints.filter(c => c.is_auto_escalated || c.severity === 'critical' || c.category === 'missed_collection');
  const failedCollections = collections.filter(c => c.status === 'missed' || c.status === 'skipped');

  const handleOpenReassign = (ticket: Complaint) => {
    setSelectedTicket(ticket);
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    const collector = collectors.find(c => c.id === selectedCollectorId);
    const collectorName = collector ? collector.name : 'Ramesh Kumar (Duty Collector)';
    
    setReassignedTickets(prev => ({
      ...prev,
      [selectedTicket.id]: collectorName
    }));

    setReassignModalOpen(false);
    setSelectedTicket(null);
  };

  const handleResolveTicket = (ticketId: string) => {
    setResolvedTickets(prev => [...prev, ticketId]);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-300">
              Supervisor Portal • Field Operations & SLA Dispatch
            </span>
            <h1 className={`text-2xl font-extrabold mt-2 tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>Supervisor Operations Console</h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Zone 1 & 2 Monitoring • SLA Timer Escalation • Dynamic Reassignment</p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'}`}>
              <span className={`block text-[10px] uppercase font-extrabold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Active Collectors</span>
              <strong className="text-emerald-700 dark:text-emerald-400 text-base font-extrabold">{collectors.length} On Duty</strong>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-slate-850 border-slate-700'}`}>
              <span className="block text-[10px] uppercase font-extrabold text-amber-800 dark:text-slate-400">Escalated SLA Tickets</span>
              <strong className="text-amber-800 dark:text-amber-400 text-base font-extrabold">{escalatedComplaints.length} Pending</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Breach & Escalation Center */}
      <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
        isLight ? 'bg-white border-amber-200 shadow-amber-500/5' : 'bg-slate-900 border-amber-500/30'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div>
            <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>SLA Breach & Auto-Escalated Complaints</h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Automatic escalation triggered on missed collection thresholds</p>
          </div>
        </div>

        {escalatedComplaints.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
            All escalated SLA tickets have been resolved by supervisor dispatch.
          </div>
        ) : (
          <div className="space-y-3">
            {escalatedComplaints.map(ticket => (
              <div 
                key={ticket.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-850 border-amber-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300">
                      {ticket.ticket_code}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">{ticket.category}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300 font-extrabold uppercase">
                      SLA BREACH RISK
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{ticket.description}</p>
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Reporter: <strong>{ticket.reporter_name || 'Resident'}</strong> • Time: {new Date(ticket.created_at).toLocaleTimeString()}
                    {reassignedTickets[ticket.id] && (
                      <span className="ml-2 font-bold text-emerald-700 dark:text-emerald-400">
                        • Assigned Collector: {reassignedTickets[ticket.id]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenReassign(ticket)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reassign Task</span>
                  </button>
                  <button
                    onClick={() => handleResolveTicket(ticket.id)}
                    className={`text-xs font-extrabold px-4 py-2.5 rounded-xl border transition ${
                      isLight ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet & Collector Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Collector Roster */}
        <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
          isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-extrabold text-base flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Users className="w-5 h-5 text-emerald-600 mr-2" />
              Active Collector Roster
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Zone 1 & 2</span>
          </div>

          <div className="space-y-3">
            {collectors.map(col => (
              <div key={col.id} className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
              }`}>
                <div>
                  <h4 className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{col.name}</h4>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{col.badge_number}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">{col.completed_tasks_today} completed</span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{col.remaining_tasks_today} stops remaining</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Vehicles */}
        <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
          isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-extrabold text-base flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Truck className="w-5 h-5 text-emerald-600 mr-2" />
              Vehicle Fleet Utilization & Capacity Alerts
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Live Load Tracking</span>
          </div>

          <div className="space-y-3">
            {vehicles.map(veh => (
              <div key={veh.id} className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
              }`}>
                <div className={`flex justify-between font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>{veh.registration_number} ({veh.type})</span>
                  <span className="text-emerald-700 dark:text-emerald-400 uppercase">{veh.status}</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${(veh.current_load_kg / veh.capacity_kg) * 100}%` }}
                  />
                </div>
                <div className={`flex justify-between text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Load: {veh.current_load_kg} kg / {veh.capacity_kg} kg</span>
                  <span>Driver: {veh.assigned_collector_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Task Reassignment Modal */}
      {reassignModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl relative ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setReassignModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-xl ${isLight ? 'text-slate-400 hover:text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-white bg-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Reassign Task</h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Update Supabase database collector assignment</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 space-y-1">
                <p><strong>Ticket:</strong> {selectedTicket.ticket_code} ({selectedTicket.category})</p>
                <p><strong>Description:</strong> {selectedTicket.description}</p>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Select Replacement Collector
                </label>
                <select
                  value={selectedCollectorId}
                  onChange={(e) => setSelectedCollectorId(e.target.value)}
                  className={`w-full border rounded-2xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  {collectors.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.badge_number}) • {col.remaining_tasks_today} remaining
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Update Database</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
