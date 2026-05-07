/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrafficSignal, Vehicle, TrafficIncident, UserRole, Route, SystemHealth } from '@/src/types';
import { DEFAULT_CENTER, SIGNAL_UPDATE_INTERVAL, VEHICLE_UPDATE_INTERVAL } from '@/src/constants';

// Mock data generator for initial development
const generateMockSignals = (): TrafficSignal[] => [
  { id: 'sig-1', lat: 28.61, lng: 77.21, state: 'green', timing: 30, isEmergencyOverride: false, density: 40, confidence: 98 },
  { id: 'sig-2', lat: 28.62, lng: 77.22, state: 'red', timing: 45, isEmergencyOverride: false, density: 80, confidence: 95 },
  { id: 'sig-3', lat: 28.63, lng: 77.23, state: 'green', timing: 15, isEmergencyOverride: false, density: 20, confidence: 99 },
  { id: 'sig-4', lat: 28.64, lng: 77.24, state: 'red', timing: 60, isEmergencyOverride: false, density: 95, confidence: 85 },
];

const generateMockVehicles = (): Vehicle[] => [
  { id: 'v-1', ownerUid: 'u-1', type: 'ambulance', lat: 28.615, lng: 77.215, heading: 45, speed: 60, isActiveEmergency: true, lastUpdate: Date.now(), confidence: 100 },
  { id: 'v-2', ownerUid: 'u-2', type: 'citizen', lat: 28.625, lng: 77.225, heading: 180, speed: 40, isActiveEmergency: false, lastUpdate: Date.now(), confidence: 90 },
  { id: 'v-3', ownerUid: 'u-3', type: 'fire_brigade', lat: 28.645, lng: 77.245, heading: 270, speed: 55, isActiveEmergency: true, lastUpdate: Date.now(), confidence: 95 },
];

const generateMockIncidents = (): TrafficIncident[] => [
  { id: 'i-1', type: 'accident', lat: 28.635, lng: 75.235, description: 'Multi-vehicle collision on Main St.', severity: 'high', reportedBy: 'op-1', timestamp: Date.now() },
  { id: 'i-2', type: 'road_closure', lat: 28.625, lng: 77.225, description: 'Road closed for construction work.', severity: 'medium', reportedBy: 'op-2', timestamp: Date.now() },
  { id: 'i-3', type: 'heavy_traffic', lat: 28.615, lng: 80.215, description: 'Heavy traffic due to event nearby.', severity: 'low', reportedBy: 'citizen-1', timestamp: Date.now() }, 
];  

export function useTrafficSystem(role: UserRole | null) {
  const [signals, setSignals] = useState<TrafficSignal[]>(generateMockSignals());
  const [vehicles, setVehicles] = useState<Vehicle[]>(generateMockVehicles());
  const [incidents, setIncidents] = useState<TrafficIncident[]>(generateMockIncidents());
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 98,
    dataConfidence: 95,
    networkLatency: 45,
    lastSync: Date.now()
  });

  // Helper to check if a point is near a route segment
  const isPointNearRoute = (lat: number, lng: number, routePoints: [number, number][]) => {
    return routePoints.some(([rLat, rLng]) => {
      const dist = Math.sqrt(Math.pow(lat - rLat, 2) + Math.pow(lng - rLng, 2));
      return dist < 0.005; // ~500m threshold
    });
  };

  // Helper to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  // Helper to generate dynamic steps
  const generateSteps = (start: [number, number], end: [number, number], totalDist: number) => {
    const latDiff = end[0] - start[0];
    const lngDiff = end[1] - start[1];
    
    const latDir = latDiff > 0 ? "North" : "South";
    const lngDir = lngDiff > 0 ? "East" : "West";
    
    return [
      { instruction: `Head ${latDir} towards destination`, distance: `${(totalDist * 0.3).toFixed(1)}km` },
      { instruction: `Turn ${lngDiff > 0 ? 'right' : 'left'} onto ${lngDir} Avenue`, distance: `${(totalDist * 0.4).toFixed(1)}km` },
      { instruction: `Continue for the final stretch`, distance: `${(totalDist * 0.3).toFixed(1)}km` },
      { instruction: "Arrive at destination", distance: "0km" }
    ];
  };

  // Monitor route for disruptions
  useEffect(() => {
    if (!activeRoute || activeRoute.isDisrupted) return;

    const disruption = incidents.find(i => isPointNearRoute(i.lat, i.lng, activeRoute.points));
    if (disruption) {
      setActiveRoute(prev => prev ? {
        ...prev,
        isDisrupted: true,
        disruptionReason: `Disruption detected: ${disruption.type.replace('_', ' ')} ahead.`
      } : null);
    }
  }, [incidents, activeRoute]);

  // Simulate real-time updates for now
  useEffect(() => {
    if (!role) return;

    const signalTimer = setInterval(() => {
      setSignals(prev => prev.map(s => {
        // Auto-override logic for multiple emergency vehicles
        const nearbyEmergency = vehicles.find(v => 
          v.isActiveEmergency && calculateDistance(v.lat, v.lng, s.lat, s.lng) < 0.3 // 300m threshold
        );

        if (nearbyEmergency) {
          return { ...s, isEmergencyOverride: true, state: 'green', timing: 99, confidence: 100 };
        }

        if (s.timing <= 1) {
          const nextState: Record<string, 'red' | 'yellow' | 'green'> = {
            'red': 'green',
            'yellow': 'red',
            'green': 'yellow'
          };
          return { ...s, state: nextState[s.state], timing: s.state === 'yellow' ? 45 : 5, isEmergencyOverride: false };
        }
        return { ...s, timing: s.timing - 1 };
      }));

      // Simulate data confidence fluctuations
      setSystemHealth(prev => ({
        ...prev,
        dataConfidence: Math.max(70, Math.min(100, prev.dataConfidence + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(20, Math.min(500, prev.networkLatency + (Math.random() - 0.5) * 50)),
        lastSync: Date.now()
      }));
    }, SIGNAL_UPDATE_INTERVAL);

    const vehicleTimer = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        // Data uncertainty simulation: occasionally skip updates
        if (Math.random() < 0.05 && v.type === 'citizen') {
          return { ...v, confidence: Math.max(0, v.confidence - 10) };
        }

        // Move vehicle slightly in its heading direction
        const rad = (v.heading * Math.PI) / 180;
        
        // Adjust speed based on nearby incidents (congestion)
        const nearbyIncident = incidents.find(i => calculateDistance(v.lat, v.lng, i.lat, i.lng) < 0.5);
        const speedMultiplier = nearbyIncident ? 0.3 : 1.0;
        const speedFactor = 0.0001 * speedMultiplier;

        return {
          ...v,
          lat: v.lat + Math.cos(rad) * speedFactor,
          lng: v.lng + Math.sin(rad) * speedFactor,
          speed: Math.round(v.speed * speedMultiplier),
          lastUpdate: Date.now(),
          confidence: Math.min(100, v.confidence + 1)
        };
      }));
    }, VEHICLE_UPDATE_INTERVAL);

    setIsLoading(false);

    return () => {
      clearInterval(signalTimer);
      clearInterval(vehicleTimer);
    };
  }, [role, incidents, vehicles]);

  const toggleEmergency = useCallback((vehicleId: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, isActiveEmergency: !v.isActiveEmergency } : v
    ));
  }, []);

  const overrideSignal = useCallback((signalId: string) => {
    setSignals(prev => prev.map(s => 
      s.id === signalId ? { ...s, isEmergencyOverride: !s.isEmergencyOverride, state: 'green', timing: 99 } : s
    ));
  }, []);

  const reportIncident = useCallback((incident: Partial<TrafficIncident>) => {
    const newIncident: TrafficIncident = {
      id: `i-${Date.now()}`,
      type: incident.type || 'heavy_traffic',
      lat: incident.lat || DEFAULT_CENTER.lat,
      lng: incident.lng || DEFAULT_CENTER.lng,
      description: incident.description || 'Reported traffic issue',
      severity: incident.severity || 'medium',
      reportedBy: 'current-user',
      timestamp: Date.now(),
    };
    setIncidents(prev => [newIncident, ...prev]);
  }, []);

  const calculateRoute = useCallback(async (start: [number, number], end: [number, number], isAlternative = false) => {
    setIsLoading(true);
    try {
      console.log(`Calculating route from ${start} to ${end}${isAlternative ? ' (alternative)' : ''}`);
      // Fetch real route from OSRM (Open Source Routing Machine)
      // Use alternatives=true to get more than one route if available
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true&alternatives=true`
      );
      const data = await response.json();

      if (data.code !== 'Ok') throw new Error(`Routing API failed: ${data.code}`);

      // If we want an alternative, take the second route if it exists
      const routeIndex = isAlternative && data.routes.length > 1 ? 1 : 0;
      const osrmRoute = data.routes[routeIndex];
      
      const points: [number, number][] = osrmRoute.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      const distance = osrmRoute.distance / 1000; // Convert to km
      const baseDuration = Math.round(osrmRoute.duration / 60); // Convert to minutes

      const disruption = incidents.find(i => isPointNearRoute(i.lat, i.lng, points));
      const duration = disruption ? baseDuration * 2.5 : baseDuration;

      const steps = osrmRoute.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: `${(step.distance / 1000).toFixed(1)}km`
      }));

      const newRoute: Route = {
        id: `r-${isAlternative ? 'alt-' : ''}${Date.now()}`,
        points,
        distance: Number(distance.toFixed(1)),
        duration: duration > 0 ? duration : 1,
        isDisrupted: !!disruption,
        disruptionReason: disruption ? `Route disrupted by ${disruption.type.replace('_', ' ')} ahead.` : undefined,
        startName: "Current Location",
        endName: `Destination (${end[0].toFixed(4)}, ${end[1].toFixed(4)})`,
        steps
      };

      setActiveRoute(newRoute);
      return newRoute;
    } catch (error) {
      console.error('Routing error, falling back to grid path:', error);
      
      // Fallback: Multi-point grid-based path for "city block" feel
      const points: [number, number][] = [start];
      const midLat = start[0] + (end[0] - start[0]) * 0.5;
      const midLng = start[1] + (end[1] - start[1]) * 0.5;
      
      // Add more points to make it look like a real path through city blocks
      points.push([midLat, start[1]]);
      points.push([midLat, midLng]);
      points.push([end[0], midLng]);
      points.push(end);

      const distance = calculateDistance(start[0], start[1], end[0], end[1]);
      const duration = Math.round(distance * 4);

      const newRoute: Route = {
        id: `r-fallback-${Date.now()}`,
        points,
        distance: Number(distance.toFixed(1)),
        duration: duration > 0 ? duration : 1,
        isDisrupted: false,
        startName: "Current Location",
        endName: "Destination (Fallback)",
        steps: generateSteps(start, end, distance)
      };

      setActiveRoute(newRoute);
      return newRoute;
    } finally {
      setIsLoading(false);
    }
  }, [incidents]);

  const getAlternativeRoute = useCallback(async () => {
    if (!activeRoute) return null;
    const start = activeRoute.points[0];
    const end = activeRoute.points[activeRoute.points.length - 1];
    return calculateRoute(start, end, true);
  }, [activeRoute, calculateRoute]);

  return {
    signals,
    vehicles,
    incidents,
    activeRoute,
    isLoading,
    systemHealth,
    toggleEmergency,
    overrideSignal,
    reportIncident,
    calculateRoute,
    getAlternativeRoute,
    clearRoute: () => setActiveRoute(null)
  };
}
