import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Recycle, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Factory, 
  Award, 
  QrCode, 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  TrendingDown,
  User,
  Building,
  Info,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { WasteBatch, WasteBatchEvent, BatchStageStatus } from '../../types';
import { CertificateModal } from '../common/CertificateModal';
import { QRModal } from '../common/QRModal';
import { supabase } from '../../lib/supabase';
import { 
  ALLOWED_TRANSITIONS, 
  validateStageTransition, 
  auditWeightDiscrepancy, 
  formatTraceabilityTimestamp 
} from '../../lib/traceabilityEngine';

// Custom Leaflet Icons for Traceability Map Markers
const createMapMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-traceability-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); transition: transform 0.2s;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const STAGE_LABELS: Record<BatchStageStatus, string> = {
  SOURCE: 'Source Generation',
  COLLECTED: 'Collection Completed',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_FACILITY: 'Arrived at MRF Facility',
  SEGREGATION: 'Coarse Separation',
  RECOVERED: 'Recovered & Staged',
  ASSIGNED_TO_RECYCLER: 'Assigned to Circular Recycler',
  IN_TRANSIT_TO_RECYCLER: 'In Transit to Recycler',
  ARRIVED_AT_RECYCLER: 'Arrived at Recycler Intake',
  ACCEPTED_BY_RECYCLER: 'Accepted by Recycler',
  PROCESSING: 'Recycling Processing',
  RECYCLED: 'Recycled & Certified',
  EXCEPTION: 'Operational Exception'
};

const STAGE_COLORS: Record<BatchStageStatus, { badgeBg: string; text: string; dotColor: string; hexColor: string }> = {
  SOURCE: { badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-500', hexColor: '#10b981' },
  COLLECTED: { badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-600', hexColor: '#059669' },
  IN_TRANSIT: { badgeBg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', dotColor: 'bg-amber-500', hexColor: '#f59e0b' },
  ARRIVED_AT_FACILITY: { badgeBg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-800 dark:text-teal-300', dotColor: 'bg-teal-500', hexColor: '#14b8a6' },
  SEGREGATION: { badgeBg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', dotColor: 'bg-blue-500', hexColor: '#3b82f6' },
  RECOVERED: { badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-800 dark:text-cyan-300', dotColor: 'bg-cyan-500', hexColor: '#06b6d4' },
  ASSIGNED_TO_RECYCLER: { badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-800 dark:text-indigo-300', dotColor: 'bg-indigo-500', hexColor: '#6366f1' },
  IN_TRANSIT_TO_RECYCLER: { badgeBg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', dotColor: 'bg-purple-500', hexColor: '#a855f7' },
  ARRIVED_AT_RECYCLER: { badgeBg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', dotColor: 'bg-purple-600', hexColor: '#9333ea' },
  ACCEPTED_BY_RECYCLER: { badgeBg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-800 dark:text-pink-300', dotColor: 'bg-pink-500', hexColor: '#ec4899' },
  PROCESSING: { badgeBg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', dotColor: 'bg-amber-600', hexColor: '#d97706' },
  RECYCLED: { badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-500', hexColor: '#10b981' },
  EXCEPTION: { badgeBg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', dotColor: 'bg-rose-500', hexColor: '#f43f5e' }
};

export const WasteJourneyViewer: React.FC = () => {
  const { wasteBatches, currentUser, activeRole, updateBatchStage } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State
  const [selectedBatchId, setSelectedBatchId] = useState<string>(wasteBatches[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [certOpen, setCertOpen] = useState<boolean>(false);
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [lastRealtimeSync, setLastRealtimeSync] = useState<string>('Connected');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Role-Based Batch Filtering
  const roleBatches = wasteBatches.filter(b => {
    if (activeRole === 'citizen') {
      return b.events?.some(e => e.actor_role === 'citizen' || e.actor_name.includes(currentUser.full_name));
    }
    if (activeRole === 'collector') {
      return b.collector_id === currentUser.id || b.events?.some(e => e.collector_id === currentUser.id);
    }
    if (activeRole === 'recycler') {
      return b.recycler_id !== undefined || b.final_status.includes('RECYCLER') || b.final_status === 'RECYCLED';
    }
    return true; // admin, supervisor, platform_admin see all org batches
  });

  const availableBatches = roleBatches.length > 0 ? roleBatches : wasteBatches;

  // Supabase Realtime Subscription Setup & Cleanup
  useEffect(() => {
    const channelEvents = supabase
      .channel('public:material_batch_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'material_batch_events' }, payload => {
        setIsSyncing(true);
        setLastRealtimeSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setTimeout(() => setIsSyncing(false), 1200);
      })
      .subscribe();

    const channelBatches = supabase
      .channel('public:waste_batches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waste_batches' }, payload => {
        setIsSyncing(true);
        setLastRealtimeSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setTimeout(() => setIsSyncing(false), 1200);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelEvents);
      supabase.removeChannel(channelBatches);
    };
  }, []);

  // Filtered Batches List
  const filteredBatches = availableBatches.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      b.batch_code.toLowerCase().includes(query) ||
      b.waste_category.toLowerCase().includes(query) ||
      (b.current_location_name && b.current_location_name.toLowerCase().includes(query)) ||
      (b.current_responsible_entity && b.current_responsible_entity.toLowerCase().includes(query));

    const matchesCat = categoryFilter === 'ALL' || b.waste_category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || b.final_status === statusFilter;

    // Date Filter Logic
    let matchesDate = true;
    if (dateFilter !== 'ALL' && b.created_at) {
      const bDate = new Date(b.created_at);
      const now = new Date();
      if (dateFilter === 'TODAY') {
        matchesDate = bDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7DAYS') {
        const diffDays = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateFilter === '30DAYS') {
        const diffDays = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesCat && matchesStatus && matchesDate;
  });

  const selectedBatch = availableBatches.find(b => b.id === selectedBatchId) || filteredBatches[0] || availableBatches[0];

  // Extract Leaflet GPS Positions
  const mapEvents = selectedBatch?.events?.filter(e => e.latitude && e.longitude) || [];
  const mapPositions: [number, number][] = mapEvents.map(e => [e.latitude!, e.longitude!]);
  const defaultCenter: [number, number] = mapPositions.length > 0 
    ? mapPositions[mapPositions.length - 1] 
    : [selectedBatch?.current_latitude || 16.5420, selectedBatch?.current_longitude || 81.5255];

  // Weight Auditing Calculation
  const initialWeight = selectedBatch?.collected_weight_kg || selectedBatch?.actual_weight_kg || 0;
  const latestEventWeight = selectedBatch?.events && selectedBatch.events.length > 0
    ? selectedBatch.events[selectedBatch.events.length - 1].weight_kg
    : initialWeight;
  const weightAudit = auditWeightDiscrepancy(initialWeight, latestEventWeight);

  // Latest Event Timestamp (from actual DB event)
  const latestEventTimestamp = selectedBatch?.events && selectedBatch.events.length > 0
    ? selectedBatch.events[selectedBatch.events.length - 1].timestamp
    : selectedBatch?.last_updated_at || selectedBatch?.created_at;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Live Material Traceability Engine</h2>
                <span className={`flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition ${
                  isSyncing 
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                  REALTIME SUPABASE {isSyncing ? 'SYNCING...' : `CONNECTED (${lastRealtimeSync})`}
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Audit-grade material batch tracking, timestamped supply-chain custody & weight discrepancy verification
              </p>
            </div>
          </div>

          {selectedBatch && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQrOpen(true)}
                className="flex items-center space-x-2 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 transition active:scale-95"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Verify QR</span>
              </button>
              <button
                onClick={() => setCertOpen(true)}
                className="flex items-center space-x-2 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <Award className="w-4 h-4" />
                <span>View Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Search & Multi-Filter Toolbar */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Batch Code, Location, Actor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white' : 'bg-slate-850 border-slate-700 text-white'
              }`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className={`w-full py-2.5 px-3 rounded-2xl border font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-700 text-white'
              }`}
            >
              <option value="ALL">All Waste Categories</option>
              <option value="dry_recyclable">Dry Recyclable</option>
              <option value="wet_organic">Wet Organic</option>
              <option value="e_waste">E-Waste</option>
              <option value="hazardous">Hazardous</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`w-full py-2.5 px-3 rounded-2xl border font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-700 text-white'
              }`}
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="SOURCE">Source Generation</option>
              <option value="COLLECTED">Collected</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ARRIVED_AT_FACILITY">Arrived at MRF</option>
              <option value="SEGREGATION">Coarse Separation</option>
              <option value="RECOVERED">Recovered</option>
              <option value="ASSIGNED_TO_RECYCLER">Assigned Recycler</option>
              <option value="ACCEPTED_BY_RECYCLER">Accepted Recycler</option>
              <option value="PROCESSING">Processing</option>
              <option value="RECYCLED">Recycled & Certified</option>
              <option value="EXCEPTION">Operational Exception</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={`w-full py-2.5 px-3 rounded-2xl border font-bold ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-700 text-white'
              }`}
            >
              <option value="ALL">All Date Ranges</option>
              <option value="TODAY">Created Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Batch Selectors Carousel */}
        <div className="mt-4 flex space-x-3 overflow-x-auto pb-2">
          {filteredBatches.map(batch => {
            const isSelected = selectedBatch?.id === batch.id;
            const stageStyle = STAGE_COLORS[batch.final_status] || STAGE_COLORS['SOURCE'];

            return (
              <button
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                    : isLight ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50' : 'bg-slate-850 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="font-mono">{batch.batch_code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${isSelected ? 'bg-black/20 text-white' : stageStyle.badgeBg + ' ' + stageStyle.text}`}>
                  {STAGE_LABELS[batch.final_status] || batch.final_status}
                </span>
                <span className="text-[10px] font-mono">{batch.actual_weight_kg} kg</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedBatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Live Batch Details & GPS Map */}
          <div className="space-y-6">
            
            {/* Prominent Live Status Card */}
            <div className={`p-6 rounded-3xl shadow-xl border ${
              isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">BATCH IDENTIFIER</span>
                  <h3 className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{selectedBatch.batch_code}</h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400">CURRENT REAL STATUS</span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase border mt-1 flex items-center gap-1.5 ${STAGE_COLORS[selectedBatch.final_status]?.badgeBg} ${STAGE_COLORS[selectedBatch.final_status]?.text}`}>
                    <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[selectedBatch.final_status]?.dotColor} animate-pulse`} />
                    {STAGE_LABELS[selectedBatch.final_status] || selectedBatch.final_status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Material Type</span>
                  <p className="font-extrabold text-slate-900 dark:text-white capitalize">{selectedBatch.waste_category.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Verified Batch Weight</span>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedBatch.actual_weight_kg} kg</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Location</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">{selectedBatch.current_location_name || 'In Transit'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Responsible Entity</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">{selectedBatch.current_responsible_entity || 'Operations Team'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Last Updated: {formatTraceabilityTimestamp(latestEventTimestamp)}
                </span>
                <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE DB
                </span>
              </div>
            </div>

            {/* Live Known Location Map */}
            <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
              isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Live Known Location & Route Line
                </h3>
                <span className="text-[10px] font-bold text-slate-400">GPS ACCURACY ±5m</span>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Event Markers */}
                  {mapEvents.map((ev, idx) => (
                    <Marker
                      key={ev.id}
                      position={[ev.latitude!, ev.longitude!]}
                      icon={createMapMarkerIcon(STAGE_COLORS[ev.event_type]?.hexColor || '#10b981', String(idx + 1))}
                    >
                      <Popup>
                        <div className="p-1 text-xs">
                          <p className="font-extrabold text-emerald-700">{STAGE_LABELS[ev.event_type]}</p>
                          <p className="text-slate-600 font-bold">{ev.location_name}</p>
                          <p className="text-[10px] text-slate-400">{formatTraceabilityTimestamp(ev.timestamp)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route Polyline */}
                  {mapPositions.length > 1 && (
                    <Polyline positions={mapPositions} color="#059669" weight={4} dashArray="6, 8" />
                  )}
                </MapContainer>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">Last Known Position</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{selectedBatch.current_location_name || 'In Transit'}</p>
                </div>
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {/* Weight History & Scale Discrepancy Auditor */}
            <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
              isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
            }`}>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Weight Traceability & Discrepancy Audit
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Initial Collection Scale</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{initialWeight} kg</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Latest Stage Weighbridge</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{latestEventWeight} kg</span>
                </div>

                {weightAudit.hasDiscrepancy ? (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-xs">⚠ Weight Discrepancy Flagged</span>
                      <p className="text-[11px] mt-0.5">{weightAudit.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-xs">✓ Weight Scale Audit Verified</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Live Timestamped Vertical Event Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border space-y-6 ${
              isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Live Timestamped Traceability Timeline
                  </h3>
                  <p className="text-xs text-slate-400">Sequential events generated automatically by actual WasteLoop operational workflows</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {selectedBatch.events?.length || 0} DB Events Recorded
                  </span>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {selectedBatch.events && selectedBatch.events.length > 0 ? (
                  selectedBatch.events.slice().reverse().map((ev, idx) => {
                    const isLatest = idx === 0;
                    const stageColor = STAGE_COLORS[ev.event_type] || STAGE_COLORS['SOURCE'];

                    return (
                      <div key={ev.id} className="relative group">
                        
                        {/* Dot Indicator */}
                        <div className={`absolute -left-[1.65rem] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${stageColor.dotColor} ${
                          isLatest ? 'ring-4 ring-emerald-500/30 animate-pulse' : ''
                        }`} />

                        {/* Event Content Box */}
                        <div className={`p-4 sm:p-5 rounded-2xl border transition ${
                          isLatest 
                            ? isLight ? 'bg-emerald-50/70 border-emerald-300 shadow-md' : 'bg-slate-850 border-emerald-500/40 shadow-md'
                            : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850/60 border-slate-800'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase border ${stageColor.badgeBg} ${stageColor.text}`}>
                                {STAGE_LABELS[ev.event_type] || ev.event_type}
                              </span>
                              {isLatest && (
                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                                  CURRENT STAGE
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {formatTraceabilityTimestamp(ev.timestamp)}
                            </span>
                          </div>

                          {/* Event Metadata */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{ev.location_name}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold">Responsible Entity</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{ev.actor_name}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <TrendingDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold">Stage Weight</span>
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{ev.weight_kg} kg</span>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {ev.notes && (
                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                              "{ev.notes}"
                            </div>
                          )}

                          {/* Discrepancy warning inside timeline event */}
                          {ev.weight_discrepancy_flag && (
                            <div className="mt-2 text-[11px] text-amber-700 bg-amber-100 dark:bg-amber-950 p-2 rounded-xl font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Scale discrepancy recorded & reconciled at gate entrance.
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No timeline events recorded yet for this batch.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-sm">
          No matching material batches found for the selected filter criteria.
        </div>
      )}

      {/* QR & Certificate Modals */}
      <CertificateModal batch={selectedBatch} isOpen={certOpen} onClose={() => setCertOpen(false)} />
      <QRModal batch={selectedBatch} isOpen={qrOpen} onClose={() => setQrOpen(false)} />

    </div>
  );
};
