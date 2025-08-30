import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuItem, SharedSidebarComponent, SidebarConfig } from "../../../shared/sidebar/sidebar.component";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-merchant-sidebar",
  standalone: true,
  imports: [CommonModule, SharedSidebarComponent],
  templateUrl: "./merchant-sidebar.component.html",
  styleUrls: ["./merchant-sidebar.component.css"],
})
export class merchantSidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() mobileToggle = new EventEmitter<boolean>();

  sidebarConfig: SidebarConfig;

  constructor() {
    this.sidebarConfig = this.getFilteredSidebarConfig();
  }

  private getFilteredSidebarConfig(): SidebarConfig {
    const config: SidebarConfig = {
      brandTitle: "ShipSmart",
      brandSubtitle: "merchant",
      brandIcon: "/Logo.png",
      userRole: "merchant",
      menuItems: [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: "bi-speedometer2",
          url: "/merchant/dashboard",
        },
        {
          id: "orders",
          title: "Orders",
          icon: "bi-box-seam",
          url: "/merchant/orders",
        },
      ],
    };

    return config;
  }


  onItemClick(item: MenuItem): void {
    this.itemClick.emit(item);
  }

  onMobileToggle(isOpen: boolean): void {
    this.mobileToggle.emit(isOpen);
  }
}
