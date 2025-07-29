import { Component, Input, Output, EventEmitter, type OnInit, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, NavigationEnd } from "@angular/router"
import { filter } from "rxjs/operators"

export interface MenuItem {
  id: string
  title: string
  icon: string
  url?: string
  children?: MenuItem[]
  badge?: string
  roles?: string[]
}

export interface SidebarConfig {
  brandTitle: string
  brandSubtitle: string
  brandIcon: string
  userRole: string
  menuItems: MenuItem[]
}

@Component({
  selector: "app-shared-sidebar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SharedSidebarComponent implements OnInit {
  @Input() config!: SidebarConfig
  @Input() isCollapsed = false
  @Input() isMobileOpen = false
  @Output() itemClick = new EventEmitter<MenuItem>()
  @Output() mobileToggle = new EventEmitter<boolean>()

  currentUrl = ""
  expandedItems: Set<string> = new Set()
  isMobile = false

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkMobileView()
    this.currentUrl = this.router.url

    // Listen to route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url
    })
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    this.checkMobileView()
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768
  }

  isActive(item: MenuItem): boolean {

    if (item.url) {
      return this.currentUrl === item.url || this.currentUrl.startsWith(item.url + "/")
    }

    // Check if any child is active
    if (item.children) {
      return item.children.some((child) => this.isActive(child))
    }

    return false
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId)
  }

  toggleExpanded(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId)
    } else {
      this.expandedItems.add(itemId)
    }
  }

  onItemClick(item: MenuItem, event?: Event): void {
    if (event) {
      event.preventDefault()
    }

    // If item has children, toggle expansion
    if (item.children && item.children.length > 0) {
      this.toggleExpanded(item.id)
      return
    }

    // Navigate to URL if provided
    if (item.url) {
      this.router.navigate([item.url])
    }

    // Emit click event
    this.itemClick.emit(item)

    // Close mobile menu if open
    if (this.isMobile && this.isMobileOpen) {
      this.mobileToggle.emit(false)
    }
  }

  onOverlayClick(): void {
    if (this.isMobile) {
      this.mobileToggle.emit(false)
    }
  }

  getRoleBadgeClass(role: string): string {
    return `role-badge ${role.toLowerCase()}`
  }

  trackByMenuItem(index: number, item: MenuItem): string {
    return item.id
  }
}
