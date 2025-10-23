import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum PaymentMethod {
  CASH = 'cash',
  UPI = 'upi',
  CARD = 'card',
  WALLET = 'wallet',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'order-uuid' })
  @IsString()
  order_id: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  currency: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: { upi_id: 'user@upi' }, required: false })
  @IsOptional()
  @IsObject()
  payment_details?: any;
}