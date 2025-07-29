export interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease" | "neutral"
  icon: string
  color: "blue" | "green" | "red" | "yellow" | "purple" | "indigo"
  description?: string
}

export interface ChartData {
  id: string
  title: string
  type: "line" | "bar" | "doughnut" | "area"
  data: any[]
  labels: string[]
  color: string
}

export interface DashboardConfig {
  title: string
  subtitle: string
  metrics: DashboardMetric[]
  charts: ChartData[]
  quickActions: QuickAction[]
  recentActivities: Activity[]
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  url: string
}

export interface Activity {
  id: string
  title: string
  description: string
  time: string
  type: "success" | "warning" | "info" | "error"
  icon: string
}

export type UserRole = "admin" | "employee" | "delegate" | "merchant"
