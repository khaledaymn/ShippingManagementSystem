import { Component, Input, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DashboardCardComponent } from "./dashboard-card/dashboard-card.component"
import { ChartComponent } from "./chart/chart.component"
import { DashboardConfig, UserRole } from "../../core/models/dashboard"


@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, DashboardCardComponent, ChartComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  @Input() userRole: UserRole = "admin"
  @Input() dashboardConfig!: DashboardConfig
  currentTime = new Date()

  ngOnInit(): void {
    //this.loadDashboardConfig()
    this.updateTime()
  }

  private updateTime(): void {
    setInterval(() => {
      this.currentTime = new Date()
    }, 1000)
  }

  // private loadDashboardConfig(): void {
  //   switch (this.userRole) {
  //     case "admin":
  //       this.dashboardConfig = this.getAdminDashboard()
  //       break
  //     case "employee":
  //       this.dashboardConfig = this.getEmployeeDashboard()
  //       break
  //     case "delegate":
  //       this.dashboardConfig = this.getDelegateDashboard()
  //       break
  //     case "merchant":
  //       this.dashboardConfig = this.getMerchantDashboard()
  //       break
  //     default:
  //       this.dashboardConfig = this.getAdminDashboard()
  //   }
  // }

  // private getAdminDashboard(): DashboardConfig {
  //   return {
  //     title: "Admin Dashboard",
  //     subtitle: "System Overview & Management",
  //     metrics: [
  //       {
  //         id: "total-users",
  //         title: "Total Users",
  //         value: "2,847",
  //         change: "+12.5%",
  //         changeType: "increase",
  //         icon: "bi-people",
  //         color: "blue",
  //         description: "Active users in the system",
  //       },
  //       {
  //         id: "total-orders",
  //         title: "Total Orders",
  //         value: "18,392",
  //         change: "+8.2%",
  //         changeType: "increase",
  //         icon: "bi-box-seam",
  //         color: "green",
  //         description: "Orders processed this month",
  //       },
  //       {
  //         id: "revenue",
  //         title: "Revenue",
  //         value: "$124,580",
  //         change: "+15.3%",
  //         changeType: "increase",
  //         icon: "bi-currency-dollar",
  //         color: "purple",
  //         description: "Total revenue this month",
  //       },
  //       {
  //         id: "system-health",
  //         title: "System Health",
  //         value: "99.8%",
  //         change: "-0.1%",
  //         changeType: "decrease",
  //         icon: "bi-shield-check",
  //         color: "indigo",
  //         description: "System uptime",
  //       },
  //     ],
  //     charts: [
  //       {
  //         id: "orders-chart",
  //         title: "Orders Overview",
  //         type: "line",
  //         data: [120, 150, 180, 200, 170, 190, 220],
  //         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  //         color: "#3b82f6",
  //       },
  //       {
  //         id: "revenue-chart",
  //         title: "Revenue Breakdown",
  //         type: "doughnut",
  //         data: [45, 25, 20, 10],
  //         labels: ["Merchants", "Delegates", "Employees", "Others"],
  //         color: "#8b5cf6",
  //       },
  //     ],
  //     quickActions: [
  //       {
  //         id: "add-user",
  //         title: "Add New User",
  //         description: "Create employee, delegate, or merchant account",
  //         icon: "bi-person-plus",
  //         color: "#3b82f6",
  //         url: "/admin/users/create",
  //       },
  //       {
  //         id: "system-settings",
  //         title: "System Settings",
  //         description: "Configure system parameters and permissions",
  //         icon: "bi-gear",
  //         color: "#6b7280",
  //         url: "/admin/settings",
  //       },
  //       {
  //         id: "view-reports",
  //         title: "Generate Reports",
  //         description: "Create comprehensive system reports",
  //         icon: "bi-file-earmark-text",
  //         color: "#10b981",
  //         url: "/admin/reports",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         id: "1",
  //         title: "New merchant registered",
  //         description: "TechCorp Solutions joined the platform",
  //         time: "2 minutes ago",
  //         type: "success",
  //         icon: "bi-shop",
  //       },
  //       {
  //         id: "2",
  //         title: "System backup completed",
  //         description: "Daily backup process finished successfully",
  //         time: "1 hour ago",
  //         type: "info",
  //         icon: "bi-cloud-check",
  //       },
  //       {
  //         id: "3",
  //         title: "High order volume detected",
  //         description: "Order processing queue is at 85% capacity",
  //         time: "3 hours ago",
  //         type: "warning",
  //         icon: "bi-exclamation-triangle",
  //       },
  //     ],
  //   }
  // }

  // private getEmployeeDashboard(): DashboardConfig {
  //   return {
  //     title: "Employee Dashboard",
  //     subtitle: "Daily Tasks & Order Management",
  //     metrics: [
  //       {
  //         id: "assigned-orders",
  //         title: "Assigned Orders",
  //         value: "47",
  //         change: "+5",
  //         changeType: "increase",
  //         icon: "bi-clipboard-check",
  //         color: "blue",
  //         description: "Orders assigned to you today",
  //       },
  //       {
  //         id: "completed-orders",
  //         title: "Completed Orders",
  //         value: "32",
  //         change: "+8",
  //         changeType: "increase",
  //         icon: "bi-check-circle",
  //         color: "green",
  //         description: "Orders completed today",
  //       },
  //       {
  //         id: "pending-orders",
  //         title: "Pending Orders",
  //         value: "15",
  //         change: "-3",
  //         changeType: "decrease",
  //         icon: "bi-clock",
  //         color: "yellow",
  //         description: "Orders awaiting processing",
  //       },
  //       {
  //         id: "efficiency-rate",
  //         title: "Efficiency Rate",
  //         value: "94.2%",
  //         change: "+2.1%",
  //         changeType: "increase",
  //         icon: "bi-speedometer2",
  //         color: "purple",
  //         description: "Your processing efficiency",
  //       },
  //     ],
  //     charts: [
  //       {
  //         id: "daily-performance",
  //         title: "Daily Performance",
  //         type: "bar",
  //         data: [28, 35, 42, 38, 45, 32, 47],
  //         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  //         color: "#10b981",
  //       },
  //       {
  //         id: "order-status",
  //         title: "Order Status Distribution",
  //         type: "doughnut",
  //         data: [32, 15, 8, 2],
  //         labels: ["Completed", "Pending", "In Progress", "On Hold"],
  //         color: "#3b82f6",
  //       },
  //     ],
  //     quickActions: [
  //       {
  //         id: "process-order",
  //         title: "Process Next Order",
  //         description: "Continue with pending order processing",
  //         icon: "bi-play-circle",
  //         color: "#3b82f6",
  //         url: "/employee/orders/next",
  //       },
  //       {
  //         id: "view-schedule",
  //         title: "View Schedule",
  //         description: "Check your daily task schedule",
  //         icon: "bi-calendar3",
  //         color: "#8b5cf6",
  //         url: "/employee/schedule",
  //       },
  //       {
  //         id: "report-issue",
  //         title: "Report Issue",
  //         description: "Report order processing issues",
  //         icon: "bi-exclamation-circle",
  //         color: "#ef4444",
  //         url: "/employee/issues/report",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         id: "1",
  //         title: "Order #ORD-2024-001 completed",
  //         description: "Successfully processed and marked as complete",
  //         time: "5 minutes ago",
  //         type: "success",
  //         icon: "bi-check-circle",
  //       },
  //       {
  //         id: "2",
  //         title: "New order assigned",
  //         description: "Order #ORD-2024-002 has been assigned to you",
  //         time: "15 minutes ago",
  //         type: "info",
  //         icon: "bi-inbox",
  //       },
  //       {
  //         id: "3",
  //         title: "Break time reminder",
  //         description: "You've been working for 3 hours straight",
  //         time: "30 minutes ago",
  //         type: "warning",
  //         icon: "bi-cup-hot",
  //       },
  //     ],
  //   }
  // }

  // private getDelegateDashboard(): DashboardConfig {
  //   return {
  //     title: "Delegate Dashboard",
  //     subtitle: "Delivery Management & Route Optimization",
  //     metrics: [
  //       {
  //         id: "assigned-deliveries",
  //         title: "Assigned Deliveries",
  //         value: "23",
  //         change: "+3",
  //         changeType: "increase",
  //         icon: "bi-truck",
  //         color: "blue",
  //         description: "Deliveries assigned for today",
  //       },
  //       {
  //         id: "completed-deliveries",
  //         title: "Completed Deliveries",
  //         value: "18",
  //         change: "+6",
  //         changeType: "increase",
  //         icon: "bi-check-circle",
  //         color: "green",
  //         description: "Deliveries completed today",
  //       },
  //       {
  //         id: "remaining-deliveries",
  //         title: "Remaining Deliveries",
  //         value: "5",
  //         change: "-3",
  //         changeType: "decrease",
  //         icon: "bi-hourglass-split",
  //         color: "yellow",
  //         description: "Deliveries pending completion",
  //       },
  //       {
  //         id: "delivery-efficiency",
  //         title: "Delivery Efficiency",
  //         value: "96.7%",
  //         change: "+1.8%",
  //         changeType: "increase",
  //         icon: "bi-speedometer",
  //         color: "purple",
  //         description: "On-time delivery rate",
  //       },
  //     ],
  //     charts: [
  //       {
  //         id: "delivery-performance",
  //         title: "Weekly Delivery Performance",
  //         type: "area",
  //         data: [15, 22, 18, 25, 20, 28, 23],
  //         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  //         color: "#f59e0b",
  //       },
  //       {
  //         id: "delivery-zones",
  //         title: "Delivery Zones Coverage",
  //         type: "doughnut",
  //         data: [8, 6, 4, 5],
  //         labels: ["Zone A", "Zone B", "Zone C", "Zone D"],
  //         color: "#10b981",
  //       },
  //     ],
  //     quickActions: [
  //       {
  //         id: "start-route",
  //         title: "Start Delivery Route",
  //         description: "Begin your optimized delivery route",
  //         icon: "bi-geo-alt",
  //         color: "#3b82f6",
  //         url: "/delegate/deliveries/route",
  //       },
  //       {
  //         id: "update-status",
  //         title: "Update Delivery Status",
  //         description: "Mark deliveries as completed or update status",
  //         icon: "bi-clipboard-check",
  //         color: "#10b981",
  //         url: "/delegate/deliveries/update",
  //       },
  //       {
  //         id: "report-delay",
  //         title: "Report Delay",
  //         description: "Report delivery delays or issues",
  //         icon: "bi-exclamation-triangle",
  //         color: "#ef4444",
  //         url: "/delegate/deliveries/issues",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         id: "1",
  //         title: "Delivery #DEL-2024-045 completed",
  //         description: "Package delivered to customer successfully",
  //         time: "10 minutes ago",
  //         type: "success",
  //         icon: "bi-check-circle",
  //       },
  //       {
  //         id: "2",
  //         title: "Route optimization updated",
  //         description: "New optimal route calculated for remaining deliveries",
  //         time: "25 minutes ago",
  //         type: "info",
  //         icon: "bi-arrow-repeat",
  //       },
  //       {
  //         id: "3",
  //         title: "Customer unavailable",
  //         description: "Delivery #DEL-2024-043 rescheduled for tomorrow",
  //         time: "1 hour ago",
  //         type: "warning",
  //         icon: "bi-person-x",
  //       },
  //     ],
  //   }
  // }

  // private getMerchantDashboard(): DashboardConfig {
  //   return {
  //     title: "Merchant Dashboard",
  //     subtitle: "Sales Analytics & Inventory Management",
  //     metrics: [
  //       {
  //         id: "total-sales",
  //         title: "Total Sales",
  //         value: "$8,420",
  //         change: "+18.5%",
  //         changeType: "increase",
  //         icon: "bi-currency-dollar",
  //         color: "green",
  //         description: "Sales revenue this month",
  //       },
  //       {
  //         id: "orders-received",
  //         title: "Orders Received",
  //         value: "156",
  //         change: "+12",
  //         changeType: "increase",
  //         icon: "bi-bag-check",
  //         color: "blue",
  //         description: "New orders this week",
  //       },
  //       {
  //         id: "pending-orders",
  //         title: "Pending Orders",
  //         value: "8",
  //         change: "-4",
  //         changeType: "decrease",
  //         icon: "bi-clock-history",
  //         color: "yellow",
  //         description: "Orders awaiting fulfillment",
  //       },
  //       {
  //         id: "customer-rating",
  //         title: "Customer Rating",
  //         value: "4.8",
  //         change: "+0.2",
  //         changeType: "increase",
  //         icon: "bi-star-fill",
  //         color: "purple",
  //         description: "Average customer rating",
  //       },
  //     ],
  //     charts: [
  //       {
  //         id: "sales-trend",
  //         title: "Sales Trend",
  //         type: "line",
  //         data: [1200, 1450, 1380, 1650, 1420, 1580, 1720],
  //         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  //         color: "#10b981",
  //       },
  //       {
  //         id: "product-categories",
  //         title: "Top Product Categories",
  //         type: "bar",
  //         data: [45, 35, 25, 20, 15],
  //         labels: ["Electronics", "Clothing", "Books", "Home", "Sports"],
  //         color: "#8b5cf6",
  //       },
  //     ],
  //     quickActions: [
  //       {
  //         id: "add-product",
  //         title: "Add New Product",
  //         description: "Add products to your inventory",
  //         icon: "bi-plus-circle",
  //         color: "#3b82f6",
  //         url: "/merchant/products/add",
  //       },
  //       {
  //         id: "manage-inventory",
  //         title: "Manage Inventory",
  //         description: "Update stock levels and product details",
  //         icon: "bi-boxes",
  //         color: "#10b981",
  //         url: "/merchant/inventory",
  //       },
  //       {
  //         id: "view-analytics",
  //         title: "View Analytics",
  //         description: "Detailed sales and performance analytics",
  //         icon: "bi-graph-up",
  //         color: "#8b5cf6",
  //         url: "/merchant/analytics",
  //       },
  //     ],
  //     recentActivities: [
  //       {
  //         id: "1",
  //         title: "New order received",
  //         description: "Order #ORD-2024-156 for $245.00",
  //         time: "3 minutes ago",
  //         type: "success",
  //         icon: "bi-bag-plus",
  //       },
  //       {
  //         id: "2",
  //         title: "Product stock low",
  //         description: "iPhone 15 Pro has only 3 units remaining",
  //         time: "20 minutes ago",
  //         type: "warning",
  //         icon: "bi-exclamation-triangle",
  //       },
  //       {
  //         id: "3",
  //         title: "Customer review received",
  //         description: "5-star review for your Electronics category",
  //         time: "1 hour ago",
  //         type: "info",
  //         icon: "bi-star",
  //       },
  //     ],
  //   }
  // }

  getGreeting(): string {
    const hour = this.currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  getRoleDisplayName(): string {
    const roleNames = {
      admin: "Administrator",
      employee: "Employee",
      delegate: "Delivery Delegate",
      merchant: "Merchant Partner",
    }
    return roleNames[this.userRole] || "User"
  }
}
