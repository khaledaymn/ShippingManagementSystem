export interface ChangePassword {
  oldPassword: string
  newPassword: string
  userId: string
}

// export interface UserProfile {
//   id: string
//   name?: string
//   userName?: string
//   address?: string
//   email?: string
//   hireDate?: string
//   phoneNumber?: string
//   role?: string
// }

export interface UserProfile {
  id: string;
  name?: string;
  userName?: string;
  address?: string;
  email?: string;
  hireDate?: string;
  phoneNumber?: string;
  role?: string;
  // Employee-specific fields
  permissions?: { [key: string]: string[] };
  // Merchant-specific fields
  specialPrices?: { specialPrice: number; name: string }[];
  specialPickUp?: boolean;
  rejectedOrederPercentage?: number;
  storeName?: string;
  // ShippingRepresentative-specific fields
  companyPersentage?: string;
  governorates?: string[];
}

export interface ProfileResponse {
  isSuccess: boolean
  message: string
  data?: any
}
