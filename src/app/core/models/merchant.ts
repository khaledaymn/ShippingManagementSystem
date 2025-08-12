import { Branch } from "./branch"

export interface Merchant {
  id: string
  name: string
  address: string
  isDeleted: boolean
  startWorkDate?: Date
  email: string
  specialPickup?: number
  phoneNumber: string
  storeName: string
  rejectedOrderPercent: number
  branches: Branch[]
  specialDeliveryPrices?: SpecialDeliveryPrice[]
}


export interface SpecialDeliveryPrice {
  cityId: number
  cityName?: string
  specialPrice: number
}

export interface CreateMerchant {
  address: string
  name: string
  email: string
  phoneNumber: string
  password: string
  storeName: string
  rejectedOrderPercent: number
  specialPickup?: number
  branchIds?: number[]
  specialDeliveryPrices?: SpecialDeliveryPrice[]
}

export interface UpdateMerchant {
  id: string
  address?: string
  name?: string
  email?: string
  phoneNumber?: string
  storeName?: string
  rejectedOrderPercent?: number
  specialPickup?: number
  branchIds?: number[]
  specialDeliveryPrices?: SpecialDeliveryPrice[]
}

export interface MerchantQueryParams {
  search?: string
  isActive?: boolean
  sort?: string
  pageIndex: number
  pageSize: number
}
