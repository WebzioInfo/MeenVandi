import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from 'src/common/enum/notificationType';


@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  title: string;

  @Column({ type: 'text' })
  @ApiProperty()
  message: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    enum: NotificationType
  })
  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  @ApiProperty({ required: false })
  data: any;

  @Column({ type: 'bit', default: 0 })
  @ApiProperty()
  is_read: boolean;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ required: false })
  read_at: Date;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}