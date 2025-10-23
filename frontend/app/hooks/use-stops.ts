"use client";
import { useEffect, useMemo, useState } from 'react';
import { Stop } from '@/app/types/stop';
import { api } from '../lib/api';

export interface NearestStopResult {
  nearestStop: (Stop & { distanceKm: number }) | null;
  stopsWithDistance: Array<Stop & { distanceKm: number }>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useStopsWithNearest(userLat: number | null, userLng: number | null): NearestStopResult {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchStops() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/stops`);
        const data = res.data?.data ?? res.data; // handle wrapped or direct responses
        if (mounted) setStops(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e: any) {
        if (mounted) setError(e.response?.data?.message || 'Failed to load stops');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchStops();
    return () => {
      mounted = false;
    };
  }, [version]);

  const stopsWithDistance = useMemo(() => {
    if (!userLat || !userLng) return [];
    return stops
      .filter(s => s.lat != null && s.lng != null)
      .map(s => ({
        ...s,
        distanceKm: haversine(userLat, userLng, Number(s.lat), Number(s.lng)),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [stops, userLat, userLng]);

  const nearestStop = stopsWithDistance.length > 0 ? stopsWithDistance[0] : null;

  return {
    nearestStop,
    stopsWithDistance,
    loading,
    error,
    refresh: () => setVersion(v => v + 1),
  };
}
