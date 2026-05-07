

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, Vehicle } from './types';
import { RoleSelector } from './components/Auth/RoleSelector';
import { OperatorDashboard } from './components/Dashboard/OperatorDashboard';
import { ResponderApp } from './components/Responder/ResponderApp';
import { CitizenApp } from './components/Citizen/CitizenApp';
import { MapContainer } from './components/Map/MapContainer';
import { useTrafficSystem } from './hooks/useTrafficSystem';
import { ShieldAlert, Activity, Car, Map as MapIcon, LayoutDashboard } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{ lat: number; lng: number } | null>(null);
  
  const { 
    signals, 
    vehicles, 
    incidents, 
    activeRoute,
    isLoading,
    toggleEmergency,
    overrideSignal,
    reportIncident,
    calculateRoute,
    getAlternativeRoute,
    clearRoute,
    systemHealth
  } = useTrafficSystem(role);

  if (!role) {
    return <RoleSelector onSelect={setRole} />;
  }

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedDestination({ lat, lng });
  };

  const handlePlanRoute = async () => {
    if (!selectedDestination) return;

    let start: [number, number] = [28.61, 77.21]; // Default center
    
    if (role === 'responder') {
      const myVehicle = vehicles.find(v => v.type === 'ambulance') || vehicles[0];
      if (myVehicle) {
        start = [myVehicle.lat, myVehicle.lng];
      }
    }

    await calculateRoute(start, [selectedDestination.lat, selectedDestination.lng]);
  };

  const renderInterface = () => {
    switch (role) {
      case 'operator':
        return (
          <OperatorDashboard 
            signals={signals}
            vehicles={vehicles}
            incidents={incidents}
            activeRoute={activeRoute}
            selectedDestination={selectedDestination}
            systemHealth={systemHealth}
            isLoading={isLoading}
            onSignalOverride={overrideSignal}
            onIncidentReport={reportIncident}
            onMapClick={handleMapClick}
            onPlanRoute={handlePlanRoute}
            onClearRoute={() => {
              clearRoute();
              setSelectedDestination(null);
            }}
            onViewVehicleRoute={async (v) => {
              // If no destination is selected, pick a random one for demo
              const dest = selectedDestination || { lat: 28.62, lng: 77.23 };
              await calculateRoute([v.lat, v.lng], [dest.lat, dest.lng]);
            }}
          />
        );
      case 'responder':
        const myVehicle = vehicles.find(v => v.type === 'ambulance') || vehicles[0];
        return (
          <ResponderApp 
            vehicle={myVehicle}
            signals={signals}
            activeRoute={activeRoute}
            selectedDestination={selectedDestination}
            onToggleEmergency={() => toggleEmergency(myVehicle.id)}
            onCalculateRoute={calculateRoute}
            onGetAlternativeRoute={getAlternativeRoute}
            onReportIncident={reportIncident}
            onClearRoute={() => {
              clearRoute();
              setSelectedDestination(null);
            }}
            isLoading={isLoading}
          />
        );
      case 'citizen':
        const nearbyEmergencies = vehicles.filter(v => v.isActiveEmergency);
        return (
          <CitizenApp 
            incidents={incidents}
            nearbyEmergencies={nearbyEmergencies}
            activeRoute={activeRoute}
            selectedDestination={selectedDestination}
            onCalculateRoute={calculateRoute}
            onGetAlternativeRoute={getAlternativeRoute}
            onReportIncident={reportIncident}
            onClearRoute={() => {
              clearRoute();
              setSelectedDestination(null);
            }}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
      {/* Main Viewport */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showMap ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0"
            >
              <MapContainer 
                signals={signals}
                vehicles={vehicles}
                incidents={incidents}
                activeRoute={activeRoute}
                selectedDestination={selectedDestination}
                isLoading={isLoading}
                onSignalClick={(s) => console.log('Signal:', s)}
                onVehicleClick={(v) => console.log('Vehicle:', v)}
                onMapClick={handleMapClick}
                onPlanRoute={handlePlanRoute}
                onClearRoute={() => {
                  clearRoute();
                  setSelectedDestination(null);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="interface-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 z-10"
            >
              {renderInterface()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMap(!showMap)}
          className={cn(
            "absolute bottom-8 right-8 px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 font-bold text-sm transition-all border-2",
            showMap 
              ? "bg-white text-gray-900 border-gray-200" 
              : "bg-blue-600 text-white border-blue-500"
          )}
        >
          {showMap ? (
            <>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4" />
              Map View
            </>
          )}
        </motion.button>

        {/* Role Switcher (Desktop & Mobile) */}
        <div className="absolute bottom-8 left-8 z-[100] flex items-center gap-3">
          <button 
            onClick={() => setRole(null)}
            className="px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-3 h-3" />
            Switch Role
          </button>
          
          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border",
            role === 'operator' ? 'bg-blue-600/10 text-blue-600 border-blue-200' : 
            role === 'responder' ? 'bg-red-600/10 text-red-600 border-red-200' : 'bg-green-600/10 text-green-600 border-green-200'
          )}>
            {role === 'operator' ? <ShieldAlert className="w-3 h-3" /> : 
             role === 'responder' ? <Activity className="w-3 h-3" /> : <Car className="w-3 h-3" />}
            {role}
          </div>
        </div>
      </main>

      {/* Mobile Role Indicator (Hidden if we use the floating one) */}
      {/* <div className="md:hidden h-12 bg-white border-t border-gray-100 flex items-center justify-center gap-4 px-6 shrink-0"> ... </div> */}
    </div>
  );
}
