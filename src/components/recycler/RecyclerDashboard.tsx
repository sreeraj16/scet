import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Recycle, DollarSign, ShieldCheck, Calendar, Clock, CheckCircle2, X, Truck, QrCode } from 'lucide-react';
import { WasteBatch } from '../../types';
import { QRModal } from '../common/QRModal';

export const RecyclerDashboard: React.FC = () => {
  const { recyclers, wasteBatches, recyclingTransactions, completeRecyclerPickup, updateBatchStage, activeOrg } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const recycler = recyclers[0]; // CleanTech Materials & Plastics
  const [acceptedBatches, setAcceptedBatches] = useState<Record<string, { date: string; time: string; value: number }>>({});
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [pickupDate, setPickupDate] = useState('Tomorrow');
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [agreedValue, setAgreedValue] = useState(140);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrBatch, setActiveQrBatch] = useState<WasteBatch | undefined>(undefined);

  const dryBatches = wasteBatches.filter(b => b.dry_fraction_kg > 0 || b.waste_category === 'dry_recyclable');

  const handleOpenScheduleModal = (batch: WasteBatch) => {
    setSelectedBatch(batch);
    setAgreedValue(Math.round((batch.dry_fraction_kg || batch.actual_weight_kg || 40) * 3.5));
  };

  const handleConfirmPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setAcceptedBatches(prev => ({
      ...prev,
      [selectedBatch.id]: {
        date: pickupDate,
        time: pickupTime,
        value: agreedValue
      }
    }));

    // Generate Traceability Event
    updateBatchStage(
      selectedBatch.id, 
      'ASSIGNED_TO_RECYCLER', 
      `${recycler?.company_name || 'CleanTech Circular Facility'} Intake Gate`, 
      recycler?.company_name || 'Recycler Logistics Partner', 
      `Accepted material listing. Scheduled pickup for ${pickupDate} at ${pickupTime}. Valuation: $${agreedValue}`
    );

    setSelectedBatch(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-purple-400 bg-emerald-100 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-emerald-300">
              Verified Recycling Partner Marketplace
            </span>
            <h1 className={`text-2xl font-extrabold mt-2 tracking-tight ${isLight ? 'text-emerald-950' : 'text-white'}`}>{recycler?.company_name}</h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Service Area: {recycler?.service_area} • Rating: ⭐ {recycler?.rating}</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3.5 py-1.5 rounded-full border border-emerald-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              VERIFIED RECYCLER
            </span>
          </div>
        </div>
      </div>

      {/* Available Dry Material Batches */}
      <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-extrabold text-lg flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Recycle className="w-5 h-5 text-emerald-600 mr-2" />
            Coarsely Separated Material Listings
          </h3>
          <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ready for Circular Recovery Pickup</span>
        </div>

        <div className="space-y-3">
          {dryBatches.map(batch => {
            const isAccepted = Boolean(acceptedBatches[batch.id]);
            const acceptedData = acceptedBatches[batch.id];

            return (
              <div key={batch.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isAccepted 
                  ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                  : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-brand-400 bg-emerald-100 dark:bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      {batch.batch_code}
                    </span>
                    <span className={`text-xs font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{batch.waste_category}</span>
                    {isAccepted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> PICKUP SCHEDULED
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Separated Dry Mass: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{batch.dry_fraction_kg || batch.actual_weight_kg} kg</strong>
                  </p>
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Origin: <strong>{batch.processing_facility_name || 'Central MRF'}</strong>
                    {isAccepted && (
                      <span className="block text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        Scheduled for {acceptedData?.date} at {acceptedData?.time} • Estimated Valuation: ${acceptedData?.value}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveQrBatch(batch);
                      setQrModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold flex items-center"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4 mr-1 text-slate-500" />
                    <span>QR</span>
                  </button>

                  {!isAccepted ? (
                    <button
                      onClick={() => handleOpenScheduleModal(batch)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition shadow-md shadow-emerald-600/20 whitespace-nowrap"
                    >
                      Accept Material & Schedule Pickup
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-4 py-2.5 rounded-2xl cursor-default flex items-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accepted & Scheduled
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Recycling Transactions */}
      <div className={`p-6 rounded-3xl shadow-xl space-y-4 border ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className={`font-extrabold text-lg flex items-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
          Completed Recycling Transactions & Value Logs
        </h3>

        <div className="space-y-3">
          {recyclingTransactions.map(tx => (
            <div key={tx.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
            }`}>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{tx.material_type}</span>
                  <span className="font-mono text-emerald-800 dark:text-brand-400 bg-emerald-100 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-emerald-300">
                    {tx.batch_code}
                  </span>
                </div>
                <p className={`text-[11px] font-medium mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Weight: {tx.weight_kg} kg • Agreed Value: ${tx.agreed_value_usd}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 uppercase bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300">
                  {tx.status}
                </span>

                {tx.status !== 'completed' && (
                  <button
                    onClick={() => completeRecyclerPickup(tx.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
                  >
                    Confirm Weight & Value
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Pickup Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl relative ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Schedule Recycler Pickup</h3>
                <p className="text-xs text-slate-400">Batch #{selectedBatch.batch_code}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmPickup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Pickup Date</label>
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="In 2 Days">In 2 Days</option>
                  <option value="This Friday">This Friday</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Time Slot</label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="09:00 AM">09:00 AM Morning</option>
                  <option value="11:30 AM">11:30 AM Late Morning</option>
                  <option value="02:30 PM">02:30 PM Afternoon</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Agreed Material Valuation ($)</label>
                <input
                  type="number"
                  value={agreedValue}
                  onChange={(e) => setAgreedValue(Number(e.target.value))}
                  className={`w-full border rounded-xl p-2.5 font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-500/20"
              >
                Confirm Pickup & Persist to Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      <QRModal
        batch={activeQrBatch}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

    </div>
  );
};
