import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { VehicleStatus, VehicleType } from 'src/common/enum/vehicle';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number_plate: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicle_type: VehicleType;

  @ApiProperty({ enum: VehicleStatus, required: false })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  current_lat?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  current_lng?: number;
}
