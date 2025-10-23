import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StopsService } from './stops.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { RequestStopDto } from './dto/request-stop.dto';
import { Constants } from '../../shared/utils/constants';

@ApiTags('stops')
@Controller('stops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Post()
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new stop' })
  create(@Body() createStopDto: CreateStopDto) {
    return this.stopsService.create(createStopDto);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request a stop' })
  requestStop(@Body() requestStopDto: RequestStopDto) {
    return this.stopsService.requestStop(requestStopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stops' })
  findAll() {
    return this.stopsService.findAll();
  }

  @Get('pending')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get pending stops' })
  getPendingStops() {
    return this.stopsService.getPendingStops();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active stops' })
  getActiveStops() {
    return this.stopsService.getActiveStops();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get stops by vehicle' })
  getStopsByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.stopsService.getStopsByVehicle(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stop by ID' })
  findOne(@Param('id') id: string) {
    return this.stopsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve stop' })
  approveStop(@Param('id') id: string) {
    return this.stopsService.approveStop(id);
  }

  @Patch(':id/reject')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject stop' })
  rejectStop(@Param('id') id: string) {
    return this.stopsService.rejectStop(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete stop' })
  completeStop(@Param('id') id: string) {
    return this.stopsService.completeStop(id);
  }

  @Delete(':id')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete stop' })
  remove(@Param('id') id: string) {
    return this.stopsService.remove(id);
  }
}