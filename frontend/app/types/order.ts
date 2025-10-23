import { Payment, PaymentStatus } from "./payment";
import { User } from "./user";
import { Vehicle } from "./vehicle";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  vehicle_id?: string;
  order_type: OrderType;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  requires_cutting: boolean;
  special_instructions?: string;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  vehicle?: Vehicle;
  items: OrderItem[];
  payments: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  fish_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_cut: boolean;
}

export enum OrderType {
  PRE_BOOK = 'pre_book',
  ON_THE_SPOT = 'on_the_spot',
  DOORSTEP = 'doorstep',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

