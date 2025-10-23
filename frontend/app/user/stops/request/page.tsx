'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '@/app/store/vehicle-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  MapPin, 
  Truck,
  Navigation,
  Clock
} from 'lucide-react';
import { stopAPI } from '@/app/lib/api';
import { Vehicle } from '@/app/types/vehicle';

export default function RequestStopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicles, fetchVehicles } = useVehicleStore();
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    location_name: '',
    address: '',
    lat: 0,
    lng: 0,
    duration_minutes: 10
  });
  
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.id) {
      alert('Please log in to request a stop');
      return;
    }

    if (!formData.vehicle_id || !formData.location_name || !formData.address) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await stopAPI.request(formData);
      router.push('/user/stops');
    } catch (error) {
      console.error('Error requesting stop:', error);
      alert('Failed to request stop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            location_name: 'My Current Location',
            address: 'Current location based on GPS'
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request a Stop</h1>
          <p className="text-gray-600 mt-2">
            Ask a fish delivery vehicle to stop at your location
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stop Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Vehicle</CardTitle>
              <CardDescription>
                Choose which vehicle you want to stop
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.vehicle_id === vehicle.id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, vehicle_id: vehicle.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Truck className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vehicle.name}</p>
                          <p className="text-sm text-gray-600">{vehicle.number_plate}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vehicle.status === 'online' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {vehicle.status}
                            </span>
                            {vehicle.is_sound_enabled && (
                              <span className="text-xs text-gray-500">With Sound</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles available</h3>
                  <p className="text-gray-600">
                    There are no active vehicles nearby at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Stop Location</CardTitle>
              <CardDescription>
                Where do you want the vehicle to stop?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>

              <Input
                label="Location Name"
                placeholder="E.g., Near my home, Office entrance, etc."
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  placeholder="Enter the complete address where the vehicle should stop"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Stop Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Stop Duration</CardTitle>
              <CardDescription>
                How long should the vehicle wait at your stop?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Clock className="h-5 w-5 text-gray-400" />
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stop Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.vehicle_id && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {availableVehicles.find(v => v.id === formData.vehicle_id)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {availableVehicles.find(v => v.id === formData.vehicle_id)?.number_plate}
                      </p>
                    </div>
                  </div>
                )}

                {formData.location_name && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{formData.location_name}</p>
                      <p className="text-sm text-gray-600">{formData.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Stop Duration</p>
                    <p className="text-sm text-gray-600">{formData.duration_minutes} minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
            disabled={!formData.vehicle_id || !formData.location_name || !formData.address}
          >
            <MapPin className="h-5 w-5 mr-2" />
            Request Stop
          </Button>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your stop request will be sent to the vehicle driver</li>
                  <li>The driver can approve or reject your request</li>
                  <li>You'll be notified when the vehicle is approaching</li>
                  <li>Vehicle will wait at your stop for the specified duration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}