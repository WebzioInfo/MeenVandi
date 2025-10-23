export interface Route {
  id: string;
  route_name: string;
  route_code: string;
  start_location: string;
  end_location: string;
  total_distance: number;
  estimated_time: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_order: number;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimated_arrival_time?: number;
  route?: Route;
}