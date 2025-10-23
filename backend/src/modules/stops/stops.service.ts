import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stop } from './entities/stop.entity';
import { CreateStopDto, StopStatus, StopType } from './dto/create-stop.dto';
import { RequestStopDto } from './dto/request-stop.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stop)
    private stopsRepository: Repository<Stop>,
    private vehiclesService: VehiclesService,
  ) {}

  async create(createStopDto: CreateStopDto): Promise<Stop> {
    const stop = this.stopsRepository.create(createStopDto);
    return await this.stopsRepository.save(stop);
  }

  async requestStop(requestStopDto: RequestStopDto): Promise<Stop> {
    const vehicle = await this.vehiclesService.findOne(requestStopDto.vehicle_id);
    
    const stop = this.stopsRepository.create({
  ...requestStopDto,
  type: StopType.USER_REQUEST, 
  status: StopStatus.PENDING,  
} as Partial<Stop>);


    return await this.stopsRepository.save(stop);
  }

  async findAll(): Promise<Stop[]> {
    return await this.stopsRepository.find({
      relations: ['vehicle'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Stop> {
    const stop = await this.stopsRepository.findOne({
      where: { id },
      relations: ['vehicle']
    });
    if (!stop) {
      throw new NotFoundException('Stop not found');
    }
    return stop;
  }

  async getStopsByVehicle(vehicleId: string): Promise<Stop[]> {
    await this.vehiclesService.findOne(vehicleId); // Check if vehicle exists
    return await this.stopsRepository.find({
      where: { vehicle_id: vehicleId },
      order: { created_at: 'DESC' }
    });
  }

  async getPendingStops(): Promise<Stop[]> {
    return await this.stopsRepository.find({
      where: { status: StopStatus.PENDING },
      relations: ['vehicle'],
      order: { created_at: 'ASC' }
    });
  }

  async approveStop(id: string): Promise<Stop> {
    const stop = await this.findOne(id);
    stop.status = StopStatus.APPROVED;
    return await this.stopsRepository.save(stop);
  }

  async rejectStop(id: string): Promise<Stop> {
    const stop = await this.findOne(id);
    stop.status = StopStatus.REJECTED;
    return await this.stopsRepository.save(stop);
  }

  async completeStop(id: string): Promise<Stop> {
    const stop = await this.findOne(id);
    stop.status = StopStatus.COMPLETED;
    return await this.stopsRepository.save(stop);
  }

  async getActiveStops(): Promise<Stop[]> {
    return await this.stopsRepository.find({
      where: { status: StopStatus.APPROVED },
      relations: ['vehicle'],
      order: { created_at: 'ASC' }
    });
  }

  async remove(id: string): Promise<void> {
    const stop = await this.findOne(id);
    await this.stopsRepository.remove(stop);
  }
}