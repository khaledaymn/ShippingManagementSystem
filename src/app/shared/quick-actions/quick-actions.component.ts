import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

export interface QuickAction {
  title: string
  icon: string
  route: string
  color: string
  description: string
}

@Component({
  selector: "app-quick-actions",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./quick-actions.component.html",
  styleUrls: ["./quick-actions.component.css"],
})
export class QuickActionsComponent {
  @Input() actions: QuickAction[] = []
  @Input() title = "Quick Actions"
  @Output() actionClick = new EventEmitter<QuickAction>()

  onActionClick(action: QuickAction): void {
    this.actionClick.emit(action)
  }
}
