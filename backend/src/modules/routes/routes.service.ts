import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { RouteStop } from './entities/route-stop.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { AssignRouteDto } from './dto/assign-route.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private routeStopsRepository: Repository<RouteStop>,
    private vehiclesService: VehiclesService,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const route = this.routesRepository.create(createRouteDto);
    const savedRoute = await this.routesRepository.save(route);

    // Create route stops
    if (createRouteDto.stops && createRouteDto.stops.length > 0) {
      const stops = createRouteDto.stops.map((stop, index) =>
        this.routeStopsRepository.create({
          ...stop,
          route_id: savedRoute.id,
          stop_order: index + 1,
        })
      );
      await this.routeStopsRepository.save(stops);
      savedRoute.stops = stops;
    }

    return savedRoute;
  }

  async findAll(): Promise<Route[]> {
    return await this.routesRepository.find({
      relations: ['stops'],
      order: { 
        created_at: 'DESC',
        stops: { stop_order: 'ASC' }
      }
    });
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id },
      relations: ['stops'],
      order: { stops: { stop_order: 'ASC' } }
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async assignRoute(assignRouteDto: AssignRouteDto): Promise<Route> {
    const route = await this.findOne(assignRouteDto.route_id);
    const vehicle = await this.vehiclesService.findOne(assignRouteDto.vehicle_id);

    // Check if vehicle is already assigned to another route
    if (vehicle.current_route_id && vehicle.current_route_id !== assignRouteDto.route_id) {
      throw new BadRequestException('Vehicle is already assigned to another route');
    }

    // Update vehicle with route assignment
    vehicle.current_route_id = assignRouteDto.route_id;
    await this.vehiclesService.updateStatus(vehicle.id, 'on_route' as any);

    return route;
  }

  async getRoutesByVehicle(vehicleId: string): Promise<Route[]> {
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle.current_route_id) {
      return [];
    }
    
    return await this.routesRepository.find({
      where: { id: vehicle.current_route_id },
      relations: ['stops'],
      order: { stops: { stop_order: 'ASC' } }
    });
  }

  async getActiveRoutes(): Promise<Route[]> {
    return await this.routesRepository.find({
      where: { is_active: true },
      relations: ['stops'],
      order: { 
        created_at: 'DESC',
        stops: { stop_order: 'ASC' }
      }
    });
  }

  async updateRouteStatus(id: string, isActive: boolean): Promise<Route> {
    const route = await this.findOne(id);
    route.is_active = isActive;
    return await this.routesRepository.save(route);
  }

  async remove(id: string): Promise<void> {
    const route = await this.findOne(id);
    await this.routesRepository.remove(route);
  }
}