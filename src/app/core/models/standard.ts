export interface Standard {
  id: number
  standardWeight: number
  villagePrice: number
  kGprice: number
  isDeleted: boolean
}

export interface UpdateStandard {
  standardWeight?: number
  villagePrice?: number
  kgPrice?: number
}

