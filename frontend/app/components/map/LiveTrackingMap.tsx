'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { Button } from '@/app/components/ui/button';
import { cn, getStatusColor } from '@/app/lib/utils';
import 'leaflet/dist/leaflet.css';
import { Vehicle } from '@/app/types/vehicle';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icons
const createVehicleIcon = (vehicleType: string, status: string) => {
  const statusColor = {
    'online': 'green',
    'on_route': 'blue',
    'at_spot': 'purple',
    'offline': 'gray',
    'maintenance': 'orange'
  }[status] || 'gray';

  const iconType = vehicleType === 'goods_ape' ? '🚚' : '🏍️';
  
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center">
        <div class="relative">
          <div class="w-10 h-10 bg-${statusColor}-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
            ${iconType}
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-${statusColor}-500"></div>
        </div>
        <div class="mt-1 px-2 py-1 bg-white rounded-full shadow-sm border border-gray-200 text-xs font-medium text-gray-700 whitespace-nowrap">
          ${status.replace('_', ' ')}
        </div>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });
};

function MapUpdater() {
  const map = useMap();
  const { selectedVehicle } = useVehicleStore();

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.current_lat && selectedVehicle.current_lng) {
      map.setView([selectedVehicle.current_lat, selectedVehicle.current_lng], 15);
    }
  }, [selectedVehicle, map]);

  return null;
}

export default function LiveTrackingMap() {
  const { vehicles, selectedVehicle, trackVehicle, isConnected } = useVehicleStore();
  const mapRef = useRef<L.Map>(null);

  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bangalore

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden">
      {/* Connection Status */}
      <div className={cn(
        "absolute top-4 right-4 z-[1000] px-3 py-2 rounded-lg text-white text-sm font-medium flex items-center space-x-2 transition-all duration-300",
        isConnected ? 'bg-green-500 shadow-lg' : 'bg-red-500'
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          isConnected ? 'bg-green-300' : 'bg-red-300'
        )} />
        <span>{isConnected ? 'Live Tracking' : 'Offline'}</span>
      </div>

      {/* Vehicle Count */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            {vehicles.filter((v:Vehicle) => v.status === 'online' || v.status === 'on_route').length} vehicles active
          </span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
        className="rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater />
        
        {/* Vehicle Markers */}
        {vehicles.map((vehicle:Vehicle) => (
          vehicle.current_lat && vehicle.current_lng && (
            <Marker
              key={vehicle.id}
              position={[vehicle.current_lat, vehicle.current_lng]}
              icon={createVehicleIcon(vehicle.vehicle_type, vehicle.status)}
            >
              <Popup className="rounded-xl">
                <div className="p-4 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{vehicle.name}</h3>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getStatusColor(vehicle.status)
                    )}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Vehicle Number:</span>
                      <span className="font-medium">{vehicle.number_plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium capitalize">{vehicle.vehicle_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span className="font-medium">{vehicle.battery_level}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sound:</span>
                      <span className={cn(
                        "font-medium",
                        vehicle.is_sound_enabled ? "text-green-600" : "text-gray-400"
                      )}>
                        {vehicle.is_sound_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      onClick={() => trackVehicle(vehicle.id)}
                      className="flex-1"
                      size="sm"
                    >
                      Track Vehicle
                    </Button>
                    <Button
  variant="outline"
  size="sm"
  className="flex-1"
  onClick={() => window.location.href = `/user/vehicles/${vehicle.id}`}
>
  Details
</Button>

                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}