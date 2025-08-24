import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MetricCardComponent } from "../metric-card/metric-card.component"
import { DashboardMetric } from "../../core/models/dashboard"

@Component({
  selector: "app-metric-grid",
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  templateUrl: "./metric-grid.component.html",
  styleUrls: ["./metric-grid.component.css"],
})
export class MetricGridComponent {
  @Input() metrics: DashboardMetric[] = []
  @Input() title = ""
  @Input() size: "compact" | "large" = "compact"
  @Input() columns = 4
}
