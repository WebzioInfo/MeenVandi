import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class RequestStopDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  vehicle_id: string;

  @ApiProperty({ example: 'My Home Stop' })
  @IsString()
  location_name: string;

  @ApiProperty({ example: 'My home address' })
  @IsString()
  address: string;

  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  lng: number;
}