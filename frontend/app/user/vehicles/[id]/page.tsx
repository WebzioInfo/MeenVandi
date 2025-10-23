'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  ArrowLeft,
  Truck, 
  MapPin, 
  Battery, 
  Volume2, 
  VolumeX,
  Navigation,
  Clock,
  Package,
  Users
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/app/lib/utils';
import { vehicleAPI, stopAPI, orderAPI, inventoryAPI } from '@/app/lib/api';
import Link from 'next/link';
import { OrderItem, Order } from '@/app/types/order';
import { Inventory } from '@/app/types/inventory';
import { Stop } from '@/app/types/stop';
import { Vehicle } from '@/app/types/vehicle';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { trackVehicle } = useVehicleStore();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'stops' | 'orders' | 'inventory'>('details');
  const [loading, setLoading] = useState(true);

  const vehicleId = params.id as string;

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const [vehicleRes, stopsRes, ordersRes, inventoryRes] = await Promise.all([
        vehicleAPI.getById(vehicleId),
        stopAPI.getByVehicle(vehicleId),
        orderAPI.getByVehicle(vehicleId),
        inventoryAPI.getByVehicle(vehicleId)
      ]);

      setVehicle(vehicleRes.data);
      setStops(stopsRes.data);
      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    return type === 'goods_ape' ? '🚚' : '🏍️';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'on_route': return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
      case 'at_spot': return <div className="w-3 h-3 bg-purple-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading vehicle details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle not found</h3>
              <p className="text-gray-600 mb-4">
                The vehicle you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/user/vehicles')}>
                Back to Vehicles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-4xl">
              {getVehicleIcon(vehicle.vehicle_type)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
              <p className="text-gray-600">{vehicle.number_plate}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(vehicle.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
              {vehicle.status.replace('_', ' ')}
            </span>
          </div>
          <Button onClick={() => trackVehicle(vehicle.id)}>
            <Navigation className="h-4 w-4 mr-2" />
            Track on Map
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details' as const, name: 'Details', icon: Truck },
            { id: 'stops' as const, name: 'Stops', icon: MapPin, count: stops.length },
            { id: 'orders' as const, name: 'Orders', icon: Package, count: orders.length },
            { id: 'inventory' as const, name: 'Inventory', icon: Users, count: inventory.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Type
                        </label>
                        <p className="text-gray-900 capitalize">{vehicle.vehicle_type.replace('_', ' ')}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          RC Number
                        </label>
                        <p className="text-gray-900">{vehicle.number_plate}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Location
                        </label>
                        {vehicle.current_lat && vehicle.current_lng ? (
                          <p className="text-gray-900">
                            {vehicle.current_lat.toFixed(6)}, {vehicle.current_lng.toFixed(6)}
                          </p>
                        ) : (
                          <p className="text-gray-500">No location data</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Battery Level
                        </label>
                        <div className="flex items-center space-x-2">
                          <Battery className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{vehicle.battery_level}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sound Announcement
                        </label>
                        <div className="flex items-center space-x-2">
                          {vehicle.is_sound_enabled ? (
                            <>
                              <Volume2 className="h-5 w-5 text-green-500" />
                              <span className="text-green-600">Enabled</span>
                            </>
                          ) : (
                            <>
                              <VolumeX className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-600">Disabled</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Updated
                        </label>
                        <p className="text-gray-900">{formatDate(vehicle.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Status Updated</p>
                          <p className="text-sm text-gray-600">Vehicle is {vehicle.status}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(vehicle.updated_at)}</span>
                    </div>
                    
                    {vehicle.current_route_id && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-gray-900">On Route</p>
                            <p className="text-sm text-gray-600">Following assigned route</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Active</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'stops' && (
            <Card>
              <CardHeader>
                <CardTitle>Stop History</CardTitle>
                <CardDescription>
                  Recent stops made by this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stops.length > 0 ? (
                  <div className="space-y-4">
                    {stops.map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary-100 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{stop.location_name}</h3>
                            <p className="text-sm text-gray-600">{stop.address}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stop.status)}`}>
                                {stop.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(stop.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {stop.duration_minutes && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {stop.duration_minutes} min
                            </p>
                            <p className="text-xs text-gray-500">Duration</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No stops recorded</h3>
                    <p className="text-gray-600">
                      This vehicle hasn't made any stops yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Orders handled by this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                            <p className="text-sm text-gray-600">
                              {order.items.map((item:OrderItem) => item.fish_type).join(', ')}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(order.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">
                      This vehicle hasn't handled any orders yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'inventory' && (
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>
                  Fish stock available in this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventory.length > 0 ? (
                  <div className="space-y-4">
                    {inventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.fish_type}</h3>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.unit_price)} per {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-gray-500">In stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory</h3>
                    <p className="text-gray-600">
                      This vehicle doesn't have any fish in stock.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" >
                <Link href={`/user/stops/request?vehicle=${vehicle.id}`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Request Stop
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" >
                <Link href={`/user/orders/create?vehicle=${vehicle.id}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Place Order
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => trackVehicle(vehicle.id)}>
                <Navigation className="h-4 w-4 mr-2" />
                Track on Map
              </Button>
            </CardContent>
          </Card>

          {/* Vehicle Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Stops</span>
                  <span className="font-semibold">
                    {stops.filter(s => s.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fish Types</span>
                  <span className="font-semibold">
                    {new Set(inventory.map(i => i.fish_type)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-semibold text-green-600">
                    {vehicle.status === 'online' || vehicle.status === 'on_route' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}