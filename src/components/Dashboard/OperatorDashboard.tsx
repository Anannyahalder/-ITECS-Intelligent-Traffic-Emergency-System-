/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrafficSignal, Vehicle, TrafficIncident, VehicleType, Route, SystemHealth } from '@/src/types';
import { Card, Badge } from '@/src/components/ui';
import { MapContainer } from '@/src/components/Map/MapContainer';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Settings, 
  Radio, 
  Map as MapIcon,
  Bell,
  Search,
  Filter,
  Car,
  ChevronRight,
  Clock,
  Zap,
  Wifi,
  Database
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { VEHICLE_ICONS } from '@/src/constants';

interface OperatorDashboardProps {
  signals: TrafficSignal[];
  vehicles: Vehicle[];
  incidents: TrafficIncident[];
  activeRoute?: Route | null;
  selectedDestination?: { lat: number; lng: number } | null;
  systemHealth: SystemHealth;
  onSignalOverride: (id: string) => void;
  onIncidentReport: (incident: Partial<TrafficIncident>) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPlanRoute?: () => void;
  onViewVehicleRoute?: (vehicle: Vehicle) => void;
  onClearRoute?: () => void;
  isLoading?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'emergency' | 'incident' | 'system';
  isRead: boolean;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  signals,
  vehicles,
  incidents,
  activeRoute,
  selectedDestination,
  systemHealth,
  onSignalOverride,
  onIncidentReport,
  onMapClick,
  onPlanRoute,
  onViewVehicleRoute,
  onClearRoute,
  isLoading,
}) => {
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Online',
      message: 'ITECS Mission Control is now operational.',
      timestamp: Date.now() - 3600000,
      type: 'system',
      isRead: true,
    }
  ]);

  // Effect to generate notifications from new incidents/emergencies
  React.useEffect(() => {
    const highIncidents = incidents.filter(i => i.severity === 'high');
    const emergencyVehicles = vehicles.filter(v => v.isActiveEmergency);

    const newNotifications: Notification[] = [];

    highIncidents.forEach(i => {
      const id = `incident-${i.id}`;
      if (!notifications.find(n => n.id === id)) {
        newNotifications.push({
          id,
          title: `High Severity: ${i.type.replace('_', ' ').toUpperCase()}`,
          message: i.description,
          timestamp: i.timestamp,
          type: 'incident',
          isRead: false,
        });
      }
    });

    emergencyVehicles.forEach(v => {
      const id = `emergency-${v.id}`;
      if (!notifications.find(n => n.id === id)) {
        newNotifications.push({
          id,
          title: 'Emergency Vehicle Detected',
          message: `Ambulance ${v.id.slice(0, 8)} is requesting priority.`,
          timestamp: Date.now(),
          type: 'emergency',
          isRead: false,
        });
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
    }
  }, [incidents, vehicles]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  const filteredVehicles = vehicles.filter(v => 
    vehicleFilter === 'all' ? true : v.type === vehicleFilter
  );

  const activeEmergencies = filteredVehicles.filter(v => v.isActiveEmergency);
  const highSeverityIncidents = incidents.filter(i => i.severity === 'high');

  const filterOptions: { id: VehicleType | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'ambulance', label: 'Ambulance', icon: Activity },
    { id: 'fire_brigade', label: 'Fire', icon: AlertTriangle },
    { id: 'police', label: 'Police', icon: ShieldAlert },
    { id: 'citizen', label: 'Citizen', icon: Car },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">ITECS Mission Control</h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Status: Operational
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search signals, vehicles..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all w-64"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all",
                showNotifications && "bg-gray-100 text-blue-600"
              )}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                >
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          className={cn(
                            "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-default relative",
                            !n.isRead && "bg-blue-50/30"
                          )}
                        >
                          {!n.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                          )}
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              n.type === 'emergency' ? 'bg-red-100 text-red-600' : 
                              n.type === 'incident' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                            )}>
                              {n.type === 'emergency' ? <Activity className="w-4 h-4" /> : 
                               n.type === 'incident' ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                              <p className="text-[9px] text-gray-400 font-medium mt-1">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button className="text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest">
                      View All Activity
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Operator #042</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Senior Controller</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Stats & Alerts */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-y-auto shrink-0">
          <div className="p-6 space-y-6">
            {/* System Health */}
            <div className="p-4 bg-gray-900 rounded-2xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Health</h3>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  systemHealth.overall > 90 ? "bg-green-500" : systemHealth.overall > 70 ? "bg-yellow-500" : "bg-red-500"
                )} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-medium text-white/60">Data Confidence</span>
                  </div>
                  <span className="text-xs font-bold">{systemHealth.dataConfidence.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-medium text-white/60">Latency</span>
                  </div>
                  <span className="text-xs font-bold">{systemHealth.networkLatency.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-medium text-white/60">Sync Rate</span>
                  </div>
                  <span className="text-xs font-bold">1.2s</span>
                </div>
              </div>
              {systemHealth.dataConfidence < 85 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[9px] text-yellow-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    INCOMPLETE DATA DETECTED
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-blue-50 border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Active Signals</p>
                <p className="text-2xl font-bold text-blue-900">{signals.length}</p>
              </Card>
              <Card className="p-3 bg-red-50 border-red-100">
                <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Emergencies</p>
                <p className="text-2xl font-bold text-red-900">{activeEmergencies.length}</p>
              </Card>
            </div>

            {/* Vehicle Filter */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Vehicle Filter
                <Badge variant="info">{vehicleFilter.toUpperCase()}</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setVehicleFilter(opt.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 text-sm font-medium rounded-xl transition-all border",
                      vehicleFilter === opt.id 
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-100" 
                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <opt.icon className={cn("w-4 h-4", vehicleFilter === opt.id ? "text-white" : "text-gray-400")} />
                      {opt.label}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                      vehicleFilter === opt.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {opt.id === 'all' 
                        ? vehicles.length 
                        : vehicles.filter(v => v.type === opt.id).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Alerts */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Priority Alerts
                <Badge variant="danger">{activeEmergencies.length + highSeverityIncidents.length}</Badge>
              </h3>
              <div className="space-y-3">
                {activeEmergencies.map((v) => (
                  <motion.div
                    key={v.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-900">Emergency Vehicle Detected</p>
                      <p className="text-xs text-red-700 opacity-80">ID: {v.id.slice(0, 8)} • Speed: {v.speed}km/h</p>
                      <button 
                        onClick={() => onViewVehicleRoute?.(v)}
                        className="mt-2 text-[10px] font-bold text-red-600 uppercase hover:underline"
                      >
                        View Route
                      </button>
                    </div>
                  </motion.div>
                ))}
                {highSeverityIncidents.map((i) => (
                  <motion.div
                    key={i.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => setSelectedIncident(i)}
                    className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 cursor-pointer hover:bg-orange-100 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-orange-900">{i.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-orange-700 opacity-80 line-clamp-1">{i.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-600 uppercase">View Details</span>
                        <ChevronRight className="w-3 h-3 text-orange-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* System Controls */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">System Controls</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="flex items-center gap-3 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                  <Radio className="w-4 h-4 text-blue-500" />
                  Broadcast Alert
                </button>
                <button className="flex items-center gap-3 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                  <Settings className="w-4 h-4 text-gray-500" />
                  Signal Optimization
                </button>
                <button className="flex items-center gap-3 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200">
                  <MapIcon className="w-4 h-4 text-green-500" />
                  Traffic Simulation
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Area: Map & Details */}
        <main className="flex-1 flex flex-col relative">
          {/* Map Viewport */}
          <div className="flex-1 relative overflow-hidden">
            <MapContainer 
              signals={signals}
              vehicles={vehicles}
              incidents={incidents}
              activeRoute={activeRoute}
              selectedDestination={selectedDestination}
              isLoading={isLoading}
              onSignalClick={(s) => onSignalOverride(s.id)}
              onVehicleClick={(v) => console.log('Vehicle:', v)}
              onMapClick={onMapClick}
              onPlanRoute={onPlanRoute}
              onClearRoute={onClearRoute}
            />
          </div>

          {/* Bottom Panel: Signal Status */}
          <div className="h-64 bg-white border-t border-gray-200 flex flex-col shrink-0">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Signal Network Status</h3>
              <div className="flex gap-2">
                <Badge variant="success">All Systems Nominal</Badge>
                <Badge variant="info">{signals.filter(s => s.isEmergencyOverride).length} Overrides</Badge>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto p-6 flex gap-4">
              {signals.map((signal) => (
                <Card 
                  key={signal.id} 
                  className={cn(
                    "min-w-[180px] flex flex-col justify-between transition-all hover:shadow-md",
                    signal.isEmergencyOverride && "border-blue-500 bg-blue-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500">SIG-{signal.id.slice(0, 4)}</p>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      signal.state === 'red' ? 'bg-red-500' : signal.state === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-2xl font-bold text-gray-900">{signal.timing}s</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Time Remaining</p>
                  </div>
                  <button 
                    onClick={() => onSignalOverride(signal.id)}
                    className={cn(
                      "mt-3 w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                      signal.isEmergencyOverride 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {signal.isEmergencyOverride ? 'Release Override' : 'Manual Green'}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      {/* Incident Detail Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
                      Mission Control Alert
                    </p>
                  </div>
                  <Badge variant={selectedIncident.severity === 'high' ? 'danger' : 'warning'}>
                    {selectedIncident.severity.toUpperCase()} SEVERITY
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Latitude</p>
                      <p className="text-sm font-bold text-gray-700">{selectedIncident.lat.toFixed(6)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Longitude</p>
                      <p className="text-sm font-bold text-gray-700">{selectedIncident.lng.toFixed(6)}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported By</p>
                      <p className="text-sm font-bold text-gray-700">{selectedIncident.reportedBy}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(selectedIncident.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedIncident.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Simulate dispatch
                      alert('Dispatching unit to incident location...');
                      setSelectedIncident(null);
                    }}
                    className="py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                  >
                    Dispatch Unit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
