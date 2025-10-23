import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserType } from 'src/common/enum/userType';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    enum: UserType, 
    example: UserType.CUSTOMER,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserType)
  user_type?: UserType;
}