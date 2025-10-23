import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UsersService } from '../users/users.service';
import { NotificationType } from 'src/common/enum/notificationType';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    if (createNotificationDto.user_id) {
      await this.usersService.findOne(createNotificationDto.user_id);
    }

    const notification = this.notificationsRepository.create(createNotificationDto);
    return await this.notificationsRepository.save(notification);
  }

  async createForAllUsers(createNotificationDto: Omit<CreateNotificationDto, 'user_id'>): Promise<Notification[]> {
    const users = await this.usersService.findAll();
    const notifications = users.map(user =>
      this.notificationsRepository.create({
        ...createNotificationDto,
        user_id: user.id,
      })
    );

    return await this.notificationsRepository.save(notifications);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user']
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    await this.usersService.findOne(userId);
    return await this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async getUnreadByUser(userId: string): Promise<Notification[]> {
    await this.usersService.findOne(userId);
    return await this.notificationsRepository.find({
      where: { 
        user_id: userId,
        is_read: false 
      },
      order: { created_at: 'DESC' }
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.is_read = true;
    notification.read_at = new Date();
    return await this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.usersService.findOne(userId);
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() }
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async sendVehicleNotification(vehicleId: string, message: string, type: NotificationType): Promise<Notification[]> {
    // This would typically send to all users tracking the vehicle
    // For now, we'll create a general notification
    return await this.createForAllUsers({
      title: 'Vehicle Update',
      message,
      type,
      data: { vehicle_id: vehicleId }
    });
  }
}