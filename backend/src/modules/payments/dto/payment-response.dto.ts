import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty({ required: false })
  gateway?: string;

  @ApiProperty({ required: false })
  error?: string;
}