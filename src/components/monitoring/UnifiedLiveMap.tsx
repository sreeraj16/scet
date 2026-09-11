import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Truck, 
  Factory, 
  Recycle, 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  Layers, 
  RefreshCw, 
  Zap, 
  Activity, 
  Compass,
  Building,
  CheckCircle2
} from 'lucide-react';
import { geospatialEngine, SpatialDataPoint, GeospatialRiskZone } from '../../lib/geospatialEngine';

// Custom Marker Icons
const createAssetIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-unified-map-marker',
    html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.3); transition: all 0.2s;">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

export const UnifiedLiveMap: React.FC = () => {
  const { collections, vehicles, facilities, recyclers, complaints, wasteBatches, zones } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Map Filter Toggles
  const [showCollections, setShowCollections] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showHeatmaps, setShowHeatmaps] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');

  // Compute Spatial Data & Risk Layers using geospatialEngine
  const heatmapPoints: SpatialDataPoint[] = geospatialEngine.generateSpatialHeatmap(collections, complaints);
  
  const riskZones: GeospatialRiskZone[] = zones.map(zone => {
    const zCols = collections.filter(c => c.zone_id === zone.id);
    const zCmps = complaints;
    return geospatialEngine.calculateCompositeGeospatialRisk(zone, zCols, zCmps);
  });

  const center: [number, number] = [16.5420, 81.5255];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-300 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight">Unified Live Geospatial Operational Map</h1>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  REAL GPS ACTIVE
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Integrated GIS operational layer: Collection points, vehicle routes, MRF facilities, heatmaps & geospatial risk zones
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>{heatmapPoints.length} Spatial Sensors</span>
            </span>
          </div>
        </div>

        {/* Map Layer Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCollections(!showCollections)}
              className={`px-3 py-1.5 rounded-xl font-extrabold border transition flex items-center space-x-1.5 ${
                showCollections
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Collections ({collections.length})</span>
            </button>

            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`px-3 py-1.5 rounded-xl font-extrabold border transition flex items-center space-x-1.5 ${
                showVehicles
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Vehicles ({vehicles.length})</span>
            </button>

            <button
              onClick={() => setShowFacilities(!showFacilities)}
              className={`px-3 py-1.5 rounded-xl font-extrabold border transition flex items-center space-x-1.5 ${
                showFacilities
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>MRF & Recyclers ({facilities.length + recyclers.length})</span>
            </button>

            <button
              onClick={() => setShowHeatmaps(!showHeatmaps)}
              className={`px-3 py-1.5 rounded-xl font-extrabold border transition flex items-center space-x-1.5 ${
                showHeatmaps
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Density Heatmap ({heatmapPoints.length})</span>
            </button>

            <button
              onClick={() => setShowRiskZones(!showRiskZones)}
              className={`px-3 py-1.5 rounded-xl font-extrabold border transition flex items-center space-x-1.5 ${
                showRiskZones
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-850 text-slate-400 border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Geospatial Risk Layers</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(e.target.value)}
              className={`py-1.5 px-3 rounded-xl border font-bold text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-700 text-white'
              }`}
            >
              <option value="ALL">All Municipal Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className={`p-4 rounded-3xl shadow-xl border space-y-4 ${
        isLight ? 'bg-white border-emerald-100 shadow-emerald-500/5' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Collection Point Markers */}
            {showCollections && collections.map((col, idx) => (
              col.latitude && col.longitude && (
                <Marker
                  key={col.id}
                  position={[col.latitude, col.longitude]}
                  icon={createAssetIcon(col.status === 'collected' ? '#059669' : '#f59e0b', '📍')}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <p className="font-extrabold text-emerald-800">{col.household_address}</p>
                      <p className="text-slate-600 font-bold">Category: <span className="uppercase">{col.waste_category}</span></p>
                      <p className="text-slate-500 font-medium">Status: <strong>{col.status.toUpperCase()}</strong> ({col.estimated_weight_kg} kg)</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Facility Markers */}
            {showFacilities && facilities.map(fac => (
              fac.latitude && fac.longitude && (
                <Marker
                  key={fac.id}
                  position={[fac.latitude, fac.longitude]}
                  icon={createAssetIcon('#3b82f6', '🏭')}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <p className="font-extrabold text-blue-700">{fac.name}</p>
                      <p className="text-slate-600 font-bold">Type: {fac.type.toUpperCase()}</p>
                      <p className="text-slate-500">Address: {fac.address}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Recycler Markers */}
            {showFacilities && recyclers.map(rec => (
              <Marker
                key={rec.id}
                position={[16.5380, 81.5150]}
                icon={createAssetIcon('#a855f7', '♻️')}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-extrabold text-purple-700">{rec.company_name}</p>
                    <p className="text-slate-600 font-bold">Service Area: {rec.service_area}</p>
                    <p className="text-slate-500">Rating: ⭐ {rec.rating}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Spatial Density Heatmap Circle Overlays */}
            {showHeatmaps && heatmapPoints.map((pt, idx) => (
              <CircleMarker
                key={`heat-${idx}`}
                center={[pt.latitude, pt.longitude]}
                radius={12 + pt.intensity * 12}
                pathOptions={{
                  color: pt.type === 'illegal_dumping' ? '#ef4444' : '#f59e0b',
                  fillColor: pt.type === 'illegal_dumping' ? '#f87171' : '#fbbf24',
                  fillOpacity: 0.35,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 text-xs font-bold">
                    <p className="text-amber-800">{pt.label}</p>
                    <p className="text-[10px] text-slate-500">Spatial Heatmap Intensity: {(pt.intensity * 100).toFixed(0)}%</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          </MapContainer>
        </div>

        {/* Spatial Risk Zone Dashboard Drawer */}
        {showRiskZones && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-extrabold text-xs flex items-center text-slate-800 dark:text-slate-200">
              <AlertTriangle className="w-4 h-4 text-rose-500 mr-1.5" />
              Composite Geospatial Risk Layer Summary
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {riskZones.map(rz => (
                <div key={rz.zoneId} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{rz.zoneName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      rz.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      rz.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {rz.riskLevel} RISK ({rz.compositeRiskScore}%)
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Factors: {rz.contributingFactors.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
