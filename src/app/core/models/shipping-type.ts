export interface ShippingType {
  id: number
  name: string
  extraPrice: number
  numOfDay: number
  isDeleted: boolean
}

export interface CreateShippingType {
  name: string
  extraPrice: number
  numOfDay: number
}

export interface ShippingTypeParams {
  search?: string
  minPrice?: number
  maxPrice?: number
  minDays?: number
  maxDays?: number
  isDeleted?: boolean
  sort?: string
  pageIndex: number
  pageSize: number
}

