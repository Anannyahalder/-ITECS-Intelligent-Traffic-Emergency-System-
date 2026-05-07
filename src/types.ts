/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'operator' | 'responder' | 'citizen';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export type SignalState = 'red' | 'yellow' | 'green';

export interface TrafficSignal {
  id: string;
  lat: number;
  lng: number;
  state: SignalState;
  timing: number; // seconds remaining
  isEmergencyOverride: boolean;
  density: number; // 0-100
  confidence: number; // 0-100 (data reliability)
}

export type VehicleType = 'ambulance' | 'fire_brigade' | 'police' | 'citizen';

export interface Vehicle {
  id: string;
  ownerUid: string;
  type: VehicleType;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  destination?: { lat: number; lng: number };
  isActiveEmergency: boolean;
  lastUpdate: number;
  confidence: number; // 0-100 (data reliability)
}

export type IncidentType = 'accident' | 'roadblock' | 'construction' | 'heavy_traffic';

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  lat: number;
  lng: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  timestamp: number;
}

export interface RouteStep {
  instruction: string;
  distance: string;
}

export interface Route {
  id: string;
  points: [number, number][];
  distance: number;
  duration: number;
  isDisrupted: boolean;
  disruptionReason?: string;
  alternativeRouteId?: string;
  steps: RouteStep[];
  startName?: string;
  endName?: string;
}

export interface SystemHealth {
  overall: number; // 0-100
  dataConfidence: number; // 0-100
  networkLatency: number; // ms
  lastSync: number;
}
