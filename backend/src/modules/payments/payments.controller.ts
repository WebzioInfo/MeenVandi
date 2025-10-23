import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Constants } from '../../shared/utils/constants';
import { PaymentStatus } from 'src/common/enum/payment';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('stats')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get payment statistics' })
  getStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payments by user' })
  getPaymentsByUser(@Param('userId') userId: string) {
    return this.paymentsService.getPaymentsByUser(userId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments by order' })
  getPaymentsByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentsByOrder(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/status/:status')
  @Roles(Constants.ROLES.STAFF, Constants.ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update payment status' })
  updateStatus(@Param('id') id: string, @Param('status') status: PaymentStatus) {
    return this.paymentsService.updatePaymentStatus(id, status);
  }
}