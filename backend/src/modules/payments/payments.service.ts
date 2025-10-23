import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { Order, PaymentStatus as OrderPaymentStatus } from '../orders/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from 'src/common/enum/payment';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const order = await this.ordersService.findOne(createPaymentDto.order_id);

    // Validate order ownership
    if (order.user_id !== createPaymentDto.user_id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    // Process payment based on method
    let paymentResult;
    switch (createPaymentDto.payment_method) {
      case 'upi':
        paymentResult = await this.processUPIPayment(createPaymentDto.amount, createPaymentDto.payment_details);
        break;
      case 'card':
        paymentResult = await this.processCardPayment(createPaymentDto.amount, createPaymentDto.payment_details);
        break;
      case 'cash':
        paymentResult = await this.processCashPayment(createPaymentDto.amount);
        break;
      default:
        throw new BadRequestException('Invalid payment method');
    }

    // Create payment record
    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      status: paymentResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      transaction_id: paymentResult.transactionId,
      payment_gateway: paymentResult.gateway,
      payment_details: paymentResult,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Update order payment status if payment successful
    if (paymentResult.success) {
      await this.ordersService.updatePaymentStatus(
        createPaymentDto.order_id, 
        OrderPaymentStatus.PAID
      );
    }

    return savedPayment;
  }

  private async processUPIPayment(amount: number, details: any): Promise<any> {
    // Mock UPI payment processing
    // In production, integrate with actual UPI gateway like Razorpay
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Simulate random failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('UPI payment failed');
      }

      return {
        success: true,
        transactionId: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gateway: 'razorpay',
        timestamp: new Date(),
        upi_id: details?.upi_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async processCardPayment(amount: number, details: any): Promise<any> {
    // Mock card payment processing
    // In production, integrate with Stripe or other card processors
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Simulate random failure (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Card payment failed');
      }

      return {
        success: true,
        transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gateway: 'stripe',
        timestamp: new Date(),
        last4: details?.card_number?.slice(-4),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async processCashPayment(amount: number): Promise<any> {
    // For cash payments, mark as pending until confirmed
    return {
      success: true,
      transactionId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gateway: 'cash',
      timestamp: new Date(),
    };
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      relations: ['order'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order']
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: { user_id: userId },
      relations: ['order'],
      order: { created_at: 'DESC' }
    });
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: { order_id: orderId },
      order: { created_at: 'DESC' }
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    return await this.paymentsRepository.save(payment);
  }

  async getPaymentStats(): Promise<any> {
    const totalPayments = await this.paymentsRepository.count();
    const totalAmount = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const paymentsByMethod = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('payment.payment_method, COUNT(*) as count, SUM(payment.amount) as amount')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.payment_method')
      .getRawMany();

    return {
      total_payments: totalPayments,
      total_amount: parseFloat(totalAmount.total) || 0,
      payments_by_method: paymentsByMethod,
    };
  }
}