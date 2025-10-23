import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Constants } from '../../shared/utils/constants';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN, Constants.ROLES.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Add stock to inventory' })
  addStock(@Body() addStockDto: AddStockDto) {
    return this.inventoryService.addStock(addStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get inventory by vehicle' })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.inventoryService.findByVehicle(vehicleId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  getLowStock(@Query('threshold') threshold: number = 10) {
    return this.inventoryService.getLowStock(threshold);
  }

  @Get('fish-types')
  @ApiOperation({ summary: 'Get available fish types' })
  getAvailableFishTypes() {
    return this.inventoryService.getAvailableFishTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory by ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN, Constants.ROLES.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Update inventory' })
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.inventoryService.updateStock(id, updateStockDto);
  }

  @Post('deduct')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN, Constants.ROLES.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Deduct stock from inventory' })
  deductStock(
    @Body('vehicle_id') vehicleId: string,
    @Body('fish_type') fishType: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.deductStock(vehicleId, fishType, quantity);
  }

  @Delete(':id')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete inventory' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}