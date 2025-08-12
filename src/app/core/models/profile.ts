export interface ChangePassword {
  oldPassword: string
  newPassword: string
  userId: string
}

export interface UserProfile {
  id: string
  name?: string
  userName?: string
  address?: string
  email?: string
  hireDate?: string
  phoneNumber?: string
  role?: string
}

export interface ProfileResponse {
  isSuccess: boolean
  message: string
  data?: any
}
