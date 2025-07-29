import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { GovernorateService } from "../../../../../core/services/governorate.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { Governorate, CreateGovernorate, UpdateGovernorate } from "../../../../../core/models/governorate";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";

@Component({
  selector: "app-governorates-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: "./governorate-edit.component.html",
  styleUrls: ["./governorate-edit.component.css"],
})
export class GovernoratesEditComponent implements OnInit, OnDestroy {
  governorateForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  governorateId: number | null = null;
  canCreate = false;
  canEdit = false;
  canDelete = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private governorateService: GovernorateService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.governorateForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isDeleted: [false] // Added isDeleted field
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Governorates", "Create") || userRole === "Admin";
    this.canEdit = this.authService.hasPermission("Governorates", "Edit") || userRole === "Admin";
    this.canDelete = this.authService.hasPermission("Governorates", "Delete") || userRole === "Admin";

    if (this.isEditMode && !this.canEdit) {
      this.notificationService.showWarning("You do not have permission to edit governorates.", 6000);
      this.router.navigate(["/employee/places/governorates"]);
      return;
    }

    if (!this.isEditMode && !this.canCreate) {
      this.notificationService.showWarning("You do not have permission to create governorates.", 6000);
      this.router.navigate(["/employee/places/governorates"]);
      return;
    }
  }

  private checkRouteParams(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.governorateId = Number.parseInt(id, 10);
      this.isEditMode = true;
      this.loadGovernorateData();
    }
  }

  private loadGovernorateData(): void {
    if (!this.governorateId) return;

    this.isLoading = true;
    this.governorateService.getGovernorateById(this.governorateId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (governorate: Governorate) => {
        this.governorateForm.patchValue({
          name: governorate.name,
          isDeleted: governorate.isDeleted
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || "Failed to load governorate data";
        this.notificationService.showError(this.errorMessage ?? '', 8000);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.governorateForm.invalid) {
      this.governorateForm.markAllAsTouched();
      this.notificationService.showWarning("Please fill out all required fields correctly.", 6000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.governorateForm.value;

    if (this.isEditMode && this.governorateId) {
      // Check if isDeleted has changed to trigger delete/activate
      const originalGovernorate = this.governorateForm.getRawValue();
      const isDeletedChanged = originalGovernorate.isDeleted !== formValue.isDeleted;

      if (isDeletedChanged && this.canDelete) {
        console.log(`Toggling isDeleted for Governorate ID=${this.governorateId}, New isDeleted=${formValue.isDeleted}`);
        this.governorateService.deleteGovernorate(this.governorateId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log(`Governorate ID=${this.governorateId} ${formValue.isDeleted ? 'deactivated' : 'activated'} successfully`);
            this.notificationService.showSuccess(
              formValue.isDeleted ? `Governorate "${formValue.name}" deactivated successfully!` : `Governorate "${formValue.name}" activated successfully!`,
              5000
            );
            this.isLoading = false;
            this.router.navigate(["/employee/places/governorates"]);
          },
          error: (error) => {
            this.errorMessage = error.message || `Failed to ${formValue.isDeleted ? 'deactivate' : 'activate'} governorate`;
            this.notificationService.showError(this.errorMessage ?? '', 8000);
            this.isLoading = false;
          }
        });
      } else {
        const updateGovernorate: UpdateGovernorate = {
          id: this.governorateId,
          name: formValue.name,
        };

        console.log('Sending updateGovernorate request:', updateGovernorate);
        this.governorateService.updateGovernorate(this.governorateId, updateGovernorate).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log(`Governorate ID=${this.governorateId} updated successfully`);
            this.notificationService.showSuccess(`Governorate "${formValue.name}" updated successfully!`, 5000);
            this.isLoading = false;
            this.router.navigate(["/employee/places/governorates"]);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to update governorate";
            this.notificationService.showError(this.errorMessage ?? '', 8000);
            this.isLoading = false;
          }
        });
      }
    } else {
      const createGovernorate: CreateGovernorate = {
        name: formValue.name
      };

      console.log('Sending createGovernorate request:', createGovernorate);
      this.governorateService.createGovernorate(createGovernorate).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          console.log(`Governorate "${formValue.name}" created successfully`);
          this.notificationService.showSuccess(`Governorate "${formValue.name}" created successfully!`, 5000);
          this.isLoading = false;
          this.router.navigate(["/employee/places/governorates"]);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to create governorate";
          this.notificationService.showError(this.errorMessage ?? '', 8000);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(["/employee/places/governorates"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.governorateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.governorateForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["minlength"])
        return `${fieldName} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"])
        return `${fieldName} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
    }
    return "";
  }
}
