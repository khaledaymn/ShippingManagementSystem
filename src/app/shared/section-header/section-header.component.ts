import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-section-header",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./section-header.component.html",
  styleUrls: ["./section-header.component.css"],
})
export class SectionHeaderComponent {
  @Input() title = ""
  @Input() showViewAll = false
  @Input() viewAllLink = ""
  @Input() viewAllText = "View All"
}
