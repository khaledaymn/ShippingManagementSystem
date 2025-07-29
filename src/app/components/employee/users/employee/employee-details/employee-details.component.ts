import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { Subject, takeUntil } from "rxjs"
import { EmployeeService } from "../../../../../core/services/employee.service"
import { AuthService } from "../../../../../core/services/auth.service"
import { Employee } from "../../../../../core/models/employee" // Import the new Employee interface
import { Role } from "../../../../../core/models/user"

@Component({
  selector: "app-employee-details",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./employee-details.component.html",
  styleUrls: ["./employee-details.component.css"],
})
export class EmployeeDetailsComponent implements OnInit, OnDestroy {
  employee: Employee | null = null // Use the new Employee interface
  isLoading = true
  errorMessage = ""
  employeeId: string | null = null

  canEdit = false

  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.checkPermissions()
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.employeeId = params.get("id")
      if (this.employeeId) {
        this.loadEmployeeDetails(this.employeeId)
      } else {
        this.errorMessage = "Employee ID not provided."
        this.isLoading = false
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole()
    this.canEdit = this.authService.hasPermission("Employees", "Edit") || userRole === Role.ADMIN
  }

  private loadEmployeeDetails(id: string): void {
    this.isLoading = true
    this.errorMessage = ""
    this.employeeService
      .getEmployeeById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.employee = employee
          this.isLoading = false
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load employee details."
          this.isLoading = false
        },
      })
  }

  onEdit(): void {
    if (this.canEdit && this.employeeId) {
      this.router.navigate([`/employee/users/employees/edit/${this.employeeId}`])
    } else if (!this.canEdit) {
      this.errorMessage = "You do not have permission to edit employees."
    }
  }

  onBack(): void {
    this.router.navigate(["/employee/users/employees"])
  }

  getBranchNames(): string {
    if (this.employee && this.employee.branches && this.employee.branches.length > 0) {
      return this.employee.branches.map(b => b.name).join(', ');
    }
    return 'N/A';
  }
}
