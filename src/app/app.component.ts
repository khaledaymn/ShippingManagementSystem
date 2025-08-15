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

isAuthenticated = false;
isHasRole = false;
  userRole: string | null = null;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // window.scrollTo({ top: 0, behavior: 'instant' });
    this.checkMobileView()
    this.loadUserRole()
    this.authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.isHasRole = !!user?.roleId;
      this.userRole = user?.roleId || null;
      console.log(this.userRole);
    });

  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false
    }
  }

  private loadUserRole(): void {
    // In a real app, this would come from your authentication service
    // For demo purposes, you can change this value to test different sidebars
    const storedRole = localStorage.getItem("userRole") as UserRole
    if (storedRole && ["employee", "delivery", "merchant"].includes(storedRole)) {
      this.currentUserRole = storedRole
    }
  }

  onSidebarItemClick(item: MenuItem): void {
    // Handle sidebar item clicks here
    // Navigation is handled by the sidebar components themselves
  }

  onMobileSidebarToggle(isOpen: boolean): void {
    this.isMobileSidebarOpen = isOpen
  }

  onHeaderMobileMenuToggle(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen
  }

  // Method to switch user roles (for testing purposes)
  switchUserRole(role: UserRole): void {
    this.currentUserRole = role
    localStorage.setItem("userRole", role)
    // In a real app, this would trigger a re-authentication or role change process
  }
  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.userRole = null;
    this.isHasRole = false;
    this.router.navigate(['/auth/login']);
  }

}
