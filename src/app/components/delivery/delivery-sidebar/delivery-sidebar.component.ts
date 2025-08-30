import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuItem, SharedSidebarComponent, SidebarConfig } from "../../../shared/sidebar/sidebar.component";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-delivery-sidebar",
  standalone: true,
  imports: [CommonModule, SharedSidebarComponent],
  templateUrl: "./delivery-sidebar.component.html",
  styleUrls: ["./delivery-sidebar.component.css"],
})
export class deliverySidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() mobileToggle = new EventEmitter<boolean>();

  sidebarConfig: SidebarConfig;

  private permissionModuleMapping: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'weight-settings': 'Settings',
    'shipping-types-settings': 'ChargeTypes',
    'permissions': 'Permissions',
    'branches': 'Branches',
    'deliverys': 'deliverys',
    'merchants': 'Merchants',
    'sales-representatives': 'Delivary',
    'governorates': 'Governorates',
    'cities': 'Cities',
    'orders': 'Orders',
    'order-reports': 'Orders', // غير مدرج في modules
  };

  constructor(private authService: AuthService) {
    this.sidebarConfig = this.getFilteredSidebarConfig();
  }

  private getFilteredSidebarConfig(): SidebarConfig {
    const config: SidebarConfig = {
      brandTitle: "ShipSmart",
      brandSubtitle: "delivery",
      brandIcon: "/Logo.png",
      userRole: "delivery",
      menuItems: [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: "bi-speedometer2",
          url: "/delivery/dashboard",
        },
        {
          id: "orders",
          title: "Orders",
          icon: "bi-box-seam",
          url: "/delivery/orders",
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
