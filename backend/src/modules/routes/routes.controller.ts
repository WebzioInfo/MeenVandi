import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { AssignRouteDto } from './dto/assign-route.dto';
import { Constants } from '../../shared/utils/constants';

@ApiTags('routes')
@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new route' })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes' })
  findAll() {
    return this.routesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active routes' })
  getActiveRoutes() {
    return this.routesService.getActiveRoutes();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get routes by vehicle' })
  getRoutesByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.routesService.getRoutesByVehicle(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post('assign')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign route to vehicle' })
  assignRoute(@Body() assignRouteDto: AssignRouteDto) {
    return this.routesService.assignRoute(assignRouteDto);
  }

  @Patch(':id/status/:isActive')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update route status' })
  updateStatus(@Param('id') id: string, @Param('isActive') isActive: boolean) {
    return this.routesService.updateRouteStatus(id, isActive === true);
  }

  @Delete(':id')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete route' })
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}