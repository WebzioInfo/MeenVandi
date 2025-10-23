'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { useOrderStore } from '@/app/store/order-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import LiveTrackingMap from '@/app/components/map/LiveTrackingMap';
import { 
  Truck, 
  MapPin, 
  Package, 
  Users,
  Clock,
  Battery,
  Volume2,
  Plus,
  ShoppingCart,
  Calendar,
  Navigation,
  
} from 'lucide-react';
import { formatCurrency, getStatusColor, formatDate } from '@/app/lib/utils';
import Link from 'next/link';
import { Vehicle } from '@/app/types/vehicle';
import { Order, OrderStatus } from '@/app/types/order';
import { useGeolocation } from '@/app/hooks/use-geolocation';
import { useStopsWithNearest } from '@/app/hooks/use-stops';

export default function UserDashboard() {
  const { user } = useAuth();
  const { 
    vehicles, 
    initializeSocket, 
    isConnected,
    trackVehicle,
    loading: vehiclesLoading 
  } = useVehicleStore();
  
  const { 
    orders, 
    fetchUserOrders,
    loading: ordersLoading 
  } = useOrderStore();
  
  const [nearbyVehicles, setNearbyVehicles] = useState<Vehicle[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const { position } = useGeolocation();
  const lat = position?.coords.latitude ?? null;
  const lng = position?.coords.longitude ?? null;
  const { nearestStop, stopsWithDistance, loading: nearestLoading, error: nearestError } = useStopsWithNearest(lat, lng);

  useEffect(() => {
    if (user?.token) {
      initializeSocket(user.token);
    }
    if (user?.id) {
      fetchUserOrders(user.id);
    }
  }, [user, initializeSocket, fetchUserOrders]);

  useEffect(() => {
    // Filter nearby vehicles (within 5km)
    const nearby = vehicles.filter((vehicle:Vehicle) => 
      vehicle.status === 'online' || vehicle.status === 'on_route'
    ).slice(0, 5);
    setNearbyVehicles(nearby);
  }, [vehicles]);

  useEffect(() => {
    // Get recent orders
    console.log(orders)
    const recent = orders.slice(0, 3);
    setRecentOrders(recent);
  }, [orders]);

  const getVehicleIcon = (type: string) => {
    return type === 'goods_ape' ? '🚚' : '🏍️';
  };

  const getOrderStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="h-4 w-4 text-yellow-600" />;
      case OrderStatus.CONFIRMED: return <Package className="h-4 w-4 text-blue-600" />;
      case OrderStatus.PREPARING: return <Package className="h-4 w-4 text-indigo-600" />;
      case OrderStatus.READY: return <Package className="h-4 w-4 text-green-600" />;
      case OrderStatus.ON_THE_WAY: return <Truck className="h-4 w-4 text-purple-600" />;
      case OrderStatus.ARRIVED: return <MapPin className="h-4 w-4 text-teal-600" />;
      case OrderStatus.COMPLETED: return <Package className="h-4 w-4 text-green-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const pendingOrders = orders.filter((order:Order) => 
    order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED
  ).length;

  const totalSpent = orders
    .filter((order:Order) => order.payment_status === 'paid')
    .reduce((sum:number, order:Order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track nearby fish vehicles and manage your orders
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter((v:Vehicle) => v.status === 'online' || v.status === 'on_route').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nearby Now</p>
                <p className="text-2xl font-bold text-gray-900">{nearbyVehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nearest Stop Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nearest Stop</CardTitle>
          <div className="text-sm text-gray-500">
            {lat && lng ? 'Using your location' : 'Enable location to find nearest stop'}
          </div>
        </CardHeader>
        <CardContent>
          {!lat || !lng ? (
            <div className="text-gray-600">Location permission required to compute nearby stops.</div>
          ) : nearestLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : nearestStop ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{(nearestStop as any).name ?? (nearestStop as any).location_name ?? 'Nearby Stop'}</p>
                <p className="text-sm text-gray-600">{(nearestStop as any).address ?? (nearestStop as any).description ?? 'Stop nearby'}</p>
                <p className="text-xs text-gray-500 mt-1">~ {nearestStop.distanceKm.toFixed(2)} km away</p>
              </div>
              <div className="flex gap-2">
                <Link href="/user/map"><Button variant="outline" size="sm">View Map</Button></Link>
                <Link href="/user/stops"><Button size="sm">All Stops</Button></Link>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No stops found near your location.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Vehicle Tracking</CardTitle>
              <Button variant="outline" size="sm" >
                <Link href="/user/map">
                  <Navigation className="h-4 w-4 mr-2" />
                  Full Screen Map
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 lg:h-[500px]">
                <LiveTrackingMap />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nearby Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Nearby Vehicles</span>
                <span className="text-sm font-normal text-gray-500">
                  {nearbyVehicles.length} nearby
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nearbyVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getVehicleIcon(vehicle.vehicle_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {vehicle.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Battery className="h-3 w-3" />
                            <span className="text-xs">{vehicle.battery_level}%</span>
                          </div>
                          {vehicle.is_sound_enabled && (
                            <Volume2 className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => trackVehicle(vehicle.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Track
                    </Button>
                  </div>
                ))}
                {nearbyVehicles.length === 0 && !vehiclesLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No vehicles nearby</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later</p>
                  </div>
                )}
                {vehiclesLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Orders</span>
                <Button variant="outline" size="sm" >
                  <Link href="/user/orders">
                    View All
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getOrderStatusIcon(order.status)}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {recentOrders.length === 0 && !ordersLoading && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No orders yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Link href="/user/orders/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Place Order
                      </Link>
                    </Button>
                  </div>
                )}
                {ordersLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-12 flex-col" >
                  <Link href="/user/orders/create">
                    <Plus className="h-4 w-4 mb-1" />
                    <span className="text-xs">New Order</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 flex-col" >
                  <Link href="/user/map">
                    <Navigation className="h-4 w-4 mb-1" />
                    <span className="text-xs">Live Map</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 flex-col" >
                  <Link href="/user/stops/request">
                    <MapPin className="h-4 w-4 mb-1" />
                    <span className="text-xs">Request Stop</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 flex-col" >
                  <Link href="/user/orders">
                    <ShoppingCart className="h-4 w-4 mb-1" />
                    <span className="text-xs">My Orders</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}