import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DashboardComponent } from "../../../shared/dashboard/dashboard.component"
import { DashboardConfig } from "../../../core/models/dashboard"

@Component({
  selector: "app-employee-dashboard",
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  templateUrl: "./employee-dashboard.component.html",
  styleUrls: ["./employee-dashboard.component.css"],
})
export class EmployeeDashboardComponent implements OnInit {
  dashboardConfig!: DashboardConfig

  ngOnInit(): void {
    this.dashboardConfig = {
      title: "Employee Dashboard",
      subtitle: "Daily Tasks & Order Management",
      metrics: [
        {
          id: "assigned-orders",
          title: "Assigned Orders",
          value: "47",
          change: "+5",
          changeType: "increase",
          icon: "bi-clipboard-check",
          color: "blue",
          description: "Orders assigned to you today",
        },
        {
          id: "completed-orders",
          title: "Completed Orders",
          value: "32",
          change: "+8",
          changeType: "increase",
          icon: "bi-check-circle",
          color: "green",
          description: "Orders completed today",
        },
        {
          id: "pending-orders",
          title: "Pending Orders",
          value: "15",
          change: "-3",
          changeType: "decrease",
          icon: "bi-clock",
          color: "yellow",
          description: "Orders awaiting processing",
        },
        {
          id: "efficiency-rate",
          title: "Efficiency Rate",
          value: "94.2%",
          change: "+2.1%",
          changeType: "increase",
          icon: "bi-speedometer2",
          color: "purple",
          description: "Your processing efficiency",
        },
      ],
      charts: [
        {
          id: "daily-performance",
          title: "Daily Performance",
          type: "bar",
          data: [28, 35, 42, 38, 45, 32, 47],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          color: "#10b981",
        },
        {
          id: "order-status",
          title: "Order Status Distribution",
          type: "doughnut",
          data: [32, 15, 8, 2],
          labels: ["Completed", "Pending", "In Progress", "On Hold"],
          color: "#3b82f6",
        },
      ],
      quickActions: [
        {
          id: "process-order",
          title: "Process Next Order",
          description: "Continue with pending order processing",
          icon: "bi-play-circle",
          color: "#3b82f6",
          url: "/employee/orders/next",
        },
        {
          id: "view-schedule",
          title: "View Schedule",
          description: "Check your daily task schedule",
          icon: "bi-calendar3",
          color: "#8b5cf6",
          url: "/employee/schedule",
        },
        {
          id: "report-issue",
          title: "Report Issue",
          description: "Report order processing issues",
          icon: "bi-exclamation-circle",
          color: "#ef4444",
          url: "/employee/issues/report",
        },
      ],
      recentActivities: [
        {
          id: "1",
          title: "Order #ORD-2024-001 completed",
          description: "Successfully processed and marked as complete",
          time: "5 minutes ago",
          type: "success",
          icon: "bi-check-circle",
        },
        {
          id: "2",
          title: "New order assigned",
          description: "Order #ORD-2024-002 has been assigned to you",
          time: "15 minutes ago",
          type: "info",
          icon: "bi-inbox",
        },
        {
          id: "3",
          title: "Break time reminder",
          description: "You've been working for 3 hours straight",
          time: "30 minutes ago",
          type: "warning",
          icon: "bi-cup-hot",
        },
      ],
    }
  }
}
