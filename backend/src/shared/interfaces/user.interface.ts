import { UserType } from "src/common/enum/userType";

export interface IUser {
  id: string;
  email: string;
  phone?: string;
  role: UserType;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

