export interface ShippingRepresentative {
  id: string
  name: string
  email: string
  phoneNumber: string
  address: string
  discountType: DiscountType
  companyPercentage: number
  hiringDate: Date
  governorates: string[],
  isDeleted: boolean
}

export enum DiscountType {
  Fixed = 0,
  Percentage = 1,
}

export interface CreateShippingRepresentative {
  name: string
  email: string
  phoneNumber: string
  password: string
  discountType: DiscountType
  companyPercentage: number
  address: string
  governorateIds: number[]
}

export interface UpdateShippingRepresentative {
  id: string
  name?: string
  email?: string
  phoneNumber?: string
  address?: string
  discountType?: DiscountType
  companyPercentage?: number
  governorateIds?: number[]
}

export interface ShippingRepresentativeQueryParams {
  pageIndex: number
  pageSize: number
  search?: string
  branch?: string
  isActive?: boolean
  sort?: string
  governorateId?: number
}
