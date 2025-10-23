'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  MapPin, 
  Plus, 
  Clock, 
  CheckCircle,
  XCircle,
  Truck,
  LocateFixed
} from 'lucide-react';
import { formatDate, getStatusColor } from '@/app/lib/utils';
import { stopAPI } from '@/app/lib/api';
import Link from 'next/link';
import { Stop, StopStatus } from '@/app/types/stop';
import { useGeolocation } from '@/app/hooks/use-geolocation';
import { useStopsWithNearest } from '@/app/hooks/use-stops';

export default function UserStopsPage() {
  const { user } = useAuth();
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const { position } = useGeolocation();
  const lat = position?.coords.latitude ?? null;
  const lng = position?.coords.longitude ?? null;

  useEffect(() => {
    if (user?.id) {
      fetchStops();
    }
  }, [user]);

  const fetchStops = async () => {
    try {
      const data = await stopAPI.list();
      const items = Array.isArray(data) ? data : (data as any)?.items ?? [];
      setStops(items as Stop[]);
    } catch (error) {
      console.error('Error fetching stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: StopStatus) => {
    switch (status) {
      case StopStatus.PENDING: return <Clock className="h-5 w-5 text-yellow-600" />;
      case StopStatus.APPROVED: return <CheckCircle className="h-5 w-5 text-green-600" />;
      case StopStatus.REJECTED: return <XCircle className="h-5 w-5 text-red-600" />;
      case StopStatus.COMPLETED: return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return <MapPin className="h-5 w-5 text-gray-600" />;
    }
  };

  const pendingStops = stops.filter(stop => stop.status === StopStatus.PENDING).length;
  const approvedStops = stops.filter(stop => stop.status === StopStatus.APPROVED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stop Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage your vehicle stop requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button >
            <Link href="/user/stops/request">
              <Plus className="h-5 w-5 mr-2" />
              Request Stop
            </Link>
          </Button>
          <Button variant="outline" disabled={!lat || !lng}>
            <LocateFixed className="h-5 w-5 mr-2" />
            {lat && lng ? 'Using your location' : 'Enable location'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stops.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingStops}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedStops}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stops List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Stop Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading stops...</p>
            </div>
          ) : stops.length > 0 ? (
            <div className="space-y-4">
              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getStatusIcon(stop.status)}
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
                  
                  <div className="flex items-center space-x-2">
                    {stop.vehicle && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Truck className="h-4 w-4" />
                        <span>{stop.vehicle.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stop requests</h3>
              <p className="text-gray-600 mb-4">
                You haven't requested any stops yet.
              </p>
              <Button >
                <Link href="/user/stops/request">
                  <Plus className="h-5 w-5 mr-2" />
                  Request Your First Stop
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}