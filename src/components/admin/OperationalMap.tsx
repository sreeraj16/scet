import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Layers, MapPin, Truck, AlertTriangle, Factory, Recycle } from 'lucide-react';
import L from 'leaflet';

// Custom Map Marker Icons using Leaflet divIcon
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; shadow: 0 4px 10px rgba(0,0,0,0.5);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const OperationalMap: React.FC = () => {
  const { collections, vehicles, iotDevices, facilities, recyclers, complaints } = useAuth();

  const [layers, setLayers] = useState({
    collections: true,
    vehicles: true,
    overflow: true,
    hotspots: true,
    facilities: true,
    recyclers: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Map center: Green Valley / Campus district coordinates
  const mapCenter: [number, number] = [16.5440, 81.5270];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      
      {/* Map Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-bold text-white">GIS Operations Map</h2>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
            SIMULATED GPS
          </span>
        </div>

        {/* Layer Switches */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => toggleLayer('collections')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
              layers.collections ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => toggleLayer('vehicles')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
              layers.vehicles ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => toggleLayer('overflow')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
              layers.overflow ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            IoT Bins
          </button>
          <button
            onClick={() => toggleLayer('hotspots')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
              layers.hotspots ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Hotspots
          </button>
          <button
            onClick={() => toggleLayer('facilities')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
              layers.facilities ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Facilities
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-700 z-10 relative shadow-inner">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Layer 1: Vehicles */}
          {layers.vehicles && (
            <Marker 
              position={[16.5420, 81.5255]} 
              icon={createCustomIcon('#0284c7', '🚛')}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong className="text-slate-900 block font-bold">Vehicle AP-37-T-4912</strong>
                  <div>Collector: Ramesh Kumar</div>
                  <div>Load: 3250 kg / 5000 kg (65%)</div>
                  <div className="text-emerald-600 font-semibold">Status: ON ROUTE</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Layer 2: Collections */}
          {layers.collections && collections.map((col, idx) => (
            <Marker 
              key={col.id} 
              position={[16.5412 + (idx * 0.002), 81.5245 + (idx * 0.003)]} 
              icon={createCustomIcon('#10b981', '📍')}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong className="text-slate-900 block font-bold">{col.household_address}</strong>
                  <div>Category: {col.waste_category}</div>
                  <div>Priority: {col.priority.toUpperCase()}</div>
                  <div className="font-semibold text-emerald-600">Status: {col.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 3: IoT Overflow Smart Bins */}
          {layers.overflow && iotDevices.map(device => (
            <Marker 
              key={device.id} 
              position={[device.latitude, device.longitude]} 
              icon={createCustomIcon('#d97706', '⚠️')}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong className="text-slate-900 block font-bold">{device.location_name}</strong>
                  <div>Fill Level: <strong>{device.fill_level_percent}%</strong></div>
                  <div>Overflow Risk: 86%</div>
                  <div className="text-amber-600 font-bold">Action: Dispatch within 4 hours</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 4: Facilities */}
          {layers.facilities && facilities.map(fac => (
            <Marker 
              key={fac.id} 
              position={[fac.latitude, fac.longitude]} 
              icon={createCustomIcon('#7c3aed', '🏭')}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong className="text-slate-900 block font-bold">{fac.name}</strong>
                  <div>Type: {fac.type}</div>
                  <div>Capacity: {fac.daily_capacity_tons} Tons/Day</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 5: Hotspots */}
          {layers.hotspots && complaints.filter(c => c.category === 'illegal_dumping').map(cmp => (
            <Marker 
              key={cmp.id} 
              position={[cmp.latitude || 16.5450, cmp.longitude || 81.5290]} 
              icon={createCustomIcon('#dc2626', '🚨')}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong className="text-slate-900 block font-bold">Illegal Dumping Ticket {cmp.ticket_code}</strong>
                  <div>Description: {cmp.description}</div>
                  <div className="text-rose-600 font-bold">Status: {cmp.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>

    </div>
  );
};
