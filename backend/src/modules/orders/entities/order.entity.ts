import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';

export enum OrderType {
  PRE_BOOK = 'pre_book',
  ON_THE_SPOT = 'on_the_spot',
  DOORSTEP = 'doorstep',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  order_number: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  vehicle_id: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: OrderType 
  })
  @ApiProperty({ enum: OrderType })
  order_type: OrderType;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: OrderStatus,
    default: OrderStatus.PENDING 
  })
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING 
  })
  @ApiProperty({ enum: PaymentStatus })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false })
  delivery_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @ApiProperty({ required: false })
  delivery_lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @ApiProperty({ required: false })
  delivery_lng: number;

  @Column({ type: 'bit', default: 0 })
  @ApiProperty()
  requires_cutting: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false })
  special_instructions: string;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ required: false })
  scheduled_time: Date;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vehicle, vehicle => vehicle.orders)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(() => OrderItem, item => item.order)
  @ApiProperty({ type: () => [OrderItem] })
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  @ApiProperty({ type: () => [Payment] })
  payments: Payment[];
}