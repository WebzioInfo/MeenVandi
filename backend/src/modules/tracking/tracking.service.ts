import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { TrackingGateway } from './gateways/tracking.gateway';
import { VehicleStatus } from 'src/common/enum/vehicle';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    private trackingGateway: TrackingGateway,
  ) {}

  async updateVehicleLocation(
    vehicleId: string,
    lat: number,
    lng: number,
    status: VehicleStatus,
    battery_level: number = 100,
  ) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });

    if (!vehicle) return null;

    vehicle.current_lat = lat;
    vehicle.current_lng = lng;
    vehicle.status = status;
    vehicle.battery_level = battery_level;
    vehicle.updated_at = new Date();

    await this.vehiclesRepository.save(vehicle);

    // Broadcast location update to all connected clients
    this.trackingGateway.broadcastLocationUpdate({
      vehicle_id: vehicleId,
      lat,
      lng,
      status,
      battery_level,
      timestamp: new Date(),
    });

    return vehicle;
  }

  async getNearbyVehicles(lat: number, lng: number, radius: number = 5) {
    const vehicles = await this.vehiclesRepository.find({
      where: { status: VehicleStatus.ONLINE },
    });

    return vehicles.filter(vehicle => {
      if (!vehicle.current_lat || !vehicle.current_lng) return false;
      const distance = this.calculateDistance(
        lat,
        lng,
        vehicle.current_lat,
        vehicle.current_lng,
      );
      return distance <= radius;
    });
  }

  getVehicleTrackersCount(vehicleId: string): number {
    return this.trackingGateway.getVehicleTrackersCount(vehicleId);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
