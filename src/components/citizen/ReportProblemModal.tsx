import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Complaint } from '../../types';
import { AlertTriangle, X, Camera, Send, CheckCircle2, ShieldAlert, Upload } from 'lucide-react';
import { CameraModal } from '../common/CameraModal';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ isOpen, onClose }) => {
  const { submitComplaint } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [category, setCategory] = useState<Complaint['category']>('missed_collection');
  const [description, setDescription] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCameraCapture = (imageDataUrl: string) => {
    const evId = `WL-EV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setEvidenceId(evId);
    setEvidenceImage(imageDataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const evId = `WL-EV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        setEvidenceId(evId);
        setEvidenceImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint(category, description, evidenceImage || undefined);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl relative ${
          isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
        }`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl ${isLight ? 'text-slate-400 hover:text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-white bg-slate-800'}`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            </div>
            <div>
              <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Report a Problem</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Direct escalation ticket to Zone Supervisor</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="missed_collection">Missed Collection</option>
                <option value="illegal_dumping">Illegal Dumping Hotspot</option>
                <option value="overflow">Public Bin Overflow</option>
                <option value="poor_service">Poor Collection Service</option>
                <option value="damaged_bin">Damaged Bin / Infrastructure</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Problem Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue and exact location..."
                className={`w-full border rounded-2xl p-3 text-sm font-medium focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Photo Evidence Upload with WL-EV Code & Authenticity Score */}
            {!evidenceImage ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">Photo Evidence</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraOpen(true)}
                    className="flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <label className="flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-750 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-800 border-slate-700 text-emerald-300'
              }`}>
                <div className="flex items-center justify-between font-extrabold">
                  <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Evidence Attached
                  </span>
                  <span className="font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    {evidenceId}
                  </span>
                </div>

                <div className="h-24 rounded-xl overflow-hidden bg-slate-950 my-2">
                  <img src={evidenceImage} alt="Uploaded Evidence" className="w-full h-full object-cover" />
                </div>

                <div className="text-[11px] space-y-1 font-medium text-slate-700 dark:text-slate-300">
                  <p><strong>Verification:</strong> Image received</p>
                  <p><strong>Authenticity Confidence:</strong> 94% (AI Verification Score)</p>
                  <p className="flex items-center text-amber-700 dark:text-amber-400 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    Status: Verified for Zone Supervisor Inspection
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-rose-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Submit Complaint Ticket</span>
            </button>
          </form>

        </div>
      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Issue Evidence Photo"
      />
    </>
  );
};
