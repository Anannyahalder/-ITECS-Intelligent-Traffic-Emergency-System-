/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrafficIncident, Vehicle, Route } from '@/src/types';
import { Card, Badge } from '@/src/components/ui';
import { 
  Navigation, 
  Search, 
  Bell, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Car,
  ChevronRight,
  Menu,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CitizenAppProps {
  incidents: TrafficIncident[];
  nearbyEmergencies: Vehicle[];
  activeRoute?: Route | null;
  selectedDestination?: { lat: number; lng: number } | null;
  onCalculateRoute: (start: [number, number], end: [number, number]) => Promise<Route | null>;
  onGetAlternativeRoute: () => Promise<Route | null>;
  onReportIncident: (incident: Partial<TrafficIncident>) => void;
  onClearRoute: () => void;
  isLoading?: boolean;
}

export const CitizenApp: React.FC<CitizenAppProps> = ({
  incidents,
  nearbyEmergencies,
  activeRoute,
  selectedDestination,
  onCalculateRoute,
  onGetAlternativeRoute,
  onReportIncident,
  onClearRoute,
  isLoading,
}) => {
  const [isReporting, setIsReporting] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<TrafficIncident | null>(null);

  const handlePlanRoute = async () => {
    if (selectedDestination) {
      // Simulate starting from a default location if user location not available
      const start: [number, number] = [28.61, 77.21]; // Near DEFAULT_CENTER
      await onCalculateRoute(start, [selectedDestination.lat, selectedDestination.lng]);
    }
  };

  const handleQuickReport = (type: 'accident' | 'heavy_traffic' | 'road_closure') => {
    const lat = selectedDestination?.lat ?? (28.61 + (Math.random() - 0.5) * 0.05);
    const lng = selectedDestination?.lng ?? (77.21 + (Math.random() - 0.5) * 0.05);

    onReportIncident({
      type,
      lat,
      lng,
      description: `Citizen reported ${type.replace('_', ' ')} ${selectedDestination ? 'at selected location' : 'near center'}`,
      severity: type === 'accident' ? 'high' : 'medium'
    });
    
    if (selectedDestination) {
      onClearRoute();
    }
    setIsReporting(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Header */}
      <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ITECS Citizen</h1>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Traffic Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto pt-6">
        {/* Search Bar / Selected Destination */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            readOnly
            placeholder={selectedDestination ? `${selectedDestination.lat.toFixed(4)}, ${selectedDestination.lng.toFixed(4)}` : "Select destination on map"} 
            className={cn(
              "w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-default",
              selectedDestination ? "text-blue-600" : "text-gray-400"
            )}
          />
          {selectedDestination && (
            <button 
              onClick={onClearRoute}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active Route & Directions - MOVED TO TOP */}
        {activeRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between flex-1">
                <div className="flex items-center gap-2">
                  Active Route
                </div>
                <div className="flex items-center gap-1.5 mr-4">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-red-500 font-black">LIVE</span>
                </div>
              </h3>
              <button 
                onClick={onClearRoute}
                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeRoute.isDisrupted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">Route Disrupted</p>
                    <p className="text-xs text-orange-700">{activeRoute.disruptionReason}</p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await onGetAlternativeRoute();
                  }}
                  className="w-full py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Recalculate Alternative Route
                </button>
              </motion.div>
            )}

            <Card className="p-4 space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="w-0.5 h-8 bg-gray-100" />
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">From</p>
                    <p className="text-sm font-bold text-gray-900">{activeRoute.startName || "Current Position"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">To</p>
                    <p className="text-sm font-bold text-gray-900">{activeRoute.endName || "Destination"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-gray-900">{activeRoute.distance} km</span>
                  <span className="text-xs text-gray-400">• {activeRoute.duration} mins</span>
                </div>
                <Badge variant={activeRoute.isDisrupted ? "warning" : "success"}>
                  {activeRoute.isDisrupted ? "Disrupted" : "Optimal"}
                </Badge>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                {activeRoute.steps.map((step, idx) => (
                  <div key={idx} className={cn(
                    "flex items-start gap-3",
                    idx !== 0 && "opacity-50"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      idx === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                    )}>
                      {idx === 0 ? <ArrowRight className="w-3 h-3" /> : <div className="w-1 h-1 bg-gray-400 rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{step.instruction}</p>
                      <p className="text-[10px] text-gray-400">{step.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Emergency Alerts */}
        {nearbyEmergencies.length > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-4"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Emergency Vehicle Nearby</p>
              <p className="text-xs text-red-700 opacity-80">Please yield and clear the path for an ambulance in Sector 42.</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="danger">Priority Corridor Active</Badge>
              </div>
            </div>
          </motion.div>
        )}

        {/* Traffic Incidents */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            Nearby Incidents
            <button className="text-blue-600 hover:underline">View All</button>
          </h3>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <Card 
                key={incident.id} 
                onClick={() => setSelectedIncident(incident)}
                className="p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  incident.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                )}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">{incident.type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      {Math.floor((Date.now() - incident.timestamp) / 60000)} mins ago
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{incident.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {Math.sqrt(Math.pow(incident.lat - 28.61, 2) + Math.pow(incident.lng - 77.21, 2)).toFixed(1)} km away
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 self-center group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions / Report Incident */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            Quick Actions
            <span className="text-[10px] text-blue-500 font-black">REPORT LIVE</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              onClick={() => handleQuickReport('accident')}
              className="p-4 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-red-50 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xs font-bold text-gray-700">Report Accident</p>
            </Card>
            <Card 
              onClick={() => handleQuickReport('heavy_traffic')}
              className="p-4 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-orange-50 group-hover:bg-orange-100 rounded-full flex items-center justify-center transition-colors">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs font-bold text-gray-700">Report Traffic</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <button 
          onClick={handlePlanRoute}
          disabled={!selectedDestination || isLoading}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white",
            selectedDestination && !isLoading
              ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" 
              : "bg-gray-300 cursor-not-allowed shadow-none",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Plan Route
            </>
          )}
        </button>
      </div>
      {/* Incident Detail Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={cn(
                "h-24 flex items-center justify-center",
                selectedIncident.severity === 'high' ? 'bg-red-600' : 'bg-orange-500'
              )}>
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      {selectedIncident.type.replace('_', ' ')}
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Incident Details
                    </p>
                  </div>
                  <Badge variant={selectedIncident.severity === 'high' ? 'danger' : 'warning'}>
                    {selectedIncident.severity.toUpperCase()} SEVERITY
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-gray-700">
                        {selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported Time</p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(selectedIncident.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{selectedIncident.description}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
