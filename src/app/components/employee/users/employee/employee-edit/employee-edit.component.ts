import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, forkJoin } from "rxjs";
import { EmployeeService } from "../../../../../core/services/employee.service";
import { BranchService } from "../../../../../core/services/branch.service";
import { GroupService } from "../../../../../core/services/group.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { AddEmployee, UpdateEmployee, Employee } from "../../../../../core/models/employee";
import { Branch, BranchParams } from "../../../../../core/models/branch";
import { Group, GroupParams } from "../../../../../core/models/group";
import { Role } from "../../../../../core/models/user";

@Component({
  selector: "app-employees-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationComponent],
  templateUrl: "./employee-edit.component.html",
  styleUrls: ["./employee-edit.component.css"],
})
export class EmployeesEditComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  branches: Branch[] = [];
  groups: Group[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private branchService: BranchService,
    private groupService: GroupService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.employeeForm = this.fb.group(
      {
        id: [""],
        name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ["", [Validators.required, Validators.email]],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
        address: ["", [Validators.required, Validators.minLength(2)]],
        branchIds: [[], Validators.required],
        groupId: ["", Validators.required],
        password: ["", [Validators.minLength(6)]],
        confirmPassword: [""],
      },
      { validators: this.passwordMatchValidator, updateOn: 'blur' }
    );
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.employeeId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.employeeId;

    const branchParams: BranchParams = {
      pageIndex: 1,
      pageSize: 1000,
      isDeleted: false,
    };
    const groupParams: GroupParams = {
      pageIndex: 1,
      pageSize: 1000,
    };

    forkJoin([
      this.branchService.getAllBranches(branchParams),
      this.groupService.getAllGroups(groupParams),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([branchResponse, groupResponse]) => {
          this.branches = (branchResponse.data as Branch[]) || [];
          this.groups = (groupResponse.data as Group[]) || [];
          if (this.isEditMode) {
            this.loadEmployeeData(this.employeeId!);
          }
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load branches or groups";
          this.notificationService.showError(this.errorMessage ??'', 8000);
        },
      });

    if (this.isEditMode) {
      this.employeeForm.get("password")?.clearValidators();
      this.employeeForm.get("confirmPassword")?.clearValidators();
    } else {
      this.employeeForm.get("password")?.setValidators([Validators.required, Validators.minLength(6)]);
      this.employeeForm.get("confirmPassword")?.setValidators([Validators.required]);
    }
    this.employeeForm.get("password")?.updateValueAndValidity();
    this.employeeForm.get("confirmPassword")?.updateValueAndValidity();

    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    if (this.isEditMode) {
      if (!(this.authService.hasPermission("Employees", "Edit") || userRole === Role.ADMIN)) {
        this.notificationService.showWarning("You do not have permission to edit employees.", 6000);
        this.router.navigate(["/employee/users/employees"]);
        return;
      }
    } else {
      if (!(this.authService.hasPermission("Employees", "Create") || userRole === Role.ADMIN)) {
        this.notificationService.showWarning("You do not have permission to create employees.", 6000);
        this.router.navigate(["/employee/users/employees"]);
        return;
      }
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      form.get("confirmPassword")?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadEmployeeData(id: string): void {
    this.isLoading = true;
    this.employeeService
      .getEmployeeById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee: Employee) => {
          const validBranchIds = employee.branches
            ?.map((b) => b.id)
            .filter((id) => this.branches.some((branch) => branch.id === id)) || [];
          this.employeeForm.patchValue({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            address: employee.address || "",
            branchIds: validBranchIds,
            groupId: this.groups.find((g) => g.name === employee.permission)?.id || "",
          });
          this.isLoading = false;
          this.notificationService.showSuccess("Employee details loaded successfully", 5000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load employee data";
          this.notificationService.showError(this.errorMessage ??'', 8000);
          this.isLoading = false;
          this.router.navigate(["/employee/users/employees"]);
        },
      });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.notificationService.showWarning("Please fill out all required fields correctly.", 6000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.notificationService.showInfo(this.isEditMode ? "Updating employee..." : "Creating employee...", 2000);

    if (this.isEditMode) {
      const updateDto: UpdateEmployee = {
        id: this.employeeForm.value.id,
        name: this.employeeForm.value.name,
        email: this.employeeForm.value.email,
        phoneNumber: this.employeeForm.value.phoneNumber,
        address: this.employeeForm.value.address,
        branchIds: this.employeeForm.value.branchIds,
        groupId: this.employeeForm.value.groupId,
      };
      console.log('Sending updateEmployee request:', updateDto);
      this.employeeService
        .updateEmployee(updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Employee ID=${updateDto.id} updated successfully`);
            this.successMessage = `Employee "${updateDto.name}" updated successfully!`;
            this.notificationService.showSuccess(this.successMessage, 5000);
            this.isLoading = false;
            setTimeout(() => this.router.navigate(["/employee/users/employees"]), 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to update employee";
            this.notificationService.showError(this.errorMessage ??'', 8000);
            this.isLoading = false;
          },
        });
    } else {
      const addDto: AddEmployee = {
        name: this.employeeForm.value.name,
        email: this.employeeForm.value.email,
        phoneNumber: this.employeeForm.value.phoneNumber,
        address: this.employeeForm.value.address,
        branchIds: this.employeeForm.value.branchIds,
        groupId: this.employeeForm.value.groupId,
        password: this.employeeForm.value.password,
      };
      console.log('Sending addEmployee request:', addDto);
      this.employeeService
        .addEmployee(addDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Employee "${addDto.name}" created successfully`);
            this.successMessage = `Employee "${addDto.name}" created successfully!`;
            this.notificationService.showSuccess(this.successMessage, 5000);
            this.isLoading = false;
            setTimeout(() => this.router.navigate(["/employee/users/employees"]), 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to create employee";
            this.notificationService.showError(this.errorMessage ??'', 8000);
            this.isLoading = false;
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(["/employee/users/employees"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["minlength"]) return `${fieldName} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"]) return `${fieldName} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
      if (field.errors["email"]) return "Invalid email format";
      if (field.errors["pattern"]) return `Invalid ${fieldName} format`;
      if (field.errors["passwordMismatch"]) return "Passwords do not match";
    }
    return "";
  }
}