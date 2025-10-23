import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { NotificationType } from 'src/common/enum/notificationType';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-uuid', required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ example: 'Vehicle Arrived' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your fish vehicle has arrived at the stop' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.VEHICLE_UPDATE })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: { vehicle_id: 'vehicle-uuid' }, required: false })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_read?: boolean;
}