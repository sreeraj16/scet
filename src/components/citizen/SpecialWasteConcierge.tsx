import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { WasteCategory } from '../../types';
import { ArrowRight, Sparkles, CheckCircle2, MapPin, Calendar, Clock, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

interface SpecialWasteConciergeProps {
  onSuccess?: () => void;
}

export const SpecialWasteConcierge: React.FC<SpecialWasteConciergeProps> = ({ onSuccess }) => {
  const { createSpecialWasteRequest, activeOrg, setActiveNavView } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | null>(null);
  const [address, setAddress] = useState('Campus Hostel Block 4, Sector 1');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredTime, setPreferredTime] = useState('Morning (8:00 - 10:00 AM)');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [createdRequestId, setCreatedRequestId] = useState<string>('');

  const options = [
    { id: 'bulky', title: 'Furniture', emoji: '🛋️', desc: 'Wooden chairs, tables, sofas', rec: 'Heavy Pickup Dispatch' },
    { id: 'bulky', title: 'Mattress', emoji: '🛏️', desc: 'Foam, spring, cotton mattresses', rec: 'Specialized Bulky Waste Handler' },
    { id: 'appliances', title: 'Refrigerator', emoji: '🧊', desc: 'Single/double door fridges, chillers', rec: 'Authorized E-Waste & Freon Recycler' },
    { id: 'appliances', title: 'Washing Machine', emoji: '🧺', desc: 'Dryers, washers, heavy laundry units', rec: 'Appliance Recovery Center' },
    { id: 'e_waste', title: 'Computer', emoji: '💻', desc: 'Desktops, laptops, monitors, servers', rec: 'Authorized E-Waste Recycler' },
    { id: 'e_waste', title: 'Electronics', emoji: '📱', desc: 'Phones, chargers, cables, TVs', rec: 'E-Waste Material Recovery' },
    { id: 'hazardous', title: 'Battery', emoji: '🔋', desc: 'Lithium, lead-acid, lab cells', rec: 'Hazardous Waste Safe Facility' },
    { id: 'wet_organic', title: 'Garden Waste', emoji: '🌿', desc: 'Tree branches, lawn prunings', rec: 'Biomass Composting Plant' },
    { id: 'mixed', title: 'Construction Waste', emoji: '🧱', desc: 'Bricks, tiles, concrete debris', rec: 'Aggregates Recycling Facility' },
    { id: 'mixed', title: 'Other Special Item', emoji: '📦', desc: 'Oversized or non-standard waste', rec: 'Municipal Special Concierge' },
  ];

  const handleSelect = (catId: WasteCategory, itemTitle: string) => {
    setSelectedCategory(catId);
    if (!notes) setNotes(`Request for ${itemTitle}`);
    setStep('confirm');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    const reqId = `WL-SP-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedRequestId(reqId);
    createSpecialWasteRequest(selectedCategory, notes, address);
    setStep('success');
    onSuccess?.();
  };

  const activeOption = options.find(o => o.id === selectedCategory);

  return (
    <div className={`p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border transition-colors duration-300 ${
      isLight 
        ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' 
        : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-purple-500/10 border border-emerald-200 dark:border-purple-500/30 flex items-center justify-center text-2xl">
          🛋️
        </div>
        <div>
          <h2 className={`text-xl font-extrabold ${isLight ? 'text-emerald-950' : 'text-white'}`}>Special Waste Concierge</h2>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            "I have something that doesn't belong in normal garbage." • {activeOrg.name}
          </p>
        </div>
      </div>

      {step === 'success' ? (
        <div className="py-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Special Waste Collection Confirmed
            </span>
            <h3 className="text-2xl font-black mt-2">Request #{createdRequestId}</h3>
            <p className="text-xs text-slate-400 mt-1">Your special pickup request has been saved to Supabase and dispatched to Zone 1 dispatch.</p>
          </div>

          <div className={`max-w-md mx-auto p-5 rounded-2xl border text-left text-xs space-y-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Waste Type</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{activeOption?.title} ({activeOption?.emoji})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Quantity / Weight</span>
              <span className="font-bold">Estimated 25.0 kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Pickup Location</span>
              <span className="font-bold truncate max-w-[200px]">{address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">GPS Coordinates</span>
              <span className="font-bold text-emerald-500">12.9750° N, 77.5900° E (±8m)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Preferred Date & Time</span>
              <span className="font-bold">{preferredDate} · {preferredTime}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Dispatch Status</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                ● Collector Dispatched
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => {
                setStep('select');
                setSelectedCategory(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              New Special Pickup
            </button>

            <button
              onClick={() => setActiveNavView('schedules')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center"
            >
              <span>View Collection</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      ) : step === 'select' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {options.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => handleSelect(item.id as WasteCategory, item.title)}
              className={`p-4 rounded-2xl text-left transition group space-y-2 border flex flex-col justify-between ${
                isLight 
                  ? 'bg-slate-50 hover:bg-emerald-50/70 border-slate-200 hover:border-emerald-300 shadow-sm' 
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50'
              }`}
            >
              <div className="text-3xl font-normal group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <div>
                <h4 className={`font-extrabold text-sm ${isLight ? 'text-slate-900 group-hover:text-emerald-800' : 'text-slate-100'}`}>{item.title}</h4>
                <p className={`text-[11px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{item.desc}</p>
              </div>
              <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">
                {item.rec}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-700'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              Selected Item: <span className="text-emerald-700 dark:text-emerald-400">{activeOption?.title} ({activeOption?.emoji})</span>
            </span>
            <button
              type="button"
              onClick={() => setStep('select')}
              className="text-xs font-bold text-emerald-700 dark:text-slate-400 underline hover:text-emerald-800"
            >
              Change
            </button>
          </div>

          <div className="p-3.5 bg-emerald-100/80 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-950 dark:text-emerald-300 font-medium">
            <strong>Routing Pathway:</strong> {activeOption?.rec}. An authorized pickup collector will be scheduled.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Preferred Pickup Date</label>
              <select
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Tomorrow">Tomorrow</option>
                <option value="In 2 Days">In 2 Days</option>
                <option value="This Weekend">This Weekend</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Preferred Time Window</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Morning (8:00 - 10:00 AM)">Morning (8:00 - 10:00 AM)</option>
                <option value="Afternoon (1:00 - 3:00 PM)">Afternoon (1:00 - 3:00 PM)</option>
                <option value="Evening (5:00 - 7:00 PM)">Evening (5:00 - 7:00 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Pickup Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Item Details / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Old refrigerator on ground floor porch..."
              className={`w-full border rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20"
          >
            <span>Confirm Special Pickup Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

    </div>
  );
};
