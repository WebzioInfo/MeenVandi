import { Vehicle } from "./vehicle";

export interface Stop {
  id: string;
  vehicle_id: string;
  location_name: string;
  address: string;
  lat: number;
  lng: number;
  type: StopType;
  status: StopStatus;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
}

export enum StopType {
  FIXED = 'fixed',
  USER_REQUEST = 'user_request',
  SELLING_SPOT = 'selling_spot',
}

export enum StopStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}