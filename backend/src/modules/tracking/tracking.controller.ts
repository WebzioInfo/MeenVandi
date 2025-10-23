import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrackingService } from './tracking.service';

@ApiTags('tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('vehicle/:id/trackers')
  @ApiOperation({ summary: 'Get number of trackers connected to a vehicle' })
  getVehicleTrackers(@Param('id') id: string) {
    const count = this.trackingService.getVehicleTrackersCount(id);
    return { vehicle_id: id, tracker_count: count };
  }
}
