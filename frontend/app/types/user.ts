export interface User {
  id: string;
  email: string;
  phone?: string;
  user_type: UserType;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  STAFF = 'staff',
  DELIVERY_PARTNER = 'delivery_partner',
  FRANCHISE_OWNER = 'franchise_owner',
  CUSTOMER = 'customer',
}