'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { useOrderStore } from '@/app/store/order-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Truck,
  MapPin,
  Clock,
  Home
} from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';
import { OrderType } from '@/app/types/order';
import { Vehicle } from '@/app/types/vehicle';

interface OrderItemForm {
  fish_type: string;
  quantity: number;
  unit_price: number;
  is_cut: boolean;
}

export default function CreateOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { addOrder, loading } = useOrderStore();
  
  const [formData, setFormData] = useState({
    order_type: OrderType.ON_THE_SPOT,
    vehicle_id: '',
    delivery_address: '',
    delivery_lat: 0,
    delivery_lng: 0,
    requires_cutting: false,
    special_instructions: '',
    scheduled_time: '',
  });
  
  const [items, setItems] = useState<OrderItemForm[]>([
    { fish_type: '', quantity: 1, unit_price: 0, is_cut: false }
  ]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    // Filter available vehicles (online or on route)
    const available = vehicles.filter(v => 
      v.status === 'online' || v.status === 'on_route'
    );
    setAvailableVehicles(available);
  }, [vehicles]);

  const addItem = () => {
    setItems([...items, { fish_type: '', quantity: 1, unit_price: 0, is_cut: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItemForm, value: any) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Please log in to place an order');
      return;
    }

    // Validate items
    const invalidItems = items.filter(item => 
      !item.fish_type || item.quantity <= 0 || item.unit_price <= 0
    );
    
    if (invalidItems.length > 0) {
      alert('Please fill in all item details correctly');
      return;
    }

    try {
      const orderData = {
        user_id: user.id,
        ...formData,
        total_amount: calculateTotal(),
        items: items.map(item => ({
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      };

      await addOrder(orderData as any);
      router.push('/user/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const fishTypes = [
    'Pomfret', 'Salmon', 'Tuna', 'Rohu', 'Katla', 'Hilsa', 'Mackerel', 
    'Sardine', 'Anchovy', 'Kingfish', 'Red Snapper', 'Seer Fish'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-2">
            Place your fish order for delivery or pickup
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type */}
          <Card>
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
              <CardDescription>
                Choose how you want to receive your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order_type: OrderType.ON_THE_SPOT }))}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    formData.order_type === OrderType.ON_THE_SPOT
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Truck className="h-6 w-6 text-primary-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">On the Spot</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Buy when vehicle is nearby
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order_type: OrderType.PRE_BOOK }))}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    formData.order_type === OrderType.PRE_BOOK
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Clock className="h-6 w-6 text-primary-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">Pre-book</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Book in advance for pickup
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order_type: OrderType.DOORSTEP }))}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    formData.order_type === OrderType.DOORSTEP
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Home className="h-6 w-6 text-primary-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">Doorstep</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Home delivery (extra charges apply)
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Items</span>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
              <CardDescription>
                Add the fish items you want to order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                      {/* Fish Type */}
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fish Type
                        </label>
                        <select
                          value={item.fish_type}
                          onChange={(e) => updateItem(index, 'fish_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select fish type</option>
                          {fishTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity (kg)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price per kg (₹)
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      {/* Cut Option */}
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.is_cut}
                            onChange={(e) => updateItem(index, 'is_cut', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Cut & Clean</span>
                        </label>
                      </div>
                    </div>

                    {/* Remove Button */}
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          {(formData.order_type === OrderType.DOORSTEP || formData.order_type === OrderType.PRE_BOOK) && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>
                  {formData.order_type === OrderType.DOORSTEP 
                    ? 'Enter your delivery address' 
                    : 'Provide details for pickup'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Delivery Address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  placeholder="Enter your complete address"
                  required={formData.order_type === OrderType.DOORSTEP}
                />

                {formData.order_type === OrderType.PRE_BOOK && (
                  <Input
                    label="Scheduled Time"
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
              <CardDescription>
                Any specific requirements for your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="E.g., Fresh catch only, specific cutting instructions, etc."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.fish_type || 'Fish Item'}
                        </p>
                        <p className="text-gray-600">
                          {item.quantity}kg {item.is_cut && '• Cut & Clean'}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Vehicles */}
          {availableVehicles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Vehicles</CardTitle>
                <CardDescription>
                  Choose a vehicle for your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableVehicles.slice(0, 3).map(vehicle => (
                    <div
                      key={vehicle.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.vehicle_id === vehicle.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, vehicle_id: vehicle.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.name}</p>
                          <p className="text-sm text-gray-600">{vehicle.number_plate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
            disabled={calculateTotal() === 0}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Place Order - {formatCurrency(calculateTotal())}
          </Button>
        </div>
      </form>
    </div>
  );
}