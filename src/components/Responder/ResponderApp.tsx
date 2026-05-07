import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, TrafficSignal, Route, TrafficIncident } from '@/src/types';
import { Card, Badge } from '@/src/components/ui';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  ShieldAlert, 
  PhoneCall, 
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { DEFAULT_CENTER } from '@/src/constants';

interface ResponderAppProps {
  vehicle: Vehicle;
  signals: TrafficSignal[];
  activeRoute?: Route | null;
  selectedDestination?: { lat: number; lng: number } | null;
  onToggleEmergency: () => void;
  onCalculateRoute: (start: [number, number], end: [number, number]) => Promise<Route | null>;
  onGetAlternativeRoute: () => Promise<Route | null>;
  onReportIncident: (incident: Partial<TrafficIncident>) => void;
  onClearRoute: () => void;
  isLoading?: boolean;
}

export const ResponderApp: React.FC<ResponderAppProps> = ({
  vehicle,
  signals,
  activeRoute,
  selectedDestination,
  onToggleEmergency,
  onCalculateRoute,
  onGetAlternativeRoute,
  onReportIncident,
  onClearRoute,
  isLoading,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartNavigation = async () => {
    if (selectedDestination) {
      await onCalculateRoute([vehicle.lat, vehicle.lng], [selectedDestination.lat, selectedDestination.lng]);
    } else {
      // Fallback to simulated destination if none selected on map
      const destination: [number, number] = [vehicle.lat + 0.015, vehicle.lng + 0.015];
      await onCalculateRoute([vehicle.lat, vehicle.lng], destination);
    }
    setIsNavigating(true);
  };

  const handleQuickReport = (type: 'accident' | 'heavy_traffic' | 'road_closure') => {
    const lat = selectedDestination?.lat ?? vehicle.lat;
    const lng = selectedDestination?.lng ?? vehicle.lng;

    onReportIncident({
      type,
      lat,
      lng,
      description: `Responder reported ${type.replace('_', ' ')} ${selectedDestination ? 'at selected location' : 'at current location'}`,
      severity: type === 'accident' ? 'high' : 'medium'
    });

    if (selectedDestination) {
      onClearRoute();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
            vehicle.isActiveEmergency ? "bg-red-600 shadow-red-500/50 animate-pulse" : "bg-gray-800"
          )}>
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Responder Unit</h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              {vehicle.type.replace('_', ' ')} • ID: {vehicle.id.slice(0, 6)}
            </p>
          </div>
        </div>
        <button className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all">
          <PhoneCall className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto">
        {/* Active Route & Directions - MOVED TO TOP */}
        {activeRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Mission</h3>
              <button 
                onClick={onClearRoute}
                className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {activeRoute.isDisrupted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-500">Route Disrupted</p>
                    <p className="text-xs text-red-200/70 mb-3">{activeRoute.disruptionReason}</p>
                    <button 
                      onClick={async () => {
                        await onGetAlternativeRoute();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Switch to Alternative Route
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Card variant="glass" className={cn(
              "p-4 space-y-4 transition-all duration-300",
              activeRoute.isDisrupted ? "border-red-500/30 opacity-60" : "border-white/10"
            )}>
              <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="w-0.5 h-8 bg-white/10" />
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">From</p>
                    <p className="text-sm font-medium">{activeRoute.startName || "Current Position"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">To</p>
                    <p className="text-sm font-medium">{activeRoute.endName || "Destination"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold">{activeRoute.distance} km</span>
                  <span className="text-xs text-white/40">• {activeRoute.duration} mins remaining</span>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                  activeRoute.isDisrupted ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                )}>
                  {activeRoute.isDisrupted ? 'Disrupted' : 'Optimal Path'}
                </div>
              </div>
            </Card>

            {/* Live Directions */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3 h-3 text-blue-400" />
                    Live Directions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-500 font-black">LIVE</span>
                  </div>
                </h3>
                <div className="space-y-2">
                  {activeRoute.steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl border transition-all",
                        idx === 0 ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10 opacity-60"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        idx === 0 ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-500"
                      )}>
                        {idx === 0 ? <ArrowRight className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-sm font-bold", idx === 0 ? "text-white" : "text-white/60")}>
                          {step.instruction}
                        </p>
                        <p className="text-[10px] text-white/40 font-medium">{step.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Emergency Toggle */}
        <Card 
          variant="glass" 
          className={cn(
            "p-6 border-2 transition-all duration-500",
            vehicle.isActiveEmergency ? "border-red-500 bg-red-500/10" : "border-white/10"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">Emergency Mode</h2>
              <p className="text-sm text-white/60">Activates Green Corridor priority</p>
            </div>
            <div className={cn(
              "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300",
              vehicle.isActiveEmergency ? "bg-red-600" : "bg-gray-700"
            )} onClick={onToggleEmergency}>
              <motion.div 
                animate={{ x: vehicle.isActiveEmergency ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-md" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Current Speed</p>
              <p className="text-2xl font-bold">{vehicle.speed} <span className="text-xs font-medium text-white/40">km/h</span></p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Heading</p>
              <p className="text-2xl font-bold">{Math.round(vehicle.heading)}°</p>
            </div>
          </div>
        </Card>

        {/* Quick Incident Report */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            Quick Incident Report
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickReport('accident')}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-500/20 transition-all group"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-red-100">Accident</span>
            </button>
            <button 
              onClick={() => handleQuickReport('road_closure')}
              className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex flex-col items-center gap-2 hover:bg-orange-500/20 transition-all group"
            >
              <RefreshCw className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-orange-100">Disruption</span>
            </button>
          </div>
        </div>

        {/* Navigation & Green Corridor Status */}
        <AnimatePresence>
          {vehicle.isActiveEmergency && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                Green Corridor Status
              </h3>
              <div className="space-y-2">
                {signals.slice(0, 3).map((signal, idx) => (
                  <div key={signal.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      signal.isEmergencyOverride ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-500"
                    )}>
                      {signal.isEmergencyOverride ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Signal Point {idx + 1}</p>
                      <p className="text-[10px] text-white/40 font-medium">
                        {signal.isEmergencyOverride ? 'Priority Granted • Clear' : 'Requesting Priority...'}
                      </p>
                    </div>
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      signal.isEmergencyOverride ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500"
                    )} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 bg-gray-800/50 border-t border-white/10 shrink-0">
        {!activeRoute ? (
          <button 
            onClick={handleStartNavigation}
            disabled={isLoading}
            className={cn(
              "w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
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
                Start Navigation
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40 uppercase">Estimated Arrival</p>
              <p className="text-lg font-bold">14:42 <span className="text-xs text-white/40 font-medium">PM</span></p>
            </div>
            <button 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xs transition-all"
              onClick={onClearRoute}
            >
              End Mission
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
