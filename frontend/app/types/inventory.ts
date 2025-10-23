import { Vehicle } from "./vehicle";

export interface Inventory {
  id: string;
  vehicle_id: string;
  fish_type: string;
  quantity: number;
  unit_price: number;
  unit: string;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
}