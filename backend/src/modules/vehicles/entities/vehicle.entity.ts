import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus, VehicleType } from 'src/common/enum/vehicle';
import { Stop } from 'src/modules/stops/entities/stop.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';



@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty()
  number_plate: string;

  @Column({ type: 'varchar', enum: VehicleType })
  @ApiProperty({ enum: VehicleType })
  vehicle_type: VehicleType;

  @Column({ type: 'varchar', enum: VehicleStatus, default: VehicleStatus.OFFLINE })
  @ApiProperty({ enum: VehicleStatus })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @ApiProperty({ required: false })
  current_lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  @ApiProperty({ required: false })
  current_lng: number;

  @Column({ type: 'int', default: 100 })
  @ApiProperty()
  battery_level: number;

  @Column({ type: 'bit', default: 1 })
  @ApiProperty()
  is_sound_enabled: boolean;

  @Column({ type: 'uuid', nullable: true })
  current_route_id?: string;

  @OneToMany(() => Order, order => order.vehicle)
  orders: Order[];

  @OneToMany(() => Stop, stop => stop.vehicle)
  stops: Stop[];

  @OneToMany(() => Inventory, inventory => inventory.vehicle)
  inventory: Inventory[]; 

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;
}
