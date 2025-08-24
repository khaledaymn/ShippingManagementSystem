import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterOutlet } from "@angular/router"
import { HeaderComponent } from "./shared/header/header.component"
import { MenuItem } from "./shared/sidebar/sidebar.component"
import { EmployeeSidebarComponent } from "./components/employee/employee-sidebar/employee-sidebar.component"
import { AuthService } from "./core/services/auth.service"

type UserRole = "employee" | "Admin" | "merchant"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    EmployeeSidebarComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "bangalore-js-project"

  // User role - this would typically come from authentication service
  currentUserRole: UserRole = "employee" // Default for demo

  // Sidebar state
  isSidebarCollapsed = false
  isMobileSidebarOpen = false
  isMobile = false

  isAuthenticated = false
  isHasRole = false
  userRole: string | null = null

  // Sidebar configuration
  sidebarConfig = {
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
        id: "orders",
        title: "Orders",
        icon: "bi-cart",
        children: [
          {
            id: "orders-list",
            title: "All Orders",
            icon: "bi-list-ul",
            url: "/employee/orders",
            badge: "employee",
          },
          {
            id: "orders-create",
            title: "Create Order",
            icon: "bi-plus-circle",
            url: "/employee/orders/create",
            badge: "employee",
          },
        ],
      },
      {
        id: "users",
        title: "Users",
        icon: "bi-person",
        children: [
          {
            id: "employees",
            title: "Employees",
            icon: "bi-person-check",
            url: "/employee/users/employees",
            badge: "Admin",
          },
          {
            id: "merchants",
            title: "Merchants",
            icon: "bi-shop",
            url: "/employee/users/merchants",
            badge: "Admin",
          },
          {
            id: "shipping-representatives",
            title: "Shipping Representatives",
            icon: "bi-truck",
            url: "/employee/users/shipping-representatives",
            badge: "Admin",
          },
        ],
      },
      {
        id: "settings",
        title: "Settings",
        icon: "bi-gear",
        url: "/employee/settings/general-settings",
      },
    ],
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkMobileView()
    this.loadUserRole()
    this.authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = !!user
      this.isHasRole = !!user?.roleId
      this.userRole = user?.roleId || null
      console.log('App: User role updated:', this.userRole) // Debug log
    })
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false
    }
    console.log('App: isMobile:', this.isMobile, 'isMobileSidebarOpen:', this.isMobileSidebarOpen) // Debug log
  }

  private loadUserRole(): void {
    const storedRole = localStorage.getItem("userRole") as UserRole
    if (storedRole && ["employee", "delivery", "merchant"].includes(storedRole)) {
      this.currentUserRole = storedRole
      this.sidebarConfig.userRole = storedRole
    }
    console.log('App: Loaded user role:', this.currentUserRole) // Debug log
  }

  onSidebarItemClick(item: MenuItem): void {
    console.log('App: Sidebar item clicked:', item) // Debug log
    if (item.url) {
      this.isMobileSidebarOpen = false
      this.router.navigate([item.url])
    }
  }

  onMobileSidebarToggle(isOpen: boolean): void {
    console.log('App: Received mobileToggle:', isOpen) // Debug log
    this.isMobileSidebarOpen = isOpen
  }

  onHeaderMobileMenuToggle(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen
    console.log('App: Header mobile menu toggled:', this.isMobileSidebarOpen) // Debug log
  }

  onCloseModals(): void {
    console.log('App: Received closeModals') // Debug log
    this.isMobileSidebarOpen = false
  }

  switchUserRole(role: UserRole): void {
    this.currentUserRole = role
    localStorage.setItem("userRole", role)
    this.sidebarConfig.userRole = role
    console.log('App: Switched user role:', role) // Debug log
  }

  logout(): void {
    this.authService.logout()
    this.isAuthenticated = false
    this.userRole = null
    this.isHasRole = false
    this.isMobileSidebarOpen = false
    this.router.navigate(['/auth/login'])
    console.log('App: Logged out') // Debug log
  }
}
