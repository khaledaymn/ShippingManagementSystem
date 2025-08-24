import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DashboardMetric } from "../../core/models/dashboard"

@Component({
  selector: "app-metric-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./metric-card.component.html",
  styleUrls: ["./metric-card.component.css"],
})
export class MetricCardComponent {
  @Input() metric!: DashboardMetric
  @Input() size: "compact" | "large" = "compact"
}
