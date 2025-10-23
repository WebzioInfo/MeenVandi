import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RouteStop } from './route-stop.entity';

@Entity('delivery_routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  route_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  route_code: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  start_location: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  end_location: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @ApiProperty()
  total_distance: number;

  @Column({ type: 'int' })
  @ApiProperty()
  estimated_time: number;

  @Column({ type: 'bit', default: 1 })
  @ApiProperty()
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ required: false })
  created_by: string;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @OneToMany(() => RouteStop, stop => stop.route)
  @ApiProperty({ type: () => [RouteStop] })
  stops: RouteStop[];
}