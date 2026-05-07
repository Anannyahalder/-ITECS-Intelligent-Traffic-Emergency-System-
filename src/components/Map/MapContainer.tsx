/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { TrafficSignal, Vehicle, TrafficIncident, Route } from '@/src/types';
import { SignalMarker } from './SignalMarker';
import { VehicleMarker } from './VehicleMarker';
import { INCIDENT_COLORS, DEFAULT_CENTER } from '@/src/constants';
import { AlertCircle, MapPin, Flag, Navigation, ArrowRight, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { motion, AnimatePresence } from 'motion/react';

interface MapContainerProps {
  signals: TrafficSignal[];
  vehicles: Vehicle[];
  incidents: TrafficIncident[];
  activeRoute?: Route | null;
  selectedDestination?: { lat: number; lng: number } | null;
  onSignalClick?: (signal: TrafficSignal) => void;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPlanRoute?: () => void;
  onClearRoute?: () => void;
  isLoading?: boolean;
}

const MapEvents = ({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RouteHandler = ({ activeRoute }: { activeRoute?: Route | null }) => {
  const map = useMapEvents({});
  
  React.useEffect(() => {
    if (activeRoute && activeRoute.points.length > 0) {
      try {
        const bounds = L.latLngBounds(activeRoute.points);
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }
  }, [activeRoute, map]);

  return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({
  signals,
  vehicles,
  incidents,
  activeRoute,
  selectedDestination,
  onSignalClick,
  onVehicleClick,
  onMapClick,
  onPlanRoute,
  onClearRoute,
  isLoading,
}) => {
  const createIncidentIcon = (type: string) => {
    const markup = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        <div 
          className="p-1 rounded-full shadow-lg"
          style={{ backgroundColor: INCIDENT_COLORS[type as keyof typeof INCIDENT_COLORS] }}
        >
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
      </div>
    );
    return L.divIcon({
      html: markup,
      className: 'custom-incident-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createDestinationIcon = () => {
    const markup = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        <div className="p-1 bg-blue-600 rounded-full shadow-lg ring-2 ring-white">
          <Flag className="w-5 h-5 text-white" />
        </div>
      </div>
    );
    return L.divIcon({
      html: markup,
      className: 'custom-destination-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const handleCloseNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearRoute?.();
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <LeafletMap
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={15}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onMapClick={onMapClick} />
        <RouteHandler activeRoute={activeRoute} />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-[2000] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-100">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm font-bold text-gray-900">Calculating Route...</span>
            </div>
          </div>
        )}

        {/* Selected Destination */}
        {selectedDestination && (
          <Marker 
            position={[selectedDestination.lat, selectedDestination.lng]} 
            icon={createDestinationIcon()}
          >
            <Popup>
              <div className="text-xs font-bold">Selected Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Active Route */}
        {activeRoute && (
          <Polyline 
            positions={activeRoute.points}
            color={activeRoute.isDisrupted ? "#ef4444" : "#3b82f6"}
            weight={6}
            opacity={0.8}
            dashArray={activeRoute.isDisrupted ? "10, 10" : undefined}
          />
        )}

        {/* Incidents */}
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng]} 
            icon={createIncidentIcon(incident.type)}
          >
            <Popup>
              <div className="text-xs font-bold">
                {incident.type.replace('_', ' ').toUpperCase()}<br />
                {incident.description}<br />
                Severity: {incident.severity.toUpperCase()}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Signals */}
        {signals.map((signal) => (
          <SignalMarker 
            key={signal.id} 
            signal={signal} 
            onClick={() => onSignalClick?.(signal)} 
          />
        ))}

        {/* Vehicles */}
        {vehicles.map((vehicle) => (
          <VehicleMarker 
            key={vehicle.id} 
            vehicle={vehicle} 
            onClick={() => onVehicleClick?.(vehicle)} 
          />
        ))}
      </LeafletMap>

      {/* Legend */}
      <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 z-[1000]">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Live Traffic Monitor
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Emergency Vehicle</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Green Corridor Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span>Active Incident</span>
          </div>
        </div>
      </div>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {!activeRoute && selectedDestination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[1000]"
          >
            <button
              onClick={onPlanRoute}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-xl hover:bg-blue-500 transition-all flex items-center gap-2 ring-4 ring-blue-600/10 text-sm"
            >
              <Navigation className="w-4 h-4" />
              Plan Route
            </button>
          </motion.div>
        )}

        {activeRoute && (
          <div className="absolute top-6 right-6 w-80 space-y-4 z-[1000]">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseNavigation}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Next Step Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Next Step</p>
                <p className="text-sm font-black text-gray-900 leading-tight">
                  {activeRoute.steps[0].instruction}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">In {activeRoute.steps[0].distance}</p>
              </div>
            </motion.div>

            {/* Route Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 text-white"
            >
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <div className="w-0.5 h-6 bg-white/10" />
                  <MapPin className="w-3 h-3 text-red-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">From</p>
                    <p className="text-xs font-medium truncate">{activeRoute.startName || "Current Location"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">To</p>
                    <p className="text-xs font-medium truncate">{activeRoute.endName || "Destination"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold">{activeRoute.distance} km</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-red-500 font-black tracking-widest">LIVE</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Arrival</span>
                  <span className="text-lg font-black">{activeRoute.duration} <span className="text-xs font-medium text-white/40">mins</span></span>
                </div>
                {activeRoute.isDisrupted && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] text-red-500 font-bold uppercase">Disrupted</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
