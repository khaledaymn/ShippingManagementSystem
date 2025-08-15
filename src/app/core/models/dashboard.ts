export interface DashboardSummary {
  // Daily Statistics from stats-grid
  assignedOrders: number // Total orders assigned to the user
  completedOrders: number // Orders with state "Delivered"
  pendingOrders: number // Sum of states like "Pendding", "DeliveredToTheRepresentative", etc.
  efficiencyRate: number // Percentage of completed orders
  changeAssigned: number // Change in Assigned Orders (e.g., +5)
  changeCompleted: number // Change in Completed Orders (e.g., +8)
  changePending: number // Change in Pending Orders (e.g., -3)
  changeEfficiency: number // Change in Efficiency Rate (e.g., +2.1%)

  // Financial and General Stats
  totalOrders: number // Total orders from the service
  totalRevenue: number // Sum of AmountReceived
  netRevenue: number // TotalRevenue - ChargePrice
  averageWeight: number // Average TotalWeight
  averageChargePrice: number // Average ChargePrice
  totalSpecialPrice: number // Sum of MerchantSpecialPrice

  // Order States Distribution (for table and donut chart)
  ordersByState: { [key: string]: number }

  // Payment Types Distribution (for table)
  ordersByPaymentType: { [key: string]: number }

  // Monthly Performance (replacing DailyPerformance)
  monthlyPerformance: { [key: string]: number }

  // Order Status Distribution (for donut chart - simplified total)
  orderStatusDistributionTotal: number // Total for donut chart (e.g., 57)
}

export interface DashboardMetric {
  id?: string
  title: string
  value: string | number
  change?: number | string
  changeType?: "increase" | "decrease" | "neutral"
  icon: string
  color: string
  description?: string
  trend?: number[]
  target?: number
}

export interface ChartData {
  id?: string
  type: "line" | "bar" | "doughnut" | "area"
  data: any
  options?: any
  title?: string
  labels?: string[]
  color?: string
  isLoading?: boolean
  lastUpdated?: Date
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
  timestamp?: Date
  type: string | "order" | "user" | "system" | "notification"
  icon: string
}

export interface DashboardConfig {
  title?: string
  subtitle?: string
  metrics: DashboardMetric[]
  charts: ChartData[]
  quickActions: QuickAction[]
  activities: Activity[]
  recentActivities?: Activity[]
  refreshInterval?: number
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number
  compactView: boolean
  showAnimations: boolean
  theme: "light" | "dark" | "auto"
}
