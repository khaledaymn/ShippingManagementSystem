import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuItem, SharedSidebarComponent, SidebarConfig } from "../../../shared/sidebar/sidebar.component";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-employee-sidebar",
  standalone: true,
  imports: [CommonModule, SharedSidebarComponent],
  templateUrl: "./employee-sidebar.component.html",
  styleUrls: ["./employee-sidebar.component.css"],
})
export class EmployeeSidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() mobileToggle = new EventEmitter<boolean>();

  sidebarConfig: SidebarConfig;

  private permissionModuleMapping: { [key: string]: string } = {
    'dashboard':'Dashboard',
    'settings':'Settings',
    'weight-settings':'Settings',
    'shipping-types-settings':'ChargeTypes',
    'permissions':'Permissions',
    'branches':'Branchs',
    'governorates':'Governorates',
    'cities':'Cities',
    'employees':'Employees',
    'merchants':'Merchants',
    'sales-representatives': 'Delivary',
    'orders': 'Orders',
  };

  constructor(private authService: AuthService) {
    this.sidebarConfig = this.getFilteredSidebarConfig();
  }

  private getFilteredSidebarConfig(): SidebarConfig {
    const config: SidebarConfig = {
      brandTitle: "ShipSmart",
      brandSubtitle: "employee",
      brandIcon: "/Logo.png",
      userRole: "employee",
      menuItems: [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: "bi-speedometer2",
          url: "/employee/dashboard",
        },
        {
          id: "settings",
          title: "Settings",
          icon: "bi-gear",
          children: [
            {
              id: "weight-settings",
              title: "Weight Settings",
              icon: "bi-speedometer",
              url: "/employee/settings/general-settings",
            },
            {
              id: "shipping-types-settings",
              title: "Shipping Types Settings",
              icon: "bi-truck",
              url: "/employee/settings/shipping-types",
            },
            {
              id: "permissions",
              title: "Permissions",
              icon: "bi-shield-lock",
              url: "/employee/settings/permissions",
            },
            {
              id: "branches",
              title: "Branches",
              icon: "bi-building",
              url: "/employee/settings/branches",
            },
          ],
        },
        {
          id: "governorates",
          title: "Places",
          icon: "bi-geo-alt",
          children: [
            {
              id: "governorates",
              title: "Governorates",
              icon: "bi-globe",
              url: "/employee/places/governorates",
            },
            {
              id: "cities",
              title: "Cities",
              icon: "bi-pin-map",
              url: "/employee/places/cities",
            },
          ],
        },
        {
          id: "employees",
          title: "Users",
          icon: "bi-people",
          children: [
            {
              id: "employees",
              title: "Employees",
              icon: "bi-person-badge",
              url: "/employee/users/employees",
            },
            {
              id: "merchants",
              title: "Merchants",
              icon: "bi-shop",
              url: "/employee/users/merchants",
            },
            {
              id: "sales-representatives",
              title: "Sales Representatives",
              icon: "bi-person-check",
              url: "/employee/users/shipping-representatives",
            },
          ],
        },
        {
          id: "orders",
          title: "Orders",
          icon: "bi-box-seam",
          url: "/employee/orders",
        },
      ],
    };

    config.menuItems = this.filterMenuItems(config.menuItems);
    return config;
  }

  private filterMenuItems(menuItems: MenuItem[]): MenuItem[] {
    return menuItems
      .map(item => {
        if (item.id === 'dashboard') {
          return item;
        }

        if (this.authService.getUserRole() === 'Admin') {
          return item;
        }

        const moduleName = this.permissionModuleMapping[item.id] || item.id;

        if (item.children) {
          const filteredChildren = this.filterMenuItems(item.children);
          console.log('ffffffffffff',filteredChildren);

          if (!this.authService.hasPermission(moduleName, 'View')) {
            return null;
          }
          if (filteredChildren.length === 0) {
            return null;
          }
          return { ...item, children: filteredChildren };
        }

        return this.authService.hasPermission(moduleName, 'View') ? item : null;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  onItemClick(item: MenuItem): void {
    this.itemClick.emit(item);
  }

  onMobileToggle(isOpen: boolean): void {
    this.mobileToggle.emit(isOpen);
  }
}
