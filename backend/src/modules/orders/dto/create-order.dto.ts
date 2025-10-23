import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../entities/order.entity';

class OrderItemDto {
  @ApiProperty({ example: 'Pomfret' })
  @IsString()
  fish_type: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_cut?: boolean;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 'vehicle-uuid', required: false })
  @IsOptional()
  @IsString()
  vehicle_id?: string;

  @ApiProperty({ enum: OrderType, example: OrderType.PRE_BOOK })
  @IsEnum(OrderType)
  order_type: OrderType;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  total_amount: number;

  @ApiProperty({ example: 'Delivery address', required: false })
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiProperty({ example: 12.9716, required: false })
  @IsOptional()
  @IsNumber()
  delivery_lat?: number;

  @ApiProperty({ example: 77.5946, required: false })
  @IsOptional()
  @IsNumber()
  delivery_lng?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  requires_cutting?: boolean;

  @ApiProperty({ example: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  special_instructions?: string;

  @ApiProperty({ example: '2023-12-25T10:00:00Z', required: false })
  @IsOptional()
  @IsString()
  scheduled_time?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}