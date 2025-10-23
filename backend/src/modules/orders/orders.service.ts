import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderType, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UsersService } from '../users/users.service';
import { Helpers } from 'src/shared/utils/helper';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private vehiclesService: VehiclesService,
    private usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate user and vehicle
    await this.usersService.findOne(createOrderDto.user_id);
    if (createOrderDto.vehicle_id) {
      await this.vehiclesService.findOne(createOrderDto.vehicle_id);
    }

    const order = this.ordersRepository.create({
      ...createOrderDto,
      order_number: Helpers.generateOrderNumber(),
      status: OrderStatus.PENDING,
      payment_status: PaymentStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    if (createOrderDto.items && createOrderDto.items.length > 0) {
      const items = createOrderDto.items.map(item =>
        this.orderItemsRepository.create({
          ...item,
          order_id: savedOrder.id,
          total_price: item.quantity * item.unit_price,
        })
      );
      await this.orderItemsRepository.save(items);
      savedOrder.items = items;
    }

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ['user', 'vehicle', 'items'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'vehicle', 'items']
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { order_number: orderNumber },
      relations: ['user', 'vehicle', 'items']
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.ordersRepository.save(order);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.payment_status = paymentStatus;
    return await this.ordersRepository.save(order);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    await this.usersService.findOne(userId);
    return await this.ordersRepository.find({
      where: { user_id: userId },
      relations: ['vehicle', 'items'],
      order: { created_at: 'DESC' }
    });
  }

  async getOrdersByVehicle(vehicleId: string): Promise<Order[]> {
    await this.vehiclesService.findOne(vehicleId);
    return await this.ordersRepository.find({
      where: { vehicle_id: vehicleId },
      relations: ['user', 'items'],
      order: { created_at: 'DESC' }
    });
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { status },
      relations: ['user', 'vehicle', 'items'],
      order: { created_at: 'DESC' }
    });
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }

  async calculateOrderStats(): Promise<any> {
    const totalOrders = await this.ordersRepository.count();
    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.payment_status = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    const ordersByStatus = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status, COUNT(*) as count')
      .groupBy('order.status')
      .getRawMany();

    return {
      total_orders: totalOrders,
      total_revenue: parseFloat(totalRevenue.total) || 0,
      orders_by_status: ordersByStatus,
    };
  }
}