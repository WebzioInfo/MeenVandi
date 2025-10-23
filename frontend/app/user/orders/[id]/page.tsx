'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useOrderStore } from '@/app/store/order-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  ArrowLeft,
  Package, 
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  User,
  CreditCard,
  Phone
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/app/lib/utils';
import { orderAPI } from '@/app/lib/api';
import { Order, OrderStatus } from '@/app/types/order';
import { PaymentStatus } from '@/app/types/payment';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { updateOrderStatus } = useOrderStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.CONFIRMED: return <Package className="h-5 w-5 text-blue-600" />;
      case OrderStatus.PREPARING: return <Package className="h-5 w-5 text-indigo-600" />;
      case OrderStatus.READY: return <Package className="h-5 w-5 text-green-600" />;
      case OrderStatus.ON_THE_WAY: return <Truck className="h-5 w-5 text-purple-600" />;
      case OrderStatus.ARRIVED: return <MapPin className="h-5 w-5 text-teal-600" />;
      case OrderStatus.COMPLETED: return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNextAction = () => {
    if (!order) return null;

    switch (order.status) {
      case OrderStatus.PENDING:
        return { label: 'Cancel Order', action: () => updateOrderStatus(orderId, OrderStatus.CANCELLED) };
      case OrderStatus.READY:
        return { label: 'Mark as Received', action: () => updateOrderStatus(orderId, OrderStatus.COMPLETED) };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

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
              <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
              <p className="text-gray-600 mb-4">
                The order you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/user/orders')}>
                Back to Orders
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-600 mt-2">
              Ordered on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        
        {nextAction && (
          <Button variant="outline" onClick={nextAction.action}>
            {nextAction.label}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {order.status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current order status
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Items included in your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.fish_type}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}kg • {item.is_cut ? 'Cut & Clean' : 'Whole Fish'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.total_price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.unit_price)}/kg
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Type
                    </label>
                    <p className="text-gray-900 capitalize">{order.order_type.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>

                  {order.requires_cutting && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requirement
                      </label>
                      <p className="text-gray-900">Fish Cutting Required</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {order.delivery_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <p className="text-gray-900">{order.delivery_address}</p>
                    </div>
                  )}

                  {order.scheduled_time && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Time
                      </label>
                      <p className="text-gray-900">{formatDate(order.scheduled_time)}</p>
                    </div>
                  )}

                  {order.special_instructions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <p className="text-gray-900">{order.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          {order.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.vehicle.name}</p>
                    <p className="text-sm text-gray-600">{order.vehicle.number_plate}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.vehicle.status)}`}>
                      {order.vehicle.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total</span>
                  <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
                {order.payment_status === PaymentStatus.PENDING && (
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Contact Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}