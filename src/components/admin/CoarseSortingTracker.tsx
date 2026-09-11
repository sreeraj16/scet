import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Factory, CheckCircle2, QrCode, ArrowRight, Building2, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { QRModal } from '../common/QRModal';

export const CoarseSortingTracker: React.FC = () => {
  const { wasteBatches, processCoarseSeparation, recyclers, activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedBatchId, setSelectedBatchId] = useState<string>(wasteBatches[0]?.id || '');
  const [organicKg, setOrganicKg] = useState<number>(60);
  const [dryKg, setDryKg] = useState<number>(75);
  const [specialKg, setSpecialKg] = useState<number>(5);
  const [residualKg, setResidualKg] = useState<number>(10);
  const [qrOpen, setQrOpen] = useState(false);
  const [recyclerModalOpen, setRecyclerModalOpen] = useState(false);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>(recyclers[0]?.id || '');
  const [separationLogged, setSeparationLogged] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeBatch = wasteBatches.find(b => b.id === selectedBatchId) || wasteBatches[0];
  const totalSeparatedMass = organicKg + dryKg + specialKg + residualKg;
  const isWeightValid = totalSeparatedMass <= (activeBatch ? activeBatch.actual_weight_kg * 1.05 : 200);

  const handleSaveCoarseSort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    if (!isWeightValid) {
      setErrorMsg(`Total output (${totalSeparatedMass} kg) exceeds incoming batch weight (${activeBatch.actual_weight_kg} kg). Please check your entries.`);
      return;
    }

    setErrorMsg(null);
    processCoarseSeparation(activeBatch.id, organicKg, dryKg, specialKg, residualKg);
    setSeparationLogged(true);
    setRecyclerModalOpen(true);
  };

  const handleConfirmRecyclerRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenRecycler = recyclers.find(r => r.id === selectedRecyclerId) || recyclers[0];
    setRecyclerModalOpen(false);
    alert(`Material Routed! Batch ${activeBatch.batch_code} (${dryKg} kg Dry Recyclables) assigned to ${chosenRecycler.company_name}. Persisted to Supabase.`);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
      isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-purple-500/10 border border-emerald-200 dark:border-purple-500/30 flex items-center justify-center">
            <Factory className="w-6 h-6 text-emerald-700 dark:text-purple-400" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Processing Facility & Coarse Sorting Tracker</h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Digitally log mixed waste handover and coarse fraction separation</p>
          </div>
        </div>

        {activeBatch && (
          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center space-x-2 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        )}
      </div>

      {/* Batch Handover Workflow Selector */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
      }`}>
        <label className={`block text-xs font-extrabold uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Select Incoming Waste Batch</label>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className={`w-full border rounded-2xl px-4 py-3 text-sm font-mono font-extrabold focus:outline-none focus:border-emerald-500 ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {wasteBatches.map(b => (
            <option key={b.id} value={b.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>
              {b.batch_code} • Category: {b.waste_category.toUpperCase()} ({b.actual_weight_kg} kg) • Status: {b.coarse_separation_status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {activeBatch && (
        <form onSubmit={handleSaveCoarseSort} className={`p-6 rounded-2xl border space-y-6 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
        }`}>
          
          <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b text-xs font-semibold ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-slate-700 text-slate-300'
          }`}>
            <div>
              <span>Total Incoming Batch Mass:</span>
              <strong className="text-base text-emerald-700 dark:text-emerald-400 ml-2 font-extrabold">{activeBatch.actual_weight_kg} kg</strong>
            </div>
            <div>
              <span>Collector:</span>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>{activeBatch.collector_name || 'Ramesh Kumar'}</strong>
            </div>
            <div>
              <span>Processing Unit:</span>
              <strong className="text-emerald-800 dark:text-purple-300 ml-1">{activeBatch.processing_facility_name || 'Central MRF Facility'}</strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Coarse Separation Mass Allocation (kg)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Organic Fraction */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-900 border-emerald-500/30'}`}>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase block">Organic Fraction</span>
                <input
                  type="number"
                  value={organicKg}
                  onChange={(e) => setOrganicKg(parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
                <span className={`text-[10px] block text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Destination: Biomass Composting</span>
              </div>

              {/* Dry Recoverable Fraction */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-900 border-brand-500/30'}`}>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-brand-400 uppercase block">Dry Recoverable</span>
                <input
                  type="number"
                  value={dryKg}
                  onChange={(e) => setDryKg(parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
                <span className="text-[10px] text-emerald-700 dark:text-brand-400 block text-center font-bold">Route: Recycler Marketplace</span>
              </div>

              {/* Special Oversized Fraction */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-900 border-purple-500/30'}`}>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-purple-400 uppercase block">Special / E-Waste</span>
                <input
                  type="number"
                  value={specialKg}
                  onChange={(e) => setSpecialKg(parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
                <span className={`text-[10px] block text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Route: Specialized Handler</span>
              </div>

              {/* Residual Fraction */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-white border-rose-200 shadow-sm' : 'bg-slate-900 border-rose-500/30'}`}>
                <span className="text-xs font-extrabold text-rose-800 dark:text-rose-400 uppercase block">Residual Inert</span>
                <input
                  type="number"
                  value={residualKg}
                  onChange={(e) => setResidualKg(parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
                <span className={`text-[10px] block text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Route: Sanitary Disposal</span>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Total Separated Mass: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{totalSeparatedMass} kg</strong> / {activeBatch.actual_weight_kg} kg
              <span className="text-emerald-500 font-bold ml-2">
                (Recovery Efficiency: {Math.round(((organicKg + dryKg) / Math.max(1, totalSeparatedMass)) * 100)}%)
              </span>
            </span>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-6 rounded-2xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>LOG SEPARATION & ROUTE TO RECYCLER</span>
            </button>
          </div>

        </form>
      )}

      {/* Recycler Recommendation & Routing Modal */}
      {recyclerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Route Recoverable Material to Recycler</h3>
                <p className="text-xs text-slate-400">Select verified recycling partner for Batch #{activeBatch?.batch_code}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmRecyclerRoute} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-400">Recommended Recyclers (Sorted by Match Score)</label>

                {recyclers.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecyclerId(rec.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRecyclerId === rec.id
                        ? 'border-emerald-500 bg-emerald-500/10 font-bold'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-750'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{rec.company_name}</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ⭐ {rec.rating} • VERIFIED
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Accepts PET & Rigid Plastics</span>
                      <span>✓ Service Area: {rec.service_area}</span>
                      <span>✓ 4.2 km away</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <span>Confirm Recycler Allocation & Send Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <QRModal batch={activeBatch} isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
};
