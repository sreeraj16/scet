import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  X,
  Truck
} from 'lucide-react';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringScheduleWizard: React.FC<WizardProps> = ({ isOpen, onClose }) => {
  const { addCollection, activeOrg } = useAuth();
  const { theme } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [address, setAddress] = useState<string>('Campus Quarter #14, Green Valley Ward 4');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Wet Organic', 'Dry Recyclable']);
  const [frequency, setFrequency] = useState<string>('Every 2 days');
  const [preferredTime, setPreferredTime] = useState<string>('Morning (8:00 - 10:00 AM)');
  const [isActivated, setIsActivated] = useState<boolean>(false);

  if (!isOpen) return null;

  const wasteTypeOptions = [
    { id: 'Wet Organic', label: 'Wet Organic Waste', desc: 'Food scraps, kitchen waste, garden clippings', icon: '🍎' },
    { id: 'Dry Recyclable', label: 'Dry Recyclable', desc: 'Plastics, packaging, paper, cardboard', icon: '📦' },
    { id: 'Hazardous / E-Waste', label: 'Household E-Waste', desc: 'Batteries, small electronics, bulb fixtures', icon: '🔋' },
    { id: 'Glass & Metal', label: 'Glass & Metal Containers', desc: 'Bottles, aluminum cans, metal tins', icon: '🍾' }
  ];

  const frequencyOptions = [
    { id: 'Daily', label: 'Daily Collection', desc: '7 days a week pickup' },
    { id: 'Every 2 days', label: 'Every 2 Days', desc: 'Recommended for typical households' },
    { id: 'Every 3 days', label: 'Every 3 Days', desc: 'Ideal for low waste generation' },
    { id: 'Twice a week', label: 'Twice a Week', desc: 'Mondays and Thursdays' },
    { id: 'Weekly', label: 'Weekly Pickup', desc: 'Every Saturday morning' }
  ];

  const timeOptions = [
    { id: 'Morning (8:00 - 10:00 AM)', label: 'Morning Slot', range: '8:00 AM – 10:00 AM' },
    { id: 'Afternoon (1:00 - 3:00 PM)', label: 'Afternoon Slot', range: '1:00 PM – 3:00 PM' },
    { id: 'Evening (5:00 - 7:00 PM)', label: 'Evening Slot', range: '5:00 PM – 7:00 PM' }
  ];

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const handleActivate = () => {
    addCollection({
      type: 'normal',
      waste_category: 'mixed',
      household_address: address,
      notes: `Recurring schedule: ${frequency} during ${preferredTime}. Types: ${selectedTypes.join(', ')}`
    });
    setIsActivated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>

        {/* Wizard Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Automated Recurring Collection Setup</h3>
              <p className="text-[11px] text-slate-400">Zero-Effort Logistics Activation ({activeOrg.name})</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {!isActivated && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Step {step} of 5</span>
              <span className="text-emerald-500 font-bold">
                {step === 1 && 'Collection Location'}
                {step === 2 && 'Waste Categories'}
                {step === 3 && 'Frequency Setup'}
                {step === 4 && 'Time Slot'}
                {step === 5 && 'Review & Activate'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard Body */}
        <div className="p-6 min-h-[320px] flex flex-col justify-center">

          {isActivated ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-emerald-500">Recurring Schedule Active!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your zero-effort collection service is now configured. Collectors and compaction vehicles will automatically service <strong>{address}</strong> on a <strong>{frequency}</strong> schedule.
              </p>
              
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 max-w-md mx-auto text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="font-bold">KA-01-EA-2026 (Compactor Truck)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="font-bold">Rajesh Kumar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Next Scheduled Window:</span>
                  <span className="font-bold text-emerald-500">Tomorrow · 8:00–10:00 AM</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: LOCATION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">1. Confirm Collection Location</h4>
                    <p className="text-xs text-slate-400">Where should our zero-emission collection vehicle pick up your waste?</p>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Pickup Address</label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                            theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => setAddress('Detected Address: 16.4344° N, 81.6965° E (Swarnandhra Main Gate)')}
                        className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20"
                      >
                        GPS Detect
                      </button>
                    </div>
                  </div>

                  {/* Visual Map Mock */}
                  <div className="h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950/60 relative overflow-hidden flex items-center justify-center">
                    <div className="text-center text-xs text-slate-400 z-10">
                      <MapPin className="w-6 h-6 text-emerald-500 animate-bounce mx-auto mb-1" />
                      <span>{address}</span>
                      <span className="block text-[10px] text-emerald-400 font-medium mt-0.5">● GIS Zone 1 Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: WASTE TYPES */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">2. Select Segregated Waste Categories</h4>
                    <p className="text-xs text-slate-400">Select all categories generated by your household/facility.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wasteTypeOptions.map(t => {
                      const isSelected = selectedTypes.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleType(t.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base">{t.icon} {t.label}</span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: FREQUENCY */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">3. Collection Frequency</h4>
                    <p className="text-xs text-slate-400">How often should our collectors service your location?</p>
                  </div>

                  <div className="space-y-2">
                    {frequencyOptions.map(f => (
                      <div
                        key={f.id}
                        onClick={() => setFrequency(f.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          frequency === f.id
                            ? 'border-emerald-500 bg-emerald-500/10 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{f.label}</p>
                          <p className="text-[11px] text-slate-400">{f.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          frequency === f.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'
                        }`}>
                          {frequency === f.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: TIME SLOT */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">4. Preferred Collection Window</h4>
                    <p className="text-xs text-slate-400">Choose the optimal time window for pickup.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timeOptions.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setPreferredTime(t.id)}
                        className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                          preferredTime === t.id
                            ? 'border-emerald-500 bg-emerald-500/10 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <Clock className={`w-6 h-6 mx-auto mb-2 ${preferredTime === t.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <h5 className="text-xs font-bold">{t.label}</h5>
                        <p className="text-[10px] text-slate-400 mt-1">{t.range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold">5. Review & Activate Service</h4>
                    <p className="text-xs text-slate-400">Review your automated zero-effort collection plan.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 text-xs">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-400 block">Pickup Location</span>
                        <span className="font-bold">{address}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-400 block">Waste Types</span>
                        <span className="font-bold">{selectedTypes.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-400 block">Frequency & Time</span>
                        <span className="font-bold">{frequency} during {preferredTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Wizard Footer Controls */}
        {!isActivated && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(prev => Math.min(5, prev + 1))}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20"
              >
                <Truck className="w-4 h-4" />
                <span>Activate Collection Schedule</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
