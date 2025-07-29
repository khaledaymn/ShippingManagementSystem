export interface User {
  id: string
  username?: string
  email: string
  name?: string
  roleId: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface UserCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  id: string
  message: string
  token: string
  role: string
  permissions: {
    [moduleName: string]: string[]
  }
  email?: string
  name?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
  email: string
  token: string
}

export enum Role {
  ADMIN = "Admin",
  EMPLOYEE = "Employee",
  SALES_REPRESENTATIVE = "Sales Representative",
  MERCHANT = "Merchant",
  DELEGATE = "Delegate",
}
