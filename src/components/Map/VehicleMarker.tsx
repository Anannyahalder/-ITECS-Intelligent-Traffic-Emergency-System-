/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '@/src/types';
import { VEHICLE_ICONS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  onClick?: () => void;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({ vehicle, onClick }) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={cn(
      "flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg border-2",
      vehicle.isActiveEmergency ? "border-red-500 animate-pulse" : "border-gray-300"
    )} style={{ transform: `rotate(${vehicle.heading}deg)` }}>
      <span className="text-lg">{VEHICLE_ICONS[vehicle.type]}</span>
      {vehicle.isActiveEmergency && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
      )}
    </div>
  );

  const customIcon = L.divIcon({
    html: iconMarkup,
    className: 'custom-vehicle-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker 
      position={[vehicle.lat, vehicle.lng]} 
      icon={customIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-xs font-bold">
          Vehicle ID: {vehicle.id}<br />
          Type: {vehicle.type.toUpperCase()}<br />
          Speed: {vehicle.speed} km/h<br />
          Status: {vehicle.isActiveEmergency ? 'EMERGENCY' : 'NORMAL'}
        </div>
      </Popup>
    </Marker>
  );
};
