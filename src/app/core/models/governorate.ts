export interface Governorate {
  id: number
  name: string
  isDeleted?: boolean
}

export interface GovernorateParams {
  search?: string
  isDeleted?: boolean
  sort?: string
  pageIndex: number
  pageSize: number
}

export interface CreateGovernorate {
  name: string
}

export interface UpdateGovernorate {
  id: number
  name: string
}
