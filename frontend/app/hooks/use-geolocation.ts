"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

export interface GeolocationPositionLike {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

export type GeolocationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported' | 'unknown';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number; // ms cache
  timeout?: number; // ms
  watch?: boolean; // default true
}

interface UseGeolocationReturn {
  position: GeolocationPositionLike | null;
  error: string | null;
  permission: GeolocationPermission;
  isSupported: boolean;
  request: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    maximumAge = 10_000,
    timeout = 10_000,
    watch = true,
  } = options;

  const [position, setPosition] = useState<GeolocationPositionLike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<GeolocationPermission>('unknown');
  const watchIdRef = useRef<number | null>(null);

  const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      },
      timestamp: pos.timestamp,
    });
    setError(null);
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    let msg = err.message || 'Unable to retrieve location';
    if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied';
    if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location position unavailable';
    if (err.code === err.TIMEOUT) msg = 'Location request timed out';
    setError(msg);
  }, []);

  const request = useCallback(() => {
    if (!isSupported) return;
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [isSupported, onSuccess, onError, enableHighAccuracy, timeout, maximumAge]);

  // handle permission status (where supported)
  useEffect(() => {
    if (typeof window === 'undefined' || !('permissions' in navigator)) {
      setPermission(isSupported ? 'prompt' : 'unsupported');
      return;
    }
    // @ts-ignore - permissions API not fully typed in TS lib
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status: any) => {
        const state = status.state as GeolocationPermission;
        setPermission(state);
        const handler = () => setPermission(status.state as GeolocationPermission);
        status.addEventListener?.('change', handler);
      })
      .catch(() => setPermission('unknown'));
  }, [isSupported]);

  // initial fetch
  useEffect(() => {
    if (!isSupported) return;
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [isSupported, onSuccess, onError, enableHighAccuracy, timeout, maximumAge]);

  // watch position
  useEffect(() => {
    if (!isSupported || !watch) return;
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isSupported, watch, onSuccess, onError, enableHighAccuracy, timeout, maximumAge]);

  return { position, error, permission, isSupported, request };
}
