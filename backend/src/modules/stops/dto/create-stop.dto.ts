import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum StopType {
  FIXED = 'fixed',
  USER_REQUEST = 'user_request',
  SELLING_SPOT = 'selling_spot',
}

export enum StopStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export class CreateStopDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  vehicle_id: string;

  @ApiProperty({ example: 'Stop Name' })
  @IsString()
  location_name: string;

  @ApiProperty({ example: 'Full address' })
  @IsString()
  address: string;

  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  lng: number;

  @ApiProperty({ enum: StopType, example: StopType.FIXED })
  @IsEnum(StopType)
  type: StopType;

  @ApiProperty({ enum: StopStatus, example: StopStatus.APPROVED, required: false })
  @IsOptional()
  @IsEnum(StopStatus)
  status?: StopStatus;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;
}