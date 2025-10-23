import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStatus, VehicleType } from 'src/common/enum/vehicle';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.current_lat = updateLocationDto.lat;
    vehicle.current_lng = updateLocationDto.lng;
    vehicle.status = updateLocationDto.status;
    vehicle.battery_level = updateLocationDto.battery_level;
    return await this.vehiclesRepository.save(vehicle);
  }

  async getOnlineVehicles(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { status: VehicleStatus.ONLINE },
      order: { updated_at: 'DESC' },
    });
  }

  async getVehiclesByType(vehicleType: string): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { vehicle_type: vehicleType as VehicleType },
      order: { created_at: 'DESC' },
    });
  }

  async toggleSound(id: string, enabled: boolean): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.is_sound_enabled = enabled;
    return await this.vehiclesRepository.save(vehicle);
  }

  async updateStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.status = status;
    return await this.vehiclesRepository.save(vehicle);
  }

  async getNearbyVehicles(lat: number, lng: number, radius: number = 5): Promise<Vehicle[]> {
    const vehicles = await this.vehiclesRepository.find({
      where: { status: VehicleStatus.ONLINE },
    });

    return vehicles.filter((vehicle) => {
      if (!vehicle.current_lat || !vehicle.current_lng) return false;
      const distance = this.calculateDistance(lat, lng, vehicle.current_lat, vehicle.current_lng);
      return distance <= radius;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
