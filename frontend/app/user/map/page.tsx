'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import LiveTrackingMap from '@/app/components/map/LiveTrackingMap';
import { 
  Truck, 
  Filter, 
  Navigation, 
  Battery,
  Volume2,
  MapPin
} from 'lucide-react';
import { getStatusColor } from '@/app/lib/utils';
import { Vehicle, VehicleStatus, VehicleType } from '@/app/types/vehicle';

export default function UserMapPage() {
  const { user } = useAuth();
  const { 
    vehicles, 
    initializeSocket, 
    isConnected,
    trackVehicle,
    selectedVehicle,
    fetchVehicles
  } = useVehicleStore();
  
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({
    vehicleType: 'all' as 'all' | VehicleType,
    status: 'all' as 'all' | VehicleStatus,
    soundEnabled: 'all' as 'all' | 'enabled' | 'disabled'
  });

  useEffect(() => {
    if (user?.token) {
      initializeSocket(user.token);
      fetchVehicles();
    }
  }, [user, initializeSocket, fetchVehicles]);

  useEffect(() => {
    let filtered = vehicles;
    
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter((v:Vehicle) => v.vehicle_type === filters.vehicleType);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter((v:Vehicle) => v.status === filters.status);
    }
    
    if (filters.soundEnabled !== 'all') {
      filtered = filtered.filter((v:Vehicle) => 
        filters.soundEnabled === 'enabled' ? v.is_sound_enabled : !v.is_sound_enabled
      );
    }
    
    setFilteredVehicles(filtered);
  }, [vehicles, filters]);

  const getVehicleIcon = (type: string) => {
    return type === 'goods_ape' ? '🚚' : '🏍️';
  };

  const onlineVehicles = vehicles.filter(v => 
    v.status === 'online' || v.status === 'on_route'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Vehicle Map</h1>
          <p className="text-gray-600 mt-2">
            Track all fish delivery vehicles in real-time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Live Tracking' : 'Offline'}
            </span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
            <span className="text-sm font-medium">
              {onlineVehicles} vehicles online
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    vehicleType: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value={VehicleType.GOODS_APE}>Goods Ape</option>
                  <option value={VehicleType.BIKE}>Bike</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value={VehicleStatus.ONLINE}>Online</option>
                  <option value={VehicleStatus.ON_ROUTE}>On Route</option>
                  <option value={VehicleStatus.AT_SPOT}>At Spot</option>
                  <option value={VehicleStatus.OFFLINE}>Offline</option>
                </select>
              </div>

              {/* Sound Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sound Announcement
                </label>
                <select
                  value={filters.soundEnabled}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    soundEnabled: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="enabled">Sound Enabled</option>
                  <option value="disabled">Sound Disabled</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFilters({
                  vehicleType: 'all',
                  status: 'all',
                  soundEnabled: 'all'
                })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Vehicles List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Vehicles ({filteredVehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedVehicle?.id === vehicle.id 
                        ? 'border-primary-300 bg-primary-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => trackVehicle(vehicle.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getVehicleIcon(vehicle.vehicle_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {vehicle.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {vehicle.number_plate}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {vehicle.is_sound_enabled && (
                        <Volume2 className="h-4 w-4 text-green-500" />
                      )}
                      <Battery className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{vehicle.battery_level}%</span>
                    </div>
                  </div>
                ))}
                {filteredVehicles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No vehicles found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] lg:h-[700px]">
                <LiveTrackingMap />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}