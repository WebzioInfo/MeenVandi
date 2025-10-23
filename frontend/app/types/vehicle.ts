import { Inventory } from "./inventory";
import { Order } from "./order";
import { Stop } from "./stop";

export interface Vehicle {
  id: string;
  name: string;
  number_plate: string;
  vehicle_type: VehicleType;
  status: VehicleStatus;
  current_lat: number;
  current_lng: number;
  battery_level: number;
  is_sound_enabled: boolean;
  current_route_id?: string;
  created_at: string;
  updated_at: string;
  stops?: Stop[];
  orders?: Order[];
  inventory?: Inventory[];
}

export enum VehicleType {
  GOODS_APE = 'goods_ape',
  BIKE = 'bike',
}

export enum VehicleStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ON_ROUTE = 'on_route',
  AT_SPOT = 'at_spot',
  MAINTENANCE = 'maintenance',
}