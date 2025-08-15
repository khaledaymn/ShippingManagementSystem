import { Component, Input, type OnInit, type OnDestroy, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Subject, interval, takeUntil, BehaviorSubject } from "rxjs"
import { DashboardCardComponent } from "./dashboard-card/dashboard-card.component"
import { ChartComponent } from "./chart/chart.component"

export interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease" | "neutral"
  icon: string
  color: "blue" | "green" | "red" | "yellow" | "purple" | "indigo"
  description?: string
  trend?: number[]
  target?: number
}

export interface ChartData {
  id: string
  title: string
  type: "line" | "bar" | "doughnut" | "area"
  data: any[]
  labels: string[]
  color: string
  isLoading?: boolean
  lastUpdated?: Date
}

export interface DashboardConfig {
  title: string
  subtitle: string
  metrics: DashboardMetric[]
  charts: ChartData[]
  quickActions: QuickAction[]
  recentActivities: Activity[]
  refreshInterval?: number
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  url: string
  badge?: string
  isNew?: boolean
}

export interface Activity {
  id: string
  title: string
  description: string
  time: string
  type: "success" | "warning" | "info" | "error"
  icon: string
  isRead?: boolean
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number
  compactView: boolean
  showAnimations: boolean
  theme: "light" | "dark" | "auto"
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardCardComponent, ChartComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() dashboardConfig!: DashboardConfig
  @Input() userRole = ""

  private destroy$ = new Subject<void>()
  private refreshSubject$ = new BehaviorSubject<boolean>(false)

  currentTime = new Date()
  isLoading = false
  showSettings = false
  showNotifications = false
  lastRefresh = new Date()

  // Dashboard settings
  settings: DashboardSettings = {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    compactView: false,
    showAnimations: true,
    theme: "auto",
  }

  // Notification system
  notifications: Activity[] = []
  unreadCount = 0

  // Search and filter
  searchQuery = ""
  filteredActivities: Activity[] = []

  // Performance metrics
  loadTime = 0
  lastUpdateTime = ""

  ngOnInit(): void {
    this.loadSettings()
    this.updateTime()
    this.setupAutoRefresh()
    this.initializeNotifications()
    this.filterActivities()
    this.measureLoadTime()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.saveSettings()
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnload(): void {
    this.saveSettings()
  }

  private measureLoadTime(): void {
    const startTime = performance.now()
    setTimeout(() => {
      this.loadTime = Math.round(performance.now() - startTime)
    }, 100)
  }

  private loadSettings(): void {
    const saved = localStorage.getItem(`dashboard-settings-${this.userRole}`)
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }
  }

  private saveSettings(): void {
    localStorage.setItem(`dashboard-settings-${this.userRole}`, JSON.stringify(this.settings))
  }

  private updateTime(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date()
      })
  }

  private setupAutoRefresh(): void {
    if (this.settings.autoRefresh) {
      interval(this.settings.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.refreshDashboard()
        })
    }
  }

  private initializeNotifications(): void {
    this.notifications = this.dashboardConfig.recentActivities.map((activity) => ({
      ...activity,
      isRead: false,
    }))
    this.updateUnreadCount()
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter((n) => !n.isRead).length
  }

  refreshDashboard(): void {
    this.isLoading = true
    this.lastRefresh = new Date()
    this.lastUpdateTime = this.formatTime(this.lastRefresh)

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false
      this.refreshSubject$.next(true)
      this.showToast("Dashboard refreshed successfully", "success")
    }, 1500)
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings
    if (this.showSettings) {
      this.showNotifications = false
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications
    if (this.showNotifications) {
      this.showSettings = false
      this.markAllAsRead()
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true))
    this.updateUnreadCount()
  }

  onSettingsChange(): void {
    this.saveSettings()
    if (this.settings.autoRefresh) {
      this.setupAutoRefresh()
    }

    // Apply theme
    document.documentElement.setAttribute("data-theme", this.settings.theme)

    // Apply animations
    document.documentElement.style.setProperty("--animation-duration", this.settings.showAnimations ? "0.3s" : "0s")
  }

  filterActivities(): void {
    if (!this.searchQuery.trim()) {
      this.filteredActivities = this.dashboardConfig.recentActivities
    } else {
      this.filteredActivities = this.dashboardConfig.recentActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
      )
    }
  }

  onSearchChange(): void {
    this.filterActivities()
  }

  exportData(): void {
    const data = {
      metrics: this.dashboardConfig.metrics,
      charts: this.dashboardConfig.charts,
      activities: this.dashboardConfig.recentActivities,
      exportedAt: new Date().toISOString(),
      userRole: this.userRole,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-data-${this.userRole}-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    this.showToast("Dashboard data exported successfully", "success")
  }

  printDashboard(): void {
    window.print()
  }

  shareMetric(metric: DashboardMetric): void {
    if (navigator.share) {
      navigator.share({
        title: `${metric.title} - ${this.dashboardConfig.title}`,
        text: `${metric.title}: ${metric.value} (${metric.change || "No change"})`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      const text = `${metric.title}: ${metric.value} (${metric.change || "No change"})`
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Metric copied to clipboard", "success")
      })
    }
  }

  private showToast(message: string, type: "success" | "error" | "info" | "warning"): void {
    // Create toast notification
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.textContent = message

    const container = document.querySelector(".toast-container") || this.createToastContainer()
    container.appendChild(toast)

    // Animate in
    setTimeout(() => toast.classList.add("show"), 100)

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => container.removeChild(toast), 300)
    }, 3000)
  }

  private createToastContainer(): HTMLElement {
    const container = document.createElement("div")
    container.className = "toast-container"
    document.body.appendChild(container)
    return container
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  getRoleDisplayName(): string {
    const roleNames: { [key: string]: string } = {
      admin: "Administrator",
      employee: "Employee",
      salesRep: "Sales Representative",
      merchant: "Merchant Partner",
    }
    return roleNames[this.userRole] || "User"
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  getMetricTrend(metric: DashboardMetric): string {
    if (!metric.trend || metric.trend.length < 2) return "stable"
    const last = metric.trend[metric.trend.length - 1]
    const previous = metric.trend[metric.trend.length - 2]
    return last > previous ? "up" : last < previous ? "down" : "stable"
  }

  getProgressPercentage(metric: DashboardMetric): number {
    if (!metric.target) return 0
    const numericValue =
      typeof metric.value === "string" ? Number.parseFloat(metric.value.replace(/[^0-9.-]/g, "")) : metric.value
    return Math.min((numericValue / metric.target) * 100, 100)
  }

  trackByMetricId(index: number, metric: DashboardMetric): string {
    return metric.id
  }

  trackByChartId(index: number, chart: ChartData): string {
    return chart.id
  }

  trackByActionId(index: number, action: QuickAction): string {
    return action.id
  }

  trackByActivityId(index: number, activity: Activity): string {
    return activity.id
  }
}
