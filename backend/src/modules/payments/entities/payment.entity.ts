import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod, PaymentStatus } from 'src/common/enum/payment';


@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty()
  currency: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: PaymentMethod
  })
  @ApiProperty({ enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING 
  })
  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ required: false })
  transaction_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ required: false })
  payment_gateway: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  @ApiProperty({ required: false })
  payment_details: any;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}