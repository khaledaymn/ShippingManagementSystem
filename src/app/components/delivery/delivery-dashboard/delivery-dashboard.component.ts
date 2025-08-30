import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { DashboardService } from "../../../core/services/dashboard.service"
import { DashboardSummary, Activity, DashboardConfig, DashboardMetric } from "../../../core/models/dashboard"
import { Subject, takeUntil, interval } from "rxjs"
import { MetricGridComponent } from "../../../shared/metric-grid/metric-grid.component"
import { ChartComponent, ChartData } from "../../../shared/chart/chart.component"
import { QuickActionsComponent, QuickAction } from "../../../shared/quick-actions/quick-actions.component"
import { DashboardHeaderComponent } from "../../../shared/dashboard-header/dashboard-header.component"
import { AuthService } from "../../../core/services/auth.service"

interface Notification {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface FilterOption {
  label: string
  value: string
  active: boolean
}

@Component({
  selector: "app-delivery-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MetricGridComponent,
    ChartComponent,
    QuickActionsComponent,
    DashboardHeaderComponent,
  ],
  templateUrl: "./delivery-dashboard.component.html",
  styleUrls: ["./delivery-dashboard.component.css"],
})
export class deliveryDashboardComponent implements OnInit, OnDestroy {
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>

  private destroy$ = new Subject<void>()

  dashboardSummary: DashboardSummary | null = null
  dashboardConfig: DashboardConfig | null = null

  performanceMetrics: DashboardMetric[] = []

  orderStatusMetrics: DashboardMetric[] = []

  paymentTypeMetrics: DashboardMetric[] = []

  monthlyPerformanceChart: ChartData | null = null
  orderStatusChart: ChartData | null = null

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

  quickActions: QuickAction[] = []

  recentActivities: Activity[] = []

  notifications: Notification[] = []
  unreadNotifications = 0
  showNotifications = false

  searchQuery = ""
  filterOptions: FilterOption[] = [
    { label: "All Orders", value: "all", active: true },
    { label: "Pending", value: "pending", active: false },
    { label: "In Progress", value: "in-progress", active: false },
    { label: "Completed", value: "completed", active: false },
  ]
  activeFilter = "all"

  currentDateTime = new Date()

  hoveredDataPoint: number | null = null
  chartAnimationComplete = false
  selectedMetric: string | null = null

  loading = false
  error: string | null = null
  refreshing = false
  lastUpdated: Date | null = null

  viewMode: "grid" | "list" | "compact" = "grid"
  showAdvancedMetrics = false

  exportInProgress = false

  totalOrdersToday = 0
  completionRate = 0
  averageProcessingTime = 0
  topPerformingMonth = ""

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData()
    this.setupRealTimeUpdates()
    this.initializeNotifications()

    interval(6000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentDateTime = new Date()
      })

    setTimeout(() => {
      this.chartAnimationComplete = true
    }, 500)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setupRealTimeUpdates(): void {
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshData()
      })
  }

  private initializeNotifications(): void {
    this.notifications = [
      {
        id: "1",
        type: "info",
        title: "New Order Assigned",
        message: "You have been assigned 3 new orders for processing.",
        timestamp: new Date(),
        read: false,
      },
      {
        id: "2",
        type: "success",
        title: "Target Achieved",
        message: "Congratulations! You have achieved your daily target.",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
    ]
    this.updateNotificationCount()
  }

  private loadData(): void {
    this.loading = true
    this.error = null

    const userId = this.getCurrentUserId()
    console.log(userId);

    this.dashboardService
      .getDashboardSummary(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardSummary) => {

          this.dashboardSummary = data
          this.transformServiceDataToMetrics(data)
          this.computeDashboardStatistics(data)
          this.generateRecentActivities(data)
          this.lastUpdated = new Date()
          this.loading = false

          this.addNotification(
            "success",
            "Dashboard Updated",
            `Loaded ${data.totalOrders} orders with ${data.efficiencyRate}% efficiency rate.`,
          )
        },
        error: (error) => {
          console.error("Failed to load dashboard data:", error)
          this.error = "Failed to load dashboard data. Please try again."
          this.loading = false
          this.addNotification("error", "Data Load Failed", "Unable to load dashboard data. Please refresh the page.")
        },
      })
  }

  refreshData(): void {
    this.refreshing = true
    const userId = this.getCurrentUserId()

    this.dashboardService
      .getDashboardSummary(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardSummary) => {
          this.dashboardSummary = data
          this.transformServiceDataToMetrics(data)
          this.computeDashboardStatistics(data)
          this.generateRecentActivities(data)
          this.lastUpdated = new Date()
          this.refreshing = false
          this.addNotification("success", "Data Refreshed", "Dashboard data has been updated successfully.")
        },
        error: (error) => {
          console.error("Failed to refresh dashboard data:", error)
          this.refreshing = false
          this.addNotification("error", "Refresh Failed", "Unable to refresh dashboard data.")
        },
      })
  }

  formatStatusTitle(status: string): string {
    switch (status) {
      case "New":
        return "New Orders"
      case "Pendding":
        return "Pending Orders"
      case "DeliveredToTheRepresentative":
        return "Delivered to Representative"
      case "Delivered":
        return "Delivered Orders"
      case "CannotBeReached":
        return "Cannot Be Reached"
      case "PostPoned":
        return "Postponed Orders"
      case "PartiallyDelivered":
        return "Partially Delivered"
      case "CanceledByCustomer":
        return "Canceled by Customer"
      case "RejectedWithPayment":
        return "Rejected with Payment"
      case "RejectedWithPartialPayment":
        return "Rejected with Partial Payment"
      case "RejectedWithoutPayment":
        return "Rejected without Payment"
      default:
        return status
    }
  }

  private formatPaymentTitle(type: string): string {
    switch (type) {
      case "CashOnDelivery":
        return "Cash on Delivery"
      case "PaidInAdvance":
        return "Paid in Advance"
      case "ExchangeOrder":
        return "Exchange Order"
      default:
        return type
    }
  }

  private transformServiceDataToMetrics(data: DashboardSummary): void {
    this.performanceMetrics = [
      {
        title: "Assigned Orders",
        value: data.assignedOrders,
        change: data.changeAssigned,
        changeType: (data.changeAssigned || 0) >= 0 ? "increase" : "decrease",
        icon: "bi-clipboard-check",
        color: "#3b82f6",
        description: "Orders assigned to you today",
      },
      {
        title: "Completed Orders",
        value: data.completedOrders,
        change: data.changeCompleted,
        changeType: (data.changeCompleted || 0) >= 0 ? "increase" : "decrease",
        icon: "bi-check-circle",
        color: "#10b981",
        description: "Orders completed today",
      },
      {
        title: "Pending Orders",
        value: data.pendingOrders,
        change: data.changePending,
        changeType: (data.changePending || 0) >= 0 ? "increase" : "decrease",
        icon: "bi-clock",
        color: "#f59e0b",
        description: "Orders awaiting processing",
      },
      {
        title: "Efficiency Rate",
        value: `${data.efficiencyRate}%`,
        change: data.changeEfficiency,
        changeType: (data.changeEfficiency || 0) >= 0 ? "increase" : "decrease",
        icon: "bi-speedometer2",
        color: "#8b5cf6",
        description: "Your processing efficiency",
      },
    ]

    this.orderStatusMetrics = Object.entries(data.ordersByState || {}).map(([status, count]) => ({
      title: this.formatStatusTitle(status),
      value: count,
      icon: this.getStatusIcon(status),
      color: this.getStatusColor(status),
      description: `${status} orders`,
    }))

    this.paymentTypeMetrics = Object.entries(data.ordersByPaymentType || {}).map(([type, count]) => ({
      title: this.formatPaymentTitle(type),
      value: count,
      icon: this.getPaymentIcon(type),
      color: this.getPaymentColor(type),
      description: `Orders paid via ${type}`,
    }))

    // Extract values from MonthlyPerformanceData objects for chart display
    const performanceValues = Object.values(data.monthlyPerformance || {}).map((perfData) => perfData.value)
    const performanceLabels = Object.keys(data.monthlyPerformance || {})

    this.monthlyPerformanceChart = {
      type: "line",
      data: {
        labels: performanceLabels,
        datasets: [
          {
            label: "Monthly Performance",
            data: performanceValues,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
      title: "Monthly Performance Trend",
    }

    const statusLabels = Object.keys(data.ordersByState || {})
    const statusValues = Object.values(data.ordersByState || {})
    const statusColors = [
      "#3b82f6",
      "#f59e0b",
      "#06b6d4",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#84cc16",
      "#f97316",
      "#9f1239",
      "#be123c",
      "#e11d48",
    ]

    this.orderStatusChart = {
      type: "doughnut",
      data: {
        labels: statusLabels,
        values: statusValues,
        colors: statusColors,
        datasets: [
          {
            data: statusValues,
            backgroundColor: statusColors,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true },
        },
      },
      title: "Order Status Distribution",
    }

    this.quickActions = [
      {
        title: "View Orders",
        icon: "bi-list-check",
        route: "/delivery/orders",
        color: "#3b82f6",
        description: "Check your assigned orders",
      },
      {
        title: "Reports",
        icon: "bi-graph-up",
        route: "/delivery/reports",
        color: "#8b5cf6",
        description: "View performance reports",
      },
    ]

    if (this.monthlyPerformanceChart) {
      this.lineChartPathArea = this.getEnhancedLineChartPath(this.monthlyPerformanceChart, true)
      this.lineChartPathLine = this.getEnhancedLineChartPath(this.monthlyPerformanceChart, false)
      this.animatedDataPoints = this.getAnimatedDataPoints(this.monthlyPerformanceChart)
    }
    if (this.orderStatusChart) {
      this.radialSegments = this.getRadialSegments(this.orderStatusChart)
    }
  }

  private computeDashboardStatistics(data: DashboardSummary): void {
    this.totalOrdersToday = data.assignedOrders + data.completedOrders + data.pendingOrders
    this.completionRate = data.totalOrders > 0 ? (data.completedOrders / data.totalOrders) * 100 : 0
    this.averageProcessingTime = data.averageWeight || 0

    const monthlyData = data.monthlyPerformance || {}

    // Extract values from MonthlyPerformanceData objects
    const performanceEntries = Object.entries(monthlyData)
    if (performanceEntries.length > 0) {
      const performanceValues = performanceEntries.map(([month, perfData]) => perfData.value)
      const maxPerformance = Math.max(...performanceValues)
      const maxEntry = performanceEntries.find(([month, perfData]) => perfData.value === maxPerformance)
      this.topPerformingMonth = maxEntry ? maxEntry[0] : "N/A"
    } else {
      this.topPerformingMonth = "N/A"
    }
  }

  private generateRecentActivities(data: DashboardSummary): void {
    this.recentActivities = [
      {
        id: "1",
        title: "Orders Processed",
        description: `Completed ${data.completedOrders} orders today`,
        timestamp: new Date(),
        type: "order",
        icon: "bi-check-circle",
      },
      {
        id: "2",
        title: "Efficiency Update",
        description: `Current efficiency rate: ${data.efficiencyRate}%`,
        timestamp: new Date(Date.now() - 1800000),
        type: "system",
        icon: "bi-speedometer2",
      },
      {
        id: "3",
        title: "Revenue Generated",
        description: `Total revenue: $${data.totalRevenue.toLocaleString()}`,
        timestamp: new Date(Date.now() - 3600000),
        type: "system",
        icon: "bi-currency-dollar",
      },
    ]
  }

  private getCurrentUserId(): string | undefined {
    let userId = undefined
    this.authService.currentUser$.subscribe(
      (id) => userId = id?.id
    )
    return userId
  }

  private getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      New: "bi-plus-circle",
      Pendding: "bi-clock",
      DeliveredToTheRepresentative: "bi-truck", 
      Delivered: "bi-check-circle",
      CannotBeReached: "bi-telephone-x",
      PostPoned: "bi-calendar-x",
      PartiallyDelivered: "bi-box-seam",
      CanceledByCustomer: "bi-x-circle",
      RejectedWithPayment: "bi-x-octagon",
      RejectedWithPartialPayment: "bi-x-octagon-fill",
      RejectedWithoutPayment: "bi-x-square",
    }
    return iconMap[status] || "bi-circle"
  }

  private getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      New: "#3b82f6",
      Pendding: "#f59e0b",
      DeliveredToTheRepresentative: "#06b6d4",
      Delivered: "#10b981",
      CannotBeReached: "#ef4444",
      PostPoned: "#8b5cf6",
      PartiallyDelivered: "#f97316",
      CanceledByCustomer: "#dc2626",
      RejectedWithPayment: "#9f1239",
      RejectedWithPartialPayment: "#be123c",
      RejectedWithoutPayment: "#e11d48",
    }
    return colorMap[status] || "#6b7280"
  }

  private getPaymentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      CashOnDelivery: "bi-cash",
      PaidInAdvance: "bi-credit-card",
      ExchangeOrder: "bi-arrow-repeat",
    }
    return iconMap[type] || "bi-currency-dollar"
  }

  private getPaymentColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      CashOnDelivery: "#10b981",
      PaidInAdvance: "#3b82f6",
      ExchangeOrder: "#8b5cf6",
    }
    return colorMap[type] || "#6b7280"
  }

  addNotification(type: Notification["type"], title: string, message: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    }
    this.notifications.unshift(notification)
    this.updateNotificationCount()

    if (type === "success") {
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 5000)
    }
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.updateNotificationCount()
  }

  markNotificationAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.updateNotificationCount()
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => (n.read = true))
    this.updateNotificationCount()
  }

  private updateNotificationCount(): void {
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications
  }

  onSearchChange(): void {
    if (this.searchQuery.trim()) {
      console.log("Searching dashboard data for:", this.searchQuery)
    }
  }

  onFilterChange(filter: FilterOption): void {
    this.filterOptions.forEach((f) => (f.active = false))
    filter.active = true
    this.activeFilter = filter.value
    console.log("Filtering dashboard by:", this.activeFilter)
  }

  clearSearch(): void {
    this.searchQuery = ""
    this.onSearchChange()
  }

  setViewMode(mode: "grid" | "list" | "compact"): void {
    this.viewMode = mode
  }

  toggleAdvancedMetrics(): void {
    this.showAdvancedMetrics = !this.showAdvancedMetrics
  }

  selectMetric(metricId: string): void {
    this.selectedMetric = this.selectedMetric === metricId ? null : metricId
  }

  async exportDashboardData(format: "csv" | "pdf" | "excel"): Promise<void> {
    this.exportInProgress = true
    try {
      const exportData = {
        summary: this.dashboardSummary,
        metrics: this.performanceMetrics,
        activities: this.recentActivities,
        exportDate: new Date().toISOString(),
        format: format,
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Exporting dashboard data:", exportData)

      this.addNotification(
        "success",
        "Export Complete",
        `Dashboard data exported as ${format.toUpperCase()} with ${this.totalOrdersToday} orders.`,
      )
    } catch (error) {
      this.addNotification("error", "Export Failed", "Unable to export dashboard data.")
    } finally {
      this.exportInProgress = false
    }
  }

  // Quick action method now handled by shared component
  onQuickAction(action: QuickAction): void {
    console.log(`Quick action used: ${action.title}`, {
      currentMetrics: this.performanceMetrics,
      totalOrders: this.totalOrdersToday,
    })

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

  getRelativeTime(date: Date): string {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  private getEnhancedLineChartPath(chart: ChartData | null, isArea: boolean): string {
    if (!chart || chart.type !== "line" || !chart.data?.datasets?.[0]?.data) {
      return ""
    }

    const data = chart.data.datasets[0].data as number[]
    const width = 280
    const height = 600
    const padding = 30
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    const dataPoints = data.length

    const points = data.map((value, index) => {
      const x = padding + ((value - minValue) / range) * (width - 2 * padding)
      const y = padding + index * ((height - 2 * padding) / (dataPoints - 1))
      return `${x},${y}`
    })

    if (isArea) {
      const firstPoint = points[0].split(",")
      const lastPoint = points[points.length - 1].split(",")
      return `M ${padding},${height - padding} L ${firstPoint[0]},${firstPoint[1]} L ${points.join(" L ")} L ${lastPoint[0]},${height - padding} Z`
    }

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
    if (!chart || !chart.data?.datasets?.[0]?.data) {
      return []
    }

    const data = chart.data.datasets[0].data as number[]
    const width = 280
    const height = 600
    const padding = 30
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    const dataPoints = data.length

    return data.map((value, index) => {
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
    if (!chart || chart.type !== "doughnut" || !chart.data?.datasets?.[0]?.data || !chart.data?.labels) {
      return []
    }

    const data = chart.data.datasets[0].data as number[]
    const labels = chart.data.labels as string[]
    const colors = chart.data.datasets[0].backgroundColor as string[]
    const total = data.reduce((sum, value) => sum + value, 0)
    let cumulativePercentage = 0

    return data.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const offset = cumulativePercentage
      cumulativePercentage += percentage

      return {
        value,
        label: labels[index],
        color: colors?.[index] || this.getDefaultColor(index),
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
    if (!chart || !chart.data?.datasets?.[0]?.data) {
      return 100
    }
    const data = chart.data.datasets[0].data as number[]
    return Math.max(...data)
  }

  getBarHeight(value: number, maxValue: number): number {
    return maxValue > 0 ? (value / maxValue) * 100 : 0
  }

  data() {
    if (!this.orderStatusChart?.data?.datasets?.[0]?.data) return 0
    const data = this.orderStatusChart.data.datasets[0].data as number[]
    return data.reduce((a, b) => a + b, 0)
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
    if (!chart || !chart.data?.datasets?.[0]?.data || !chart.data?.labels) {
      return []
    }

    const data = chart.data.datasets[0].data as number[]
    const labels = chart.data.labels as string[]
    const colors = chart.data.datasets[0].backgroundColor as string[]
    const total = data.reduce((sum, value) => sum + value, 0)
    const circumference = 2 * Math.PI * 120
    let cumulativePercentage = 0

    return data.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const strokeLength = (percentage / 100) * circumference
      const offset = circumference - (cumulativePercentage / 100) * circumference
      cumulativePercentage += percentage

      return {
        value,
        label: labels[index],
        color: colors?.[index] || this.getDefaultColor(index),
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
    if (!this.monthlyPerformanceChart?.data?.datasets?.[0]?.data) return 0
    const data = this.monthlyPerformanceChart.data.datasets[0].data as number[]
    const sum = data.reduce((a, b) => a + b, 0)
    return Math.round((sum / data.length) * 10) / 10
  }

  getBestMonth(): { month: number; value: number } {
    if (!this.monthlyPerformanceChart?.data?.datasets?.[0]?.data) return { month: 1, value: 0 }
    const data = this.monthlyPerformanceChart.data.datasets[0].data as number[]
    const maxValue = Math.max(...data)
    const maxIndex = data.indexOf(maxValue)
    return { month: maxIndex + 1, value: maxValue }
  }

  getTotalRevenue(): number {
    return this.dashboardSummary?.totalRevenue || 0
  }

  getAverageWeight(): number {
    return this.dashboardSummary?.averageWeight || 0
  }

}
