import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class RouteStopDto {
  @ApiProperty({ example: 'Stop Name' })
  @IsString()
  location_name: string;

  @ApiProperty({ example: 'Full address of the stop' })
  @IsString()
  address: string;

  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  estimated_arrival_time?: number;
}

export class CreateRouteDto {
  @ApiProperty({ example: 'Morning Route' })
  @IsString()
  route_name: string;

  @ApiProperty({ example: 'MR001' })
  @IsString()
  route_code: string;

  @ApiProperty({ example: 'Start Location' })
  @IsString()
  start_location: string;

  @ApiProperty({ example: 'End Location' })
  @IsString()
  end_location: string;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  total_distance: number;

  @ApiProperty({ example: 120 })
  @IsNumber()
  estimated_time: number;

  @ApiProperty({ type: [RouteStopDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}