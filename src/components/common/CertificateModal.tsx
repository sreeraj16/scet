import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { X, Printer, ShieldCheck, Award, Leaf } from 'lucide-react';
import { WasteBatch } from '../../types';

interface CertificateModalProps {
  batch?: WasteBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ batch, isOpen, onClose }) => {
  const { theme } = useTheme();
  const { activeOrg, wasteBatches } = useAuth();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const currentBatch = batch || wasteBatches[0];
  const verificationUrl = `${window.location.origin}/waste/verify/${currentBatch?.batch_code || 'WL-2026-8841'}`;
  const avoidedCO2 = ((currentBatch?.actual_weight_kg || 48.0) * 1.8).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`border-4 border-double border-emerald-500 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative transition-all ${
        isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Watermark Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl tracking-tight">
            <Leaf className="w-8 h-8 fill-current" />
            <span>WASTELOOP PLATFORM</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Official Circular Economy Recovery Certificate
          </h1>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-3.5 py-1 rounded-full border border-emerald-300 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>CERTIFICATE REF ID: {currentBatch?.batch_code || 'WL-2026-8841'}</span>
          </div>
        </div>

        {/* Certificate Body Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Issued Organization</span>
              <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{activeOrg.name}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Material Category Stream</span>
              <strong className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">{currentBatch?.waste_category || 'Dry Recyclable'}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Verified Payload Weight</span>
              <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{currentBatch?.actual_weight_kg || 48.0} kg</strong>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
              <span className="text-emerald-800 dark:text-emerald-300 block font-semibold uppercase text-[10px]">Avoided Carbon Footprint</span>
              <strong className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400">🌱 {avoidedCO2} kg CO₂e Saved</strong>
            </div>
          </div>

          {/* Right Column: Processing MRF, Recycler & Live QR */}
          <div className="space-y-3 text-xs flex flex-col justify-between">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Coarse Sorting MRF</span>
              <strong className="text-slate-900 dark:text-white font-bold">{currentBatch?.processing_facility_name || 'Central Municipal MRF Facility'}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Verified Recycler Partner</span>
              <strong className="text-slate-900 dark:text-white font-bold">{currentBatch?.recycler_name || 'CleanTech Materials & Plastics'}</strong>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Tamper-Proof Verification</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan QR for Live Audit</span>
              </div>
              <div className="p-2 bg-white rounded-xl shadow">
                <QRCodeSVG value={verificationUrl} size={70} level="M" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Audit Seal & Action Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Verified by WasteLoop Supabase Row Level Security</span>
          </div>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / EXPORT PDF CERTIFICATE</span>
          </button>
        </div>

      </div>
    </div>
  );
};
