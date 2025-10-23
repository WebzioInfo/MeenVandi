import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class AddStockDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  vehicle_id: string;

  @ApiProperty({ example: 'Pomfret' })
  @IsString()
  fish_type: string;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({ example: 'kg', required: false })
  @IsString()
  unit?: string;
}