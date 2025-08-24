import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-dashboard-header",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard-header.component.html",
  styleUrls: ["./dashboard-header.component.css"],
})
export class DashboardHeaderComponent {
  @Input() title = "Dashboard"
  @Input() subtitle = ""
  @Input() greeting = "Good Morning"
  @Input() userName = "User"
  @Input() currentDateTime: Date = new Date()

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
}
