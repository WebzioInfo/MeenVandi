'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useOrderStore } from '@/app/store/order-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  XCircle
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/app/lib/utils';
import Link from 'next/link';
import { Order, OrderStatus, OrderType } from '@/app/types/order';

export default function UserOrdersPage() {
  const { user } = useAuth();
  const { 
    orders, 
    fetchUserOrders,
    loading 
  } = useOrderStore();
  
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders(user.id);
    }
  }, [user, fetchUserOrders]);

  useEffect(() => {
    let filtered = orders;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.fish_type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getOrderIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.CONFIRMED: return <Package className="h-5 w-5 text-blue-600" />;
      case OrderStatus.PREPARING: return <Package className="h-5 w-5 text-indigo-600" />;
      case OrderStatus.READY: return <Package className="h-5 w-5 text-green-600" />;
      case OrderStatus.ON_THE_WAY: return <Truck className="h-5 w-5 text-purple-600" />;
      case OrderStatus.ARRIVED: return <MapPin className="h-5 w-5 text-teal-600" />;
      case OrderStatus.COMPLETED: return <CheckCircle className="h-5 w-5 text-green-600" />;
      case OrderStatus.CANCELLED: return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOrderTypeColor = (type: OrderType) => {
    switch (type) {
      case OrderType.PRE_BOOK: return 'bg-blue-100 text-blue-800';
      case OrderType.ON_THE_SPOT: return 'bg-green-100 text-green-800';
      case OrderType.DOORSTEP: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
    active: orders.filter(o => 
      o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your fish orders
          </p>
        </div>
        <Button >
          <Link href="/user/orders/create">
            <Plus className="h-5 w-5 mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
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
                  placeholder="Search orders or fish type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                <option value={OrderStatus.PREPARING}>Preparing</option>
                <option value={OrderStatus.READY}>Ready</option>
                <option value={OrderStatus.ON_THE_WAY}>On the Way</option>
                <option value={OrderStatus.ARRIVED}>Arrived</option>
                <option value={OrderStatus.COMPLETED}>Completed</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getOrderIcon(order.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {order.order_number}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(order.order_type)}`}>
                          {order.order_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Items:</strong>{' '}
                          {order.items.map(item => 
                            `${item.quantity}kg ${item.fish_type}${item.is_cut ? ' (Cut)' : ''}`
                          ).join(', ')}
                        </p>
                        <p>
                          <strong>Total:</strong> {formatCurrency(order.total_amount)}
                        </p>
                        <p>
                          <strong>Ordered:</strong> {formatDate(order.created_at)}
                        </p>
                        {order.vehicle && (
                          <p>
                            <strong>Vehicle:</strong> {order.vehicle.name} ({order.vehicle.number_plate})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <Button variant="outline" size="sm" >
                      <Link href={`/user/orders/${order.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by placing your first order'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Button >
                    <Link href="/user/orders/create">
                      <Plus className="h-5 w-5 mr-2" />
                      Place Your First Order
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}