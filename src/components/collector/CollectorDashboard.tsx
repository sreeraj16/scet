import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CollectionItem } from '../../types';
import { saveOfflineAction } from '../../lib/offlineQueue';
import { CollectorRouteMap } from './CollectorRouteMap';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Scale, 
  WifiOff, 
  X,
  Play,
  SkipForward,
  Compass,
  Send,
  AlertCircle,
  Map
} from 'lucide-react';

export const CollectorDashboard: React.FC = () => {
  const { 
    collections, 
    markCollectionCompleted, 
    isOffline, 
    vehicles, 
    syncOfflineQueue,
    submitComplaint 
  } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [routeStarted, setRouteStarted] = useState(true);
  const [activeStop, setActiveStop] = useState<CollectionItem | null>(collections[1] || collections[0] || null);
  const [stopArrived, setStopArrived] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [actualWeight, setActualWeight] = useState<string>('8.5');
  const [segregationVerified, setSegregationVerified] = useState(true);

  // Issue Reporting Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueCategory, setIssueCategory] = useState<'missed_collection' | 'illegal_dumping' | 'overflow' | 'damaged_bin'>('overflow');
  const [issueNotes, setIssueNotes] = useState('Overflowing bin & road access blocked by parked vehicle.');

  // GPS tracking state
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('GPS Accuracy: ±8m');
  const [isSimulatedGPS, setIsSimulatedGPS] = useState<boolean>(true);

  const vehicle = vehicles[0];
  const pendingStops = collections.filter(c => c.status !== 'collected');
  const completedStops = collections.filter(c => c.status === 'collected');

  const handleFetchGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const acc = Math.round(pos.coords.accuracy);
          setGpsAccuracy(`GPS Accuracy: ±${acc}m`);
          setIsSimulatedGPS(false);
        },
        () => {
          setGpsAccuracy('SIMULATED GPS');
          setIsSimulatedGPS(true);
        }
      );
    } else {
      setGpsAccuracy('SIMULATED GPS');
      setIsSimulatedGPS(true);
    }
  };

  const handleConfirmCollection = () => {
    if (!activeStop) return;
    const weightNum = parseFloat(actualWeight) || 5.0;

    if (isOffline) {
      saveOfflineAction('MARK_COLLECTED', activeStop.id, { weight: weightNum, segregation: segregationVerified });
      alert('Offline Mode Active: Action saved to local sync queue. Will sync automatically when online.');
    } else {
      markCollectionCompleted(activeStop.id, weightNum, undefined, segregationVerified);
    }

    setShowWeightModal(false);
    setStopArrived(false);
    const next = pendingStops.find(s => s.id !== activeStop.id);
    if (next) setActiveStop(next);
  };

  const handleSkipStop = () => {
    const next = pendingStops.find(s => s.id !== activeStop?.id);
    if (next) {
      setActiveStop(next);
      setStopArrived(false);
    }
  };

  const handleSubmitIssue = () => {
    if (!activeStop) return;
    submitComplaint(issueCategory, `[COLLECTOR EXCEPTION @ ${activeStop.household_address}]: ${issueNotes}`);
    alert(`Operational Exception Logged!\nTicket generated and dispatched to Zone Supervisor for ${activeStop.household_address}.`);
    setShowIssueModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      
      {/* Mobile Header Banner */}
      <div className={`p-5 rounded-3xl shadow-xl flex items-center justify-between border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`font-extrabold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Collector Mobile Portal</h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Vehicle: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{vehicle?.registration_number}</strong>
            </p>
          </div>
        </div>

        {isOffline ? (
          <button
            onClick={syncOfflineQueue}
            className="flex items-center space-x-1 text-xs font-extrabold px-3 py-2 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 animate-pulse"
          >
            <WifiOff className="w-4 h-4 mr-1" />
            <span>Sync Queue</span>
          </button>
        ) : (
          <div className="text-right space-y-1">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 block">
              ONLINE & SYNCED
            </span>
            <button
              onClick={handleFetchGPS}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border inline-flex items-center ${
                isSimulatedGPS 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              <Compass className="w-3 h-3 mr-1" />
              {gpsAccuracy}
            </button>
          </div>
        )}
      </div>

      {/* Start Route Banner if not started */}
      {!routeStarted && (
        <div className={`p-6 rounded-3xl text-center space-y-4 border ${
          isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <h3 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Morning Shift Dispatch Ready</h3>
          <button
            onClick={() => setRouteStarted(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-extrabold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-emerald-600/30 transition active:scale-98"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START ROUTE</span>
          </button>
        </div>
      )}

      {/* Vehicle Capacity & Route Metrics */}
      <div className={`p-5 rounded-3xl space-y-3 border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex justify-between items-center text-xs">
          <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Today's Route Progress</span>
          <span className={`font-extrabold ${isLight ? 'text-emerald-800' : 'text-white'}`}>{completedStops.length} / {collections.length} Stops Done</span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${(completedStops.length / (collections.length || 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-850 border-slate-700'}`}>
            <span className={`block text-[10px] uppercase font-bold ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Vehicle Load</span>
            <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-extrabold">{vehicle?.current_load_kg || 420} kg / {vehicle?.capacity_kg} kg</strong>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-850 border-slate-700'}`}>
            <span className={`block text-[10px] uppercase font-bold ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>Estimated Route Time</span>
            <strong className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>45 mins remaining</strong>
          </div>
        </div>
      </div>

      {/* GPS Route Planning & Live Map Optimization Surface */}
      <CollectorRouteMap 
        vehicle={vehicle} 
        activeStop={activeStop} 
        onSelectStop={(stop) => {
          setActiveStop(stop);
          setStopArrived(false);
        }} 
      />

      {/* Active Pickup Action Card (Large Touch Targets for Field Operation) */}
      {activeStop && routeStarted ? (
        <div className={`p-6 rounded-3xl shadow-2xl space-y-5 relative border ${
          isLight ? 'bg-white border-emerald-300 shadow-emerald-500/10' : 'bg-slate-900 border-emerald-500/40'
        }`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-slate-800">
            <span className="text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-300">
              NEXT STOP #{activeStop.id.slice(-2)}
            </span>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-300">
              Priority: {activeStop.priority.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeStop.household_address}</h3>
            <p className={`text-xs flex items-center ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <MapPin className="w-4 h-4 text-emerald-600 mr-1" />
              Zone 1 • Sunrise Enclave Sector
            </p>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-850 border-slate-700 text-slate-300'
            }`}>
              <div>Waste Stream: <strong className="uppercase text-emerald-700 dark:text-white">{activeStop.waste_category}</strong></div>
              <div>Estimated Weight: <strong>{activeStop.estimated_weight_kg} kg</strong></div>
              {activeStop.notes && <div className="text-amber-700 dark:text-amber-300 font-medium">Notes: {activeStop.notes}</div>}
            </div>
          </div>

          {/* Minimal Typing Action Buttons Grid */}
          <div className="space-y-3 pt-2">
            
            {/* Primary Action Button: ARRIVED or COLLECTED */}
            {!stopArrived ? (
              <button
                onClick={() => setStopArrived(true)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-extrabold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition active:scale-98"
              >
                <Navigation className="w-6 h-6" />
                <span>ARRIVED AT LOCATION</span>
              </button>
            ) : (
              <button
                onClick={() => setShowWeightModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-extrabold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>MARK COLLECTED</span>
              </button>
            )}

            {/* Secondary Minimal Typing Actions: REPORT ISSUE / SKIP */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowIssueModal(true)}
                className={`py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-1.5 border transition ${
                  isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>REPORT ISSUE</span>
              </button>

              <button
                onClick={handleSkipStop}
                className={`py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-1.5 border transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <SkipForward className="w-4 h-4 text-slate-600" />
                <span>SKIP STOP</span>
              </button>
            </div>

          </div>

        </div>
      ) : routeStarted && (
        <div className={`p-8 rounded-3xl text-center space-y-3 border ${
          isLight ? 'bg-white border-emerald-100' : 'bg-slate-900 border-slate-800'
        }`}>
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>All Route Stops Completed!</h3>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Head to Central MRF Facility #1 for waste batch handover.</p>
        </div>
      )}

      {/* Route Stop Queue */}
      <div className={`p-5 rounded-3xl space-y-3 border ${
        isLight ? 'bg-white border-emerald-100' : 'bg-slate-900 border-slate-800'
      }`}>
        <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Today's Stop List
        </h4>

        <div className="space-y-2">
          {collections.map(item => (
            <div
              key={item.id}
              onClick={() => { setActiveStop(item); setStopArrived(false); }}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition ${
                activeStop?.id === item.id 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' 
                  : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="font-bold block">{item.household_address}</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.waste_category} • Est: {item.estimated_weight_kg} kg</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                item.status === 'collected' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actual Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-6 space-y-4 relative border shadow-2xl ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setShowWeightModal(false)}
              className={`absolute top-4 right-4 p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-base">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span>Record Actual Collection Weight</span>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Actual Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 text-2xl font-mono font-bold text-center focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <label className={`flex items-center space-x-2 text-xs font-medium cursor-pointer pt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <input
                type="checkbox"
                checked={segregationVerified}
                onChange={(e) => setSegregationVerified(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500"
              />
              <span>Segregation verified at collection point</span>
            </label>

            <button
              onClick={handleConfirmCollection}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition"
            >
              CONFIRM & GENERATE BATCH
            </button>
          </div>
        </div>
      )}

      {/* Collector Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 space-y-4 relative border shadow-2xl ${
            isLight ? 'bg-white border-rose-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setShowIssueModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-base">
              <AlertCircle className="w-6 h-6" />
              <span>Report Field Operational Exception</span>
            </div>

            <p className="text-xs text-slate-500">
              Location: <strong>{activeStop?.household_address}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Issue Category</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className={`w-full rounded-2xl p-3 border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="overflow">Bin Overflowing / Excess Volume</option>
                  <option value="missed_collection">Access Blocked / Gated Entry</option>
                  <option value="illegal_dumping">Contaminated Waste / Unsegregated</option>
                  <option value="damaged_bin">Damaged Bin / Infrastructure Fault</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Field Notes</label>
                <textarea
                  rows={3}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  className={`w-full rounded-2xl p-3 border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitIssue}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-lg shadow-rose-600/30 transition"
              >
                DISPATCH TO SUPERVISOR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
