import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Vehicle } from '../types/vehicle';
import { vehicleAPI } from '../lib/api'; // Import your vehicleAPI

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  socket: Socket | null;
  isConnected: boolean;
  loading: boolean;

  initializeSocket: (token: string) => void;
  disconnectSocket: () => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
  updateVehicleLocation: (vehicleId: string, updates: Partial<Vehicle>) => void;
  trackVehicle: (vehicleId: string) => void;
  stopTracking: (vehicleId: string) => void;

  fetchVehicles: () => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  socket: null,
  isConnected: false,
  loading: false,

  initializeSocket: (token: string) => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/tracking`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

    socket.on('location-updated', (data: any) => {
      const { vehicles } = get();
      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === data.vehicle_id
          ? {
              ...vehicle,
              current_lat: data.lat,
              current_lng: data.lng,
              status: data.status,
              battery_level: data.battery_level,
            }
          : vehicle
      );
      set({ vehicles: updatedVehicles });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  setVehicles: (vehicles: Vehicle[]) => set({ vehicles }),

  selectVehicle: (vehicle: Vehicle | null) => set({ selectedVehicle: vehicle }),

  updateVehicleLocation: (vehicleId: string, updates: Partial<Vehicle>) => {
    const { vehicles } = get();
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle
    );
    set({ vehicles: updatedVehicles });
  },

  trackVehicle: (vehicleId: string) => {
    const { socket, vehicles } = get();
    if (socket) socket.emit('track-vehicle', { vehicle_id: vehicleId });

    const vehicle = vehicles.find(v => v.id === vehicleId);
    set({ selectedVehicle: vehicle || null });
  },

  stopTracking: (vehicleId: string) => {
    const { socket } = get();
    if (socket) socket.emit('stop-tracking', { vehicle_id: vehicleId });
  },

  fetchVehicles: async () => {
    set({ loading: true });
    try {
      const response = await vehicleAPI.getAll();
      console.log(response)
      set({ vehicles: response.data.data });
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      set({ loading: false });
    }
  },
}));
