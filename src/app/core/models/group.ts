// export interface GroupParams {
//   search?: string
//   userId?: string
//   fromDate?: string
//   toDate?: string
//   sort?: string
//   pageIndex: number
//   pageSize: number
// }

// export interface Group {
//   id: number
//   name?: string
//   creationDate?: string
//   permissions: Permission[];
// }

// export interface Permission {
//   id: number
//   values: number[]
// }

// export interface CreateGroup {
//   name: string
//   permissions: Permission[]
// }

// export interface UpdateGroup {
//   id: number
//   name?: string
//   permissions?: Permission[]
// }

// // Additional interfaces for the permission system
// export interface Module {
//   id: number
//   name: string
//   permissions: ModulePermission
// }

// export interface ModulePermission {
//   view: boolean
//   create: boolean
//   update: boolean
//   delete: boolean
// }

// export interface PermissionValue {
//   VIEW: number
//   CREATE: number
//   UPDATE: number
//   DELETE: number
// }

export interface GroupParams {
  search?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
  pageIndex: number;
  pageSize: number;
}

export interface Group {
  id: number;
  name?: string;
  creationDate?: string;
  permissions: { [key: string]: number[] }; // Updated to match backend format
}

export interface CreateGroup {
  name: string;
  permissions: { id:number,values: number[] }[]; // Updated
}

export interface UpdateGroup {
  id: number;
  name?: string;
  permissions?: { id:number,values: number[] }[]; // Updated
}

export interface Module {
  id: number;
  name: string;
  permissions: ModulePermission;
}

export interface ModulePermission {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionValue {
  VIEW: number;
  CREATE: number;
  UPDATE: number;
  DELETE: number;
}

export interface MeduleParams {
  search?: string;
  userId?: string;
  sort?: string;
  pageIndex: number;
  pageSize: number;
}

export interface Medule {
  id: number;
  name: string;
}
