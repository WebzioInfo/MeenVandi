import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  vehicle_id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  fish_type: string;

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  @ApiProperty()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  unit_price: number;

  @Column({ type: 'varchar', length: 20, default: 'kg' })
  @ApiProperty()
  unit: string;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @ManyToOne(() => Vehicle, vehicle => vehicle.inventory)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}