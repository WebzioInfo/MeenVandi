import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TrackingGateway } from './gateways/tracking.gateway';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // Uses same secret from app.config
    TypeOrmModule.forFeature([Vehicle]),
    VehiclesModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingGateway, TrackingService],
  exports: [TrackingGateway, TrackingService],
})
export class TrackingModule {}
