import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { StopStatus, StopType } from '../dto/create-stop.dto';


@Entity('stops')
export class Stop {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  vehicle_id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  location_name: string;

  @Column({ type: 'text' })
  @ApiProperty()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  @ApiProperty()
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  @ApiProperty()
  lng: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: StopType 
  })
  @ApiProperty({ enum: StopType })
  type: StopType;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: StopStatus,
    default: StopStatus.PENDING 
  })
  @ApiProperty({ enum: StopStatus })
  status: StopStatus;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ required: false })
  duration_minutes: number;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @ManyToOne(() => Vehicle, vehicle => vehicle.stops)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}