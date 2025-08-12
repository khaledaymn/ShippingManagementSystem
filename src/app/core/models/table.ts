export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  type?: "text" | "number" | "date" | "boolean" | "currency" | "badge" | "action"
  width?: string
  align?: "left" | "center" | "right"
  format?: (value: any) => string
}

export interface TableAction {
  label: string
  icon: string
  action: string
  color?: "primary" | "secondary" | "danger" | "warning" | "success" | "info"
  disabled?: (item: any) => boolean
  visible?: (item: any) => boolean
}

export interface TableFilter {
  key: string
  label: string
  type: "text" | "number" | "select" | "date" | "boolean"
  options?: { value: any; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

export interface TableSort {
  column: string
  direction: "asc" | "desc"
}

export interface TableConfig {
  columns: TableColumn[]
  actions?: TableAction[]
  filters?: TableFilter[]
  searchable?: boolean
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  showHeader?: boolean
  showFooter?: boolean
  title?: string
}

export interface TableData<T = any> {
  items: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
}

export interface TableEvent {
  type: "sort" | "filter" | "search" | "page" | "action" | "select" | "update"
  data: any
}
