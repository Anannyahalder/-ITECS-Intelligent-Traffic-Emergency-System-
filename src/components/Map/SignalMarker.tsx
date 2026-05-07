/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { TrafficSignal, SignalState } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';

interface SignalMarkerProps {
  signal: TrafficSignal;
  onClick?: () => void;
}

export const SignalMarker: React.FC<SignalMarkerProps> = ({ signal, onClick }) => {
  const getLightColor = (light: SignalState) => {
    if (signal.state === light) {
      switch (light) {
        case 'red': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]';
        case 'yellow': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]';
        case 'green': return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]';
      }
    }
    return 'bg-gray-800';
  };

  const iconMarkup = renderToStaticMarkup(
    <div className={cn(
      "flex flex-col items-center p-1 bg-gray-900 rounded-md border border-gray-700",
      signal.isEmergencyOverride && "border-blue-400 ring-2 ring-blue-400/50"
    )}>
      <div className="flex flex-col gap-1">
        <div className={cn("w-2 h-2 rounded-full", getLightColor('red'))} />
        <div className={cn("w-2 h-2 rounded-full", getLightColor('yellow'))} />
        <div className={cn("w-2 h-2 rounded-full", getLightColor('green'))} />
      </div>
      <div className="mt-1 text-[8px] font-mono text-white font-bold">
        {signal.timing}s
      </div>
    </div>
  );

  const customIcon = L.divIcon({
    html: iconMarkup,
    className: 'custom-signal-icon',
    iconSize: [24, 40],
    iconAnchor: [12, 20],
  });

  return (
    <Marker 
      position={[signal.lat, signal.lng]} 
      icon={customIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-xs font-bold">
          Signal ID: {signal.id}<br />
          State: {signal.state.toUpperCase()}<br />
          Override: {signal.isEmergencyOverride ? 'YES' : 'NO'}
        </div>
      </Popup>
    </Marker>
  );
};
