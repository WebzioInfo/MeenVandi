"use client";
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { routeAPI } from '@/app/lib/api';
import { useGeolocation } from '@/app/hooks/use-geolocation';
import { useStopsWithNearest } from '@/app/hooks/use-stops';
import { MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';

interface RouteStop {
  id: string | number;
  name?: string;
  location_name?: string;
  address?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

interface RouteItem {
  id: string | number;
  name: string;
  description?: string;
  stops?: RouteStop[];
}

export default function UserRoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { position } = useGeolocation();
  const lat = position?.coords.latitude ?? null;
  const lng = position?.coords.longitude ?? null;
  const { nearestStop } = useStopsWithNearest(lat, lng);

  useEffect(() => {
    let mounted = true;
    async function fetchRoutes() {
      setLoading(true);
      setError(null);
      try {
        const data = await routeAPI.list();
        if (!mounted) return;
        const payload: any = data as any;
        setRoutes(Array.isArray(payload) ? payload : payload?.items ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load routes');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRoutes();
    return () => {
      mounted = false;
    };
  }, []);

  const routesWithFlag = useMemo(() => {
    if (!nearestStop) return routes.map(r => ({ ...r, hasNearest: false }));
    return routes.map(r => ({
      ...r,
      hasNearest: !!r.stops?.some(s => {
        const sName = s.name || s.location_name;
        const nName = (nearestStop as any).name || (nearestStop as any).location_name;
        return s.id === (nearestStop as any).id || (sName && nName && sName === nName);
      }),
    }));
  }, [routes, nearestStop]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-600 mt-2">Explore available routes and their stops</p>
        </div>
        <Button variant="outline">
          <Link href="/user/map" className="flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            View Map
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading routes...</p>
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : routesWithFlag.length > 0 ? (
            <div className="space-y-4">
              {routesWithFlag.map((route) => (
                <div key={route.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {route.name}
                        {route.hasNearest && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Serves your nearest stop</span>
                        )}
                      </h3>
                      {route.description && (
                        <p className="text-sm text-gray-600">{route.description}</p>
                      )}
                    </div>
                  </div>

                  {route.stops && route.stops.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {route.stops.map((s) => (
                        <div key={s.id} className="text-sm text-gray-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{s.name || s.location_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No routes found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
