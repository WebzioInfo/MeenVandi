import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { UserType } from 'src/common/enum/userType';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiProperty({ required: false })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: UserType,
    default: UserType.CUSTOMER 
  })
  @ApiProperty({ enum: UserType })
  user_type: UserType;

  @Column({ type: 'bit', default: 1 })
  @ApiProperty()
  is_active: boolean;

  @Column({ type: 'bit', default: 0 })
  @ApiProperty()
  is_verified: boolean;

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;
}
