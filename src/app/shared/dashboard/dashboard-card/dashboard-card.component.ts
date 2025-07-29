import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DashboardMetric } from "../../../core/models/dashboard"

@Component({
  selector: "app-dashboard-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard-card.component.html",
  styleUrls: ["./dashboard-card.component.css"],
})
export class DashboardCardComponent implements OnInit {
  @Input() metric!: DashboardMetric
  @Input() showTrend = false
  @Input() showProgress = false
  @Input() progressPercentage = 0
  @Input() trendDirection: "up" | "down" | "stable" = "stable"
  @Output() shareClick = new EventEmitter<DashboardMetric>()

  isExpanded = false
  animationDelay = 0

  ngOnInit(): void {
    // Stagger animation for multiple cards
    this.animationDelay = Math.random() * 200
  }

  getColorClass(): string {
    return `card-${this.metric.color}`
  }

  getChangeColorClass(): string {
    if (!this.metric.changeType) return ""
    return `change-${this.metric.changeType}`
  }

  getTrendIcon(): string {
    switch (this.trendDirection) {
      case "up":
        return "bi-trending-up"
      case "down":
        return "bi-trending-down"
      default:
        return "bi-dash"
    }
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded
  }

  onShare(): void {
    this.shareClick.emit(this.metric)
  }

  getProgressColor(): string {
    if (this.progressPercentage >= 80) return "#10b981"
    if (this.progressPercentage >= 60) return "#f59e0b"
    return "#ef4444"
  }
}
