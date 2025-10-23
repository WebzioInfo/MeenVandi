import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  fish_type: string;

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  @ApiProperty()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  total_price: number;

  @Column({ type: 'bit', default: 1 })
  @ApiProperty()
  is_cut: boolean;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}