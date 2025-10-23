import { User } from "./user";

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export enum NotificationType {
  VEHICLE_UPDATE = 'vehicle_update',
  ORDER_UPDATE = 'order_update',
  PAYMENT_UPDATE = 'payment_update',
  SYSTEM_ALERT = 'system_alert',
  PROMOTIONAL = 'promotional',
}