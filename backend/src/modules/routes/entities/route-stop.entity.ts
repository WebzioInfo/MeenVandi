import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Route } from './route.entity';

@Entity('route_stops')
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  route_id: string;

  @Column({ type: 'int' })
  @ApiProperty()
  stop_order: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  location_name: string;

  @Column({ type: 'text' })
  @ApiProperty()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  @ApiProperty()
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  @ApiProperty()
  longitude: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ required: false })
  estimated_arrival_time: number;

  @ManyToOne(() => Route, route => route.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;
}