import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRouteDto {
  @ApiProperty({ example: 'route-uuid' })
  @IsString()
  route_id: string;

  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  vehicle_id: string;
}