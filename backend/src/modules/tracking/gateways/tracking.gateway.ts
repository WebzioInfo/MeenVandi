import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { VehicleStatus } from 'src/common/enum/vehicle';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private connectedClients: Map<string, Socket> = new Map();
  private vehicleRooms: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService, private vehiclesService: VehiclesService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      this.connectedClients.set(client.id, client);
      this.logger.log(`Client connected: ${client.id}, User: ${payload.email}`);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);

    this.vehicleRooms.forEach((clients, vehicleId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.vehicleRooms.delete(vehicleId);
      }
    });

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('track-vehicle')
  handleTrackVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { vehicle_id: string },
  ) {
    const { vehicle_id } = payload;
    client.join(`vehicle_${vehicle_id}`);

    if (!this.vehicleRooms.has(vehicle_id)) {
      this.vehicleRooms.set(vehicle_id, new Set());
    }
    this.vehicleRooms.get(vehicle_id)?.add(client.id);

    this.logger.log(`Client ${client.id} tracking vehicle ${vehicle_id}`);
  }

  @SubscribeMessage('update-location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { vehicle_id: string; lat: number; lng: number; status: string; battery_level?: number },
  ) {
    try {
      await this.vehiclesService.updateLocation(payload.vehicle_id, {
        lat: payload.lat,
        lng: payload.lng,
        status: payload.status as VehicleStatus,
        battery_level: payload.battery_level || 100,
      });

      this.server.to(`vehicle_${payload.vehicle_id}`).emit('location-updated', {
        ...payload,
        timestamp: new Date(),
      });

      this.server.emit('vehicle-location-updated', {
        ...payload,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error updating location:', error);
      client.emit('error', { message: 'Failed to update location' });
    }
  }

  @SubscribeMessage('stop-tracking')
  handleStopTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { vehicle_id: string },
  ) {
    client.leave(`vehicle_${payload.vehicle_id}`);

    if (this.vehicleRooms.has(payload.vehicle_id)) {
      this.vehicleRooms.get(payload.vehicle_id)?.delete(client.id);
    }

    this.logger.log(`Client ${client.id} stopped tracking vehicle ${payload.vehicle_id}`);
  }

  broadcastLocationUpdate(payload: any) {
    this.server.to(`vehicle_${payload.vehicle_id}`).emit('location-updated', payload);
    this.server.emit('vehicle-location-updated', payload);
  }

  getVehicleTrackersCount(vehicleId: string): number {
    return this.vehicleRooms.get(vehicleId)?.size || 0;
  }
}
