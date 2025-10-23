import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order.entity';
import { Constants } from '../../shared/utils/constants';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('stats')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get order statistics' })
  getStats() {
    return this.ordersService.calculateOrderStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get orders by user' })
  getOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get orders by vehicle' })
  getOrdersByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.ordersService.getOrdersByVehicle(vehicleId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  getOrdersByStatus(@Param('status') status: OrderStatus) {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @Param('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/payment-status/:paymentStatus')
  @ApiOperation({ summary: 'Update payment status' })
  updatePaymentStatus(@Param('id') id: string, @Param('paymentStatus') paymentStatus: PaymentStatus) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}