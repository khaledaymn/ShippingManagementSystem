export interface BranchParams {
  search?: string
  location?: string
  cityId?: number
  isDeleted?: boolean
  sort?: string
  pageIndex: number
  pageSize: number
}

export interface Branch {
  id: number
  name: string
  creationDate: string
  isDeleted: boolean
  location: string
  cityName: string
}

export interface CreateBranch {
  name: string
  location: string
  cityId: number
}

export interface UpdateBranch {
  id: number
  name?: string
  location?: string
  cityId?: number
}

// Additional interfaces for form handling
export interface BranchFormData {
  name: string
  location: string
  cityId: number
}

export interface BranchValidationErrors {
  name?: string
  location?: string
  cityId?: string
}

