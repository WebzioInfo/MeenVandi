import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { VehicleStatus } from 'src/common/enum/vehicle';

export class UpdateLocationDto {
  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  lng: number;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.ONLINE })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @ApiProperty({ example: 85, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  battery_level?: number;
}
