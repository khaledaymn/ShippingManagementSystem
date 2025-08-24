import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ViewChild,
  ElementRef,
  inject,
  Output,
  EventEmitter,
  Input
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { Subject, fromEvent, debounceTime, takeUntil, BehaviorSubject, Observable, lastValueFrom } from "rxjs"
import { AuthService } from "../../core/services/auth.service"
import { EmployeeService } from "../../core/services/employee.service"
import { MerchantService } from "../../core/services/merchant.service"
import { OrderService } from "../../core/services/order.service"
import { ShippingRepresentativeService } from "../../core/services/shipping-representative.service"
import { Employee, EmployeeParams } from "../../core/models/employee"
import { Merchant, MerchantQueryParams } from "../../core/models/merchant"
import { Order, OrderParams } from "../../core/models/order"
import { ShippingRepresentative, ShippingRepresentativeQueryParams } from "../../core/models/shipping-representative"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "page" | "user" | "document"
  url: string
}

interface NotificationToast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("searchInput", { static: false }) searchInput!: ElementRef<HTMLInputElement>
  @ViewChild("mobileSearchInput", { static: false }) mobileSearchInput!: ElementRef<HTMLInputElement>
  @ViewChild("dropdownMenu", { static: false }) dropdownMenu!: ElementRef<HTMLDivElement>

  @Output() mobileMenuToggle = new EventEmitter<void>()
  @Output() closeModals = new EventEmitter<void>()

  @Input() isMobileMenuOpen = false

  // Injected services
  private readonly router = inject(Router)
  private readonly authService = inject(AuthService)
  private readonly employeeService = inject(EmployeeService)
  private readonly merchantService = inject(MerchantService)
  private readonly orderService = inject(OrderService)
  private readonly shippingRepresentativeService = inject(ShippingRepresentativeService)

  // Component state
  searchQuery = ""
  userName = ""
  userEmail = ""
  userRole = ""
  userInitials = ""
  showLogoutConfirm = false
  isDropdownOpen = false
  isSearching = false
  isMobile = false
  showBackToTop = false

  // Reactive state
  private readonly destroy$ = new Subject<void>()
  private readonly _searchResults$ = new BehaviorSubject<SearchResult[]>([])
  private readonly _notifications$ = new BehaviorSubject<NotificationToast[]>([])

  // Public observables
  readonly searchResults$: Observable<SearchResult[]> = this._searchResults$.asObservable()
  readonly notifications$: Observable<NotificationToast[]> = this._notifications$.asObservable()

  ngOnInit(): void {
    this.initializeComponent()
    this.checkMobileView()
    this.loadUserData()
  }

  ngAfterViewInit(): void {
    this.setupSearchDebounce()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this._searchResults$.complete()
    this._notifications$.complete()
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    this.checkMobileView()
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement
    if (this.dropdownMenu && !this.dropdownMenu.nativeElement.contains(target)) {
      this.closeDropdown()
    }
  }

  @HostListener("document:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault()
      this.focusSearch()
    }
    if (event.key === "Escape") {
      this.closeAllModals()
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 300
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = `${user.name}`
        this.userEmail = user.email
        this.userRole = user.roleId
        this.userInitials = this.getUserInitials(user.name || '')
      } else {
        this.userName = ""
        this.userEmail = ""
        this.userRole = ""
        this.userInitials = ""
      }
      if (!this.userName) {
        this.userName = 'Admin'
      }
    })
  }

  private getUserInitials(name: string): string {
    const nameInitial = name ? name.charAt(0).toUpperCase() : ""
    return `${name}`
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  private initializeComponent(): void {
    this.setupKeyboardShortcuts()
  }

  private setupKeyboardShortcuts(): void {
    fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe((event) => {
        this.handleGlobalKeyboardShortcuts(event)
      })
  }

  private setupSearchDebounce(): void {
    // Combine listeners for both inputs to avoid duplication
    const inputs = [
      this.searchInput?.nativeElement,
      this.mobileSearchInput?.nativeElement
    ].filter(input => input) as HTMLInputElement[];

    inputs.forEach(input => {
      fromEvent(input, "input")
        .pipe(debounceTime(300), takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.searchQuery.trim()) {
            this.performSearch(this.searchQuery)
          } else {
            this.clearSearchResults()
          }
        });
    });
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768
  }

  private handleGlobalKeyboardShortcuts(event: KeyboardEvent): void {
    switch (event.key) {
      case "F1":
        event.preventDefault()
        this.showHelp()
        break
      case "F2":
        if (event.ctrlKey) {
          event.preventDefault()
          this.settings()
        }
        break
    }
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.performSearch(this.searchQuery)
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.searchQuery = target.value
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault()
      this.search()
    }
  }

  private async performSearch(query: string): Promise<void> {
    if (!query.trim()) return

    this.isSearching = true

    if (this.userRole !== 'Admin') {
      this.showNotification("Search is available only for administrators", "warning")
      this.isSearching = false
      return
    }

    try {
      const employeeParams: EmployeeParams = { pageIndex: 1, pageSize: 5, search: query, isActive: true }
      const merchantParams: MerchantQueryParams = { pageIndex: 1, pageSize: 5, search: query, isActive: true }
      const orderParams: OrderParams = { pageIndex: 1, pageSize: 5, search: query, isDeleted: false }
      const repParams: ShippingRepresentativeQueryParams = { pageIndex: 1, pageSize: 5, search: query, isActive: true }

      const [
        employeesRes,
        merchantsRes,
        ordersRes,
        repsRes
      ] = await Promise.all([
        lastValueFrom(this.employeeService.getAllEmployees(employeeParams)),
        lastValueFrom(this.merchantService.getMerchants(merchantParams)),
        lastValueFrom(this.orderService.getOrders(orderParams)),
        lastValueFrom(this.shippingRepresentativeService.getShippingRepresentatives(repParams)),
      ])

      const results: SearchResult[] = []

      employeesRes.data.forEach((employee: Employee) => {
        results.push({
          id: employee.id.toString(),
          title: `${employee.name || 'Unnamed Employee'} (Employee)`,
          description: `Email: ${employee.email || 'N/A'}, Branch: ${employee.branches?.map(b => b.name).join(', ') || 'N/A'}`,
          type: "user",
          url: `/employee/users/employees/details/${employee.id}`
        })
      })

      merchantsRes.data.forEach((merchant: Merchant) => {
        results.push({
          id: merchant.id.toString(),
          title: `${merchant.name || 'Unnamed Merchant'} (Merchant)`,
          description: `Store: ${merchant.storeName || 'N/A'}, Email: ${merchant.email || 'N/A'}`,
          type: "user",
          url: `/employee/users/merchants/details/${merchant.id}`
        })
      })

      ordersRes.data.forEach((order: Order) => {
        results.push({
          id: order.id.toString(),
          title: `Order #${order.id} (Order)`,
          description: `Customer: ${order.customerName || 'N/A'}, State: ${order.orderState || 'N/A'}, City: ${order.cityName || 'N/A'}`,
          type: "document",
          url: `/employee/orders/details/${order.id}`
        })
      })

      repsRes.data.forEach((rep: ShippingRepresentative) => {
        results.push({
          id: rep.id.toString(),
          title: `${rep.name || 'Unnamed Representative'} (Shipping Representative)`,
          description: `Email: ${rep.email || 'N/A'}, Governorates: ${rep.governorates?.join(', ') || 'N/A'}`,
          type: "user",
          url: `/employee/users/shipping-representatives/details/${rep.id}`
        })
      })

      this._searchResults$.next(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      this.isSearching = false
    }
  }

  clearSearchResults(): void {
    this._searchResults$.next([])
    this.searchQuery = ""
  }

  settings(): void {
    this.navigateWithLoading("/employee/settings/general-settings")
  }

  profile(): void {
    this.navigateWithLoading("/profile")
  }

  private async navigateWithLoading(route: string): Promise<void> {
    try {
      await this.router.navigate([route])
      this.showNotification(`Navigated to ${route}`, "success")
      this.closeAllModals()
    } catch (error) {
      console.error("Navigation error:", error)
      this.showNotification("Navigation failed", "error")
    }
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation()
    this.isDropdownOpen = !this.isDropdownOpen
    if (this.isDropdownOpen && this.isKeyboardUser()) {
      setTimeout(() => {
        const firstMenuItem = this.dropdownMenu?.nativeElement.querySelector(".dropdown-item")
        if (firstMenuItem) {
          (firstMenuItem as HTMLElement).focus()
        }
      }, 0)
    }
  }

  private isKeyboardUser(): boolean {
    return document.activeElement === document.body || document.activeElement?.tagName === "BODY"
  }

  closeDropdown(): void {
    this.isDropdownOpen = false
  }

  toggleMobileMenu(): void {
    console.log('Header: Emitting mobileMenuToggle') // Debug log
    this.mobileMenuToggle.emit()
  }

  confirmLogout(): void {
    this.showLogoutConfirm = true
    document.body.style.overflow = "hidden"
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false
    if (!this.isMobileMenuOpen) {
      document.body.style.overflow = ""
    }
  }

  logout(): void {
    this.authService.logout()
    this.showLogoutConfirm = false
    if (!this.isMobileMenuOpen) {
      document.body.style.overflow = ""
    }
    this.router.navigate(["/auth/login"])
    this.showNotification("Logged out successfully", "success")
  }

  private focusSearch(): void {
    const searchElement = this.isMobile ? this.mobileSearchInput : this.searchInput
    if (searchElement?.nativeElement) {
      searchElement.nativeElement.focus()
      searchElement.nativeElement.select()
    }
  }

  closeAllModals(): void {
    this.closeDropdown()
    if (this.showLogoutConfirm) {
      this.cancelLogout()
    }
    console.log('Header: Emitting closeModals') // Debug log
    this.closeModals.emit()
  }

  private showHelp(): void {
    this.showNotification("Help: Use Ctrl+K to search, F2+Ctrl for settings", "info")
  }

  showNotification(message: string, type: NotificationToast["type"], duration = 5000): void {
    const notification: NotificationToast = {
      id: this.generateId(),
      message,
      type,
      duration,
    }

    const currentNotifications = this._notifications$.value
    this._notifications$.next([...currentNotifications, notification])

    setTimeout(() => {
      this.removeNotification(notification.id)
    }, duration)
  }

  removeNotification(id: string): void {
    const currentNotifications = this._notifications$.value
    const updatedNotifications = currentNotifications.filter((n) => n.id !== id)
    this._notifications$.next(updatedNotifications)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  getSearchResultIcon(type: SearchResult["type"]): string {
    const icons = {
      page: "bi-file-text",
      user: "bi-person",
      document: "bi-file-earmark",
    }
    return icons[type] || "bi-search"
  }

  getNotificationIcon(type: NotificationToast["type"]): string {
    const icons = {
      success: "bi-check-circle",
      error: "bi-exclamation-circle",
      warning: "bi-exclamation-triangle",
      info: "bi-info-circle",
    }
    return icons[type]
  }

  onSearchResultClick(result: SearchResult): void {
    this.clearSearchResults()
    this.navigateWithLoading(result.url)
  }

  onDropdownKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      this.navigateDropdownItems(event.key === "ArrowDown")
    }
  }

  private navigateDropdownItems(down: boolean): void {
    if (!this.dropdownMenu?.nativeElement) {
      console.warn("Dropdown menu not initialized")
      return
    }

    const items: NodeListOf<HTMLElement> = this.dropdownMenu.nativeElement.querySelectorAll(".dropdown-item")
    if (!items || !items.length) {
      console.warn("No dropdown items found")
      return
    }

    const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement)
    let nextIndex = down ? currentIndex + 1 : currentIndex - 1

    if (nextIndex >= items.length) nextIndex = 0
    if (nextIndex < 0) nextIndex = items.length - 1

    const nextItem = items[nextIndex]
    if (nextItem) {
      nextItem.focus()
    }
  }

  trackByNotificationId(index: number, notification: NotificationToast): string {
    return notification.id
  }

  trackBySearchResultId(index: number, result: SearchResult): string {
    return result.id
  }
}
