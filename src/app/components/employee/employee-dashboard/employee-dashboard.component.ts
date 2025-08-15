import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"

interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease"
  icon: string
  color: string
  description: string
}

interface ChartData {
  id: string
  title: string
  type: "bar" | "line" | "doughnut"
  data: number[]
  labels: string[]
  colors?: string[]
}

interface QuickAction {
  title: string
  description: string
  icon: string
  color: string
  route: string
}

@Component({
  selector: "app-employee-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./employee-dashboard.component.html",
  styleUrls: ["./employee-dashboard.component.css"],
})
export class EmployeeDashboardComponent implements OnInit {
  // Main Performance Metrics
  performanceMetrics: DashboardMetric[] = []

  // Order Status Cards
  orderStatusMetrics: DashboardMetric[] = []

  // Payment Type Cards
  paymentTypeMetrics: DashboardMetric[] = []

  // Charts
  monthlyPerformanceChart: ChartData | null = null
  orderStatusChart: ChartData | null = null

  // Enhanced chart properties
  lineChartPathArea = ""
  lineChartPathLine = ""
  animatedDataPoints: Array<{
    x: number
    y: number
    value: number
    month: number
    delay: number
  }> = []

  radialSegments: Array<{
    value: number
    label: string
    color: string
    percentage: number
    strokeDasharray: string
    strokeDashoffset: number
  }> = []

  // Quick Actions
  quickActions: QuickAction[] = []

  // Current date and time
  currentDateTime = new Date()

  // Chart interaction states
  hoveredDataPoint: number | null = null
  chartAnimationComplete = false

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadData()

    // Update time every minute
    setInterval(() => {
      this.currentDateTime = new Date()
    }, 60000)

    // Trigger chart animation after component loads
    setTimeout(() => {
      this.chartAnimationComplete = true
    }, 500)
  }

  private loadData(): void {
    const mockData = {
      // Main performance metrics
      assignedOrders: 47,
      completedOrders: 32,
      pendingOrders: 15,
      efficiencyRate: 94.2,
      changeAssigned: 5,
      changeCompleted: 8,
      changePending: -3,
      changeEfficiency: 2.1,

      // Order status distribution
      ordersByState: {
        New: 12,
        Pending: 15,
        "In Progress": 8,
        Delivered: 32,
        Cancelled: 3,
        "On Hold": 5,
        Returned: 2,
        Rejected: 1,
      },

      // Payment types
      ordersByPaymentType: {
        "Cash on Delivery": 35,
        "Credit Card": 28,
        "Bank Transfer": 12,
        "Digital Wallet": 3,
      },

      // Enhanced monthly performance with more detailed data
      monthlyPerformance: {
        1: { value: 85, trend: "up", target: 90 },
        2: { value: 92, trend: "up", target: 90 },
        3: { value: 88, trend: "down", target: 90 },
        4: { value: 95, trend: "up", target: 90 },
        5: { value: 91, trend: "down", target: 90 },
        6: { value: 97, trend: "up", target: 90 },
        7: { value: 89, trend: "down", target: 90 },
        8: { value: 94, trend: "up", target: 90 },
        9: { value: 96, trend: "up", target: 90 },
        10: { value: 93, trend: "down", target: 90 },
        11: { value: 98, trend: "up", target: 90 },
        12: { value: 94, trend: "down", target: 90 },
      },
    }

    // Transform data into metrics
    this.performanceMetrics = [
      {
        id: "assigned-orders",
        title: "Assigned Orders",
        value: mockData.assignedOrders,
        change: `+${mockData.changeAssigned}`,
        changeType: "increase",
        icon: "bi-clipboard-check",
        color: "#3b82f6",
        description: "Orders assigned to you today",
      },
      {
        id: "completed-orders",
        title: "Completed Orders",
        value: mockData.completedOrders,
        change: `+${mockData.changeCompleted}`,
        changeType: "increase",
        icon: "bi-check-circle",
        color: "#10b981",
        description: "Orders completed today",
      },
      {
        id: "pending-orders",
        title: "Pending Orders",
        value: mockData.pendingOrders,
        change: `${mockData.changePending}`,
        changeType: "decrease",
        icon: "bi-clock",
        color: "#f59e0b",
        description: "Orders awaiting processing",
      },
      {
        id: "efficiency-rate",
        title: "Efficiency Rate",
        value: `${mockData.efficiencyRate}%`,
        change: `+${mockData.changeEfficiency}%`,
        changeType: "increase",
        icon: "bi-speedometer2",
        color: "#8b5cf6",
        description: "Your processing efficiency",
      },
    ]

    // Order status metrics
    this.orderStatusMetrics = Object.entries(mockData.ordersByState).map(([status, count]) => ({
      id: status.toLowerCase().replace(" ", "-"),
      title: status,
      value: count,
      icon: this.getStatusIcon(status),
      color: this.getStatusColor(status),
      description: `${status} orders`,
    }))

    // Payment type metrics
    this.paymentTypeMetrics = Object.entries(mockData.ordersByPaymentType).map(([type, count]) => ({
      id: type.toLowerCase().replace(" ", "-"),
      title: type,
      value: count,
      icon: this.getPaymentIcon(type),
      color: this.getPaymentColor(type),
      description: `Orders paid via ${type}`,
    }))

    // Enhanced monthly performance chart
    const performanceValues = Object.values(mockData.monthlyPerformance).map((item) => item.value)
    const performanceLabels = Object.keys(mockData.monthlyPerformance)

    this.monthlyPerformanceChart = {
      id: "monthly-performance",
      title: "Monthly Performance Trend",
      type: "line",
      data: performanceValues,
      labels: performanceLabels,
      colors: ["#3b82f6", "#10b981", "#f59e0b"],
    }

    // Order status chart
    this.orderStatusChart = {
      id: "order-status-distribution",
      title: "Order Status Distribution",
      type: "doughnut",
      data: Object.values(mockData.ordersByState),
      labels: Object.keys(mockData.ordersByState),
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"],
    }

    // Quick actions
    this.quickActions = [
      {
        title: "View Orders",
        description: "Check your assigned orders",
        icon: "bi-list-check",
        color: "#3b82f6",
        route: "/employee/orders",
      },
      {
        title: "Add Order",
        description: "Create a new order",
        icon: "bi-plus-circle",
        color: "#10b981",
        route: "/employee/orders/create",
      },
    ]

    // Precompute enhanced chart paths and segments
    if (this.monthlyPerformanceChart) {
      this.lineChartPathArea = this.getEnhancedLineChartPath(this.monthlyPerformanceChart, true)
      this.lineChartPathLine = this.getEnhancedLineChartPath(this.monthlyPerformanceChart, false)
      this.animatedDataPoints = this.getAnimatedDataPoints(this.monthlyPerformanceChart)
    }
    if (this.orderStatusChart) {
      this.radialSegments = this.getRadialSegments(this.orderStatusChart)
    }
  }

  private getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      New: "bi-plus-circle",
      Pending: "bi-clock",
      "In Progress": "bi-arrow-clockwise",
      Delivered: "bi-check-circle",
      Cancelled: "bi-x-circle",
      "On Hold": "bi-pause-circle",
      Returned: "bi-arrow-return-left",
      Rejected: "bi-exclamation-circle",
    }
    return iconMap[status] || "bi-circle"
  }

  private getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      New: "#3b82f6",
      Pending: "#f59e0b",
      "In Progress": "#06b6d4",
      Delivered: "#10b981",
      Cancelled: "#ef4444",
      "On Hold": "#8b5cf6",
      Returned: "#f97316",
      Rejected: "#dc2626",
    }
    return colorMap[status] || "#6b7280"
  }

  private getPaymentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      "Cash on Delivery": "bi-cash",
      "Credit Card": "bi-credit-card",
      "Bank Transfer": "bi-bank",
      "Digital Wallet": "bi-wallet2",
    }
    return iconMap[type] || "bi-currency-dollar"
  }

  private getPaymentColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      "Cash on Delivery": "#10b981",
      "Credit Card": "#3b82f6",
      "Bank Transfer": "#8b5cf6",
      "Digital Wallet": "#f59e0b",
    }
    return colorMap[type] || "#6b7280"
  }

  onQuickAction(action: QuickAction): void {
    this.router.navigate([action.route])
  }

  getFormattedDateTime(): string {
    return this.currentDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  private getEnhancedLineChartPath(chart: ChartData | null, isArea: boolean): string {
    if (!chart || chart.type !== "line" || !chart.data || chart.data.length === 0) {
      return ""
    }

    const width = 280
    const height = 600
    const padding = 30
    const maxValue = 100
    const minValue = 80
    const range = maxValue - minValue
    const dataPoints = chart.data.length

    const points = chart.data.map((value, index) => {
      const x = padding + ((value - minValue) / range) * (width - 2 * padding)
      const y = padding + index * ((height - 2 * padding) / (dataPoints - 1))
      return `${x},${y}`
    })

    if (isArea) {
      const firstPoint = points[0].split(",")
      const lastPoint = points[points.length - 1].split(",")
      return `M ${padding},${height - padding} L ${firstPoint[0]},${firstPoint[1]} L ${points.join(" L ")} L ${lastPoint[0]},${height - padding} Z`
    }

    // Create smooth curve using quadratic bezier curves
    if (points.length < 2) return `M ${points.join(" L ")}`

    let path = `M ${points[0]}`
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1].split(",").map(Number)
      const [x2, y2] = points[i].split(",").map(Number)
      const cpx = (x1 + x2) / 2
      const cpy = (y1 + y2) / 2
      path += ` Q ${cpx},${y1} ${x2},${y2}`
    }
    return path
  }

  private getAnimatedDataPoints(chart: ChartData | null): Array<{
    x: number
    y: number
    value: number
    month: number
    delay: number
  }> {
    if (!chart || !chart.data || chart.data.length === 0) {
      return []
    }

    const width = 280
    const height = 600
    const padding = 30
    const maxValue = 100
    const minValue = 80
    const range = maxValue - minValue
    const dataPoints = chart.data.length

    return chart.data.map((value, index) => {
      const x = padding + ((value - minValue) / range) * (width - 2 * padding)
      const y = padding + index * ((height - 2 * padding) / (dataPoints - 1))
      return {
        x,
        y,
        value,
        month: index + 1,
        delay: index * 100,
      }
    })
  }

  getDoughnutSegments(chart: ChartData | null): Array<{
    value: number
    label: string
    color: string
    percentage: number
    offset: number
  }> {
    if (!chart || chart.type !== "doughnut" || !chart.data || !chart.labels) {
      return []
    }

    const total = chart.data.reduce((sum, value) => sum + value, 0)
    let cumulativePercentage = 0

    return chart.data.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const offset = cumulativePercentage
      cumulativePercentage += percentage

      return {
        value,
        label: chart.labels![index],
        color: chart.colors?.[index] || this.getDefaultColor(index),
        percentage,
        offset,
      }
    })
  }

  private getDefaultColor(index: number): string {
    const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]
    return defaultColors[index % defaultColors.length]
  }

  getChartMaxValue(chart: ChartData | null): number {
    if (!chart || !chart.data || chart.data.length === 0) {
      return 100
    }
    return Math.max(...chart.data)
  }

  getBarHeight(value: number, maxValue: number): number {
    return maxValue > 0 ? (value / maxValue) * 100 : 0
  }

  data() {
    return this.orderStatusChart?.data.reduce((a, b) => a + b, 0)
  }

  getLineChartPath(chart: ChartData | null, isArea: boolean): string {
    return this.getEnhancedLineChartPath(chart, isArea)
  }

  getRadialSegments(chart: ChartData | null): Array<{
    value: number
    label: string
    color: string
    percentage: number
    strokeDasharray: string
    strokeDashoffset: number
  }> {
    if (!chart || !chart.data || !chart.labels) {
      return []
    }

    const total = chart.data.reduce((sum, value) => sum + value, 0)
    const circumference = 2 * Math.PI * 120
    let cumulativePercentage = 0

    return chart.data.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const strokeLength = (percentage / 100) * circumference
      const offset = circumference - (cumulativePercentage / 100) * circumference
      cumulativePercentage += percentage

      return {
        value,
        label: chart.labels![index],
        color: chart.colors?.[index] || this.getDefaultColor(index),
        percentage,
        strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
        strokeDashoffset: offset,
      }
    })
  }

  onDataPointHover(index: number): void {
    this.hoveredDataPoint = index
  }

  onDataPointLeave(): void {
    this.hoveredDataPoint = null
  }

  getDataPointTooltip(point: any): string {
    return `Month ${point.month}: ${point.value}% Performance`
  }

  getPerformanceTrend(currentValue: number, previousValue: number): "up" | "down" | "stable" {
    if (currentValue > previousValue) return "up"
    if (currentValue < previousValue) return "down"
    return "stable"
  }

  getAveragePerformance(): number {
    if (!this.monthlyPerformanceChart?.data) return 0
    const sum = this.monthlyPerformanceChart.data.reduce((a, b) => a + b, 0)
    return Math.round((sum / this.monthlyPerformanceChart.data.length) * 10) / 10
  }

  getBestMonth(): { month: number; value: number } {
    if (!this.monthlyPerformanceChart?.data) return { month: 1, value: 0 }
    const maxValue = Math.max(...this.monthlyPerformanceChart.data)
    const maxIndex = this.monthlyPerformanceChart.data.indexOf(maxValue)
    return { month: maxIndex + 1, value: maxValue }
  }
}
