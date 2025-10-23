import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { VehicleStatus } from 'src/common/enum/vehicle';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('online')
  @ApiOperation({ summary: 'Get online vehicles' })
  getOnlineVehicles() {
    return this.vehiclesService.getOnlineVehicles();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby vehicles' })
  getNearbyVehicles(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5,
  ) {
    return this.vehiclesService.getNearbyVehicles(parseFloat(lat as any), parseFloat(lng as any), radius);
  }

  @Get('type/:vehicleType')
  @ApiOperation({ summary: 'Get vehicles by type' })
  getByType(@Param('vehicleType') vehicleType: string) {
    return this.vehiclesService.getVehiclesByType(vehicleType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update vehicle location' })
  updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.vehiclesService.updateLocation(id, updateLocationDto);
  }

  @Patch(':id/sound/:enabled')
  @ApiOperation({ summary: 'Toggle vehicle sound' })
  toggleSound(@Param('id') id: string, @Param('enabled') enabled: string) {
    return this.vehiclesService.toggleSound(id, enabled === 'true');
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update vehicle status' })
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.vehiclesService.updateStatus(id, status as VehicleStatus);
  }
}
