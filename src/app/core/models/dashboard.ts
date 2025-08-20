export interface DashboardSummary {
  // Core Statistics
  totalOrders: number
  assignedOrders: number
  completedOrders: number
  pendingOrders: number
  efficiencyRate: number

  // Change Indicators (compared to previous month)
  changeAssigned: number
  changeCompleted: number
  changePending: number
  changeEfficiency: number

  // Financial Metrics
  totalRevenue: number
  averageWeight: number
  averageChargePrice: number

  // Order Distribution
  ordersByState: { [key: string]: number }
  ordersByPaymentType: { [key: string]: number }

  // Monthly Performance Data
  monthlyPerformance: { [key: string]: MonthlyPerformanceData }

  // Total for charts
  orderStatusDistributionTotal: number
}

export interface MonthlyPerformanceData {
  value: number
  trend: "up" | "down" | "neutral"
  target: number
}

export interface DashboardMetric {
  title: string
  value: string | number
  change?: number
  changeType?: "increase" | "decrease" | "neutral"
  icon: string
  color: string
  description?: string
}

export interface ChartData {
  type: "line" | "bar" | "doughnut" | "area"
  data: any
  options?: any
  title?: string
}

export interface QuickAction {
  title: string
  icon: string
  route: string
  color: string
  description?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "order" | "user" | "system" | "notification"
  icon: string
}

export interface DashboardConfig {
  metrics: DashboardMetric[]
  charts: ChartData[]
  quickActions: QuickAction[]
  activities: Activity[]
}
