import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVehicleStore } from '../store/vehicle-store';
import { Vehicle } from '../types/vehicle';

// Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useVehicles = () => {
  const { user } = useAuth();
  const { vehicles, loading, isConnected, initializeSocket, fetchVehicles } = useVehicleStore();

  useEffect(() => {
    if (user?.token) {
      initializeSocket(user.token);
      fetchVehicles();
    }
  }, [user, initializeSocket, fetchVehicles]);

  const getNearbyVehicles = (lat: number, lng: number, radius: number = 5) => {
    return vehicles.filter(vehicle => {
      if (!vehicle.current_lat || !vehicle.current_lng) return false;
      const distance = calculateDistance(lat, lng, vehicle.current_lat, vehicle.current_lng);
      return distance <= radius;
    });
  };

  const getOnlineVehicles = () => vehicles.filter(v => v.status === 'online' || v.status === 'on_route');

  return {
    vehicles,
    loading,
    isConnected,
    getNearbyVehicles,
    getOnlineVehicles,
    refreshVehicles: fetchVehicles,
  };
};
