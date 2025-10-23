'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  Truck, 
  MapPin, 
  Battery, 
  Volume2, 
  VolumeX,
  Navigation,
  Filter,
  Search
} from 'lucide-react';
import { getStatusColor, formatDate } from '@/app/lib/utils';
import Link from 'next/link';
import { Vehicle, VehicleStatus, VehicleType } from '@/app/types/vehicle';

export default function UserVehiclesPage() {
  const { user } = useAuth();
  const { 
    vehicles, 
    initializeSocket, 
    isConnected,
    trackVehicle,
    fetchVehicles,
    loading 
  } = useVehicleStore();
  
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: 'all' as 'all' | VehicleType,
    status: 'all' as 'all' | VehicleStatus,
  });

  useEffect(() => {
    if (user?.token) {
      initializeSocket(user.token);
      fetchVehicles();
    }
  }, [user, initializeSocket, fetchVehicles]);

  useEffect(() => {
    let filtered = vehicles;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.number_plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply vehicle type filter
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.vehicle_type === filters.vehicleType);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filters.status);
    }
    
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filters]);

  const getVehicleIcon = (type: VehicleType) => {
    return type === VehicleType.GOODS_APE ? '🚚' : '🏍️';
  };

  const getStatusCount = (status: VehicleStatus) => {
    return vehicles.filter(vehicle => vehicle.status === status).length;
  };

  const stats = {
    total: vehicles.length,
    online: getStatusCount(VehicleStatus.ONLINE),
    onRoute: getStatusCount(VehicleStatus.ON_ROUTE),
    atSpot: getStatusCount(VehicleStatus.AT_SPOT),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Vehicles</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all fish delivery vehicles
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Vehicles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.onRoute}</p>
              <p className="text-sm text-gray-600">On Route</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.atSpot}</p>
              <p className="text-sm text-gray-600">At Spot</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search vehicles by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Vehicle Type Filter */}
            <div className="sm:w-48">
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value={VehicleType.GOODS_APE}>Goods Ape</option>
                <option value={VehicleType.BIKE}>Bike</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value={VehicleStatus.ONLINE}>Online</option>
                <option value={VehicleStatus.ON_ROUTE}>On Route</option>
                <option value={VehicleStatus.AT_SPOT}>At Spot</option>
                <option value={VehicleStatus.OFFLINE}>Offline</option>
                <option value={VehicleStatus.MAINTENANCE}>Maintenance</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} hover className="relative">
              <CardContent className="p-6">
                {/* Vehicle Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {getVehicleIcon(vehicle.vehicle_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600">{vehicle.number_plate}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3">
                  {/* Location */}
                  {(vehicle.current_lat && vehicle.current_lng) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="text-gray-900">
                        {vehicle.current_lat.toFixed(4)}, {vehicle.current_lng.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {/* Battery */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Battery</span>
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{vehicle.battery_level}%</span>
                    </div>
                  </div>

                  {/* Sound */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sound</span>
                    <div className="flex items-center space-x-1">
                      {vehicle.is_sound_enabled ? (
                        <>
                          <Volume2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Enabled</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Disabled</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900">
                      {formatDate(vehicle.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => trackVehicle(vehicle.id)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    
                  >
                    <Link href={`/user/vehicles/${vehicle.id}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Details
                    </Link>
                  </Button>
                </div>
              </CardContent>

              {/* Online Indicator */}
              {(vehicle.status === VehicleStatus.ONLINE || vehicle.status === VehicleStatus.ON_ROUTE) && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filters.vehicleType !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No vehicles are currently available'
                }
              </p>
              {(searchTerm || filters.vehicleType !== 'all' || filters.status !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ vehicleType: 'all', status: 'all' });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}