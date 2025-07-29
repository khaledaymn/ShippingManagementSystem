import { Branch } from "./branch"

export interface Employee {
  id: string
  name:string
  email: string
  branches: Branch[] // Assuming branch is a string name or ID
  isDeleted: boolean
  creationDate: Date
  permission:string
  phoneNumber:string
  address: string
  groupId: number
}

export interface AddEmployee {
 name: string
  email: string
  phoneNumber: string
  address:string
  branchIds: number[]
  groupId: number
  password: string
}

export interface UpdateEmployee {
  id: string
  name?:string
  email?: string
  branchIds?: number[]
  phoneNumber?: string
  address: string
  groupId: number
}

export interface EmployeeParams {
  pageIndex: number
  pageSize: number
  search?: string
  branch?: string // Filter by branch name or ID
  isActive?: boolean
  sort?: string // e.g., 'firstName asc', 'createdAt desc'
}
