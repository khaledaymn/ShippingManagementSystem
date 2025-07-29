import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil, forkJoin, Observable } from "rxjs";
import { BranchService } from "../../../../core/services/branch.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { Branch, CreateBranch, UpdateBranch } from "../../../../core/models/branch";
import { City } from "../../../../core/models/city";
import { PaginationResponse } from "../../../../core/models/response";

@Component({
  selector: "app-branches-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./branches-edit.component.html",
  styleUrls: ["./branches-edit.component.css"],
})
export class BranchesEditComponent implements OnInit, OnDestroy {
  branchForm!: FormGroup;
  cities: City[] = [];
  loading = false;
  saving = false;
  isEditMode = false;
  branchId: number | null = null;
  currentBranch: Branch | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.branchForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      location: ["", [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      cityId: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!(id && id !== "create");
    this.branchId = this.isEditMode ? Number.parseInt(id || '0', 10) : null;
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    // Define observables with explicit types
    const citiesObservable = this.branchService.getCities();
    const observables: [
      Observable<PaginationResponse<City>>,
      Observable<Branch>?
    ] = [citiesObservable];

    if (this.isEditMode && this.branchId) {
      observables.push(this.branchService.getBranchById(this.branchId));
    }

    forkJoin(observables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([citiesResponse, branchResponse]) => {
          this.cities = citiesResponse.data as City[];
          if (this.isEditMode && branchResponse) {
            this.currentBranch = branchResponse;
            this.populateForm(this.currentBranch);
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.showError(
            this.isEditMode ? `Failed to load branch data: ${error.message}` : `Failed to load cities: ${error.message}`,
            8000
          );
          if (this.isEditMode) {
            this.router.navigate(["/branches"]);
          }
        },
      });
  }

  private populateForm(branch: Branch): void {
    // Match cityName from branch to a city in the cities array (case-insensitive)
    const city = this.cities.find(
      (c) => c.name.trim().toLowerCase() === branch.cityName?.trim().toLowerCase()
    );
    const cityId = city?.id || null;

    this.branchForm.patchValue({
      name: branch.name?.trim() || "",
      location: branch.location?.trim() || "",
      cityId: cityId,
    });

    if (!cityId && branch.cityName) {
      this.notificationService.showWarning(
        `Could not match the branch's city "${branch.cityName}". Please select a city.`,
        6000
      );
    }
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.markFormGroupTouched();
      this.notificationService.showError("Please fill in all required fields correctly", 8000);
      return;
    }

    this.saving = true;
    const formData = this.branchForm.value;

    if (this.isEditMode && this.branchId) {
      this.updateBranch(formData);
    } else {
      this.createBranch(formData);
    }
  }

  private createBranch(formData: any): void {
    const createData: CreateBranch = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      cityId: Number(formData.cityId),
    };

    this.branchService
      .createBranch(createData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.showSuccess("Branch created successfully", 5000);
          this.router.navigate(["/branches"]);
        },
        error: (error) => {
          this.saving = false;
          this.notificationService.showError(`Failed to create branch: ${error.message}`, 8000);
        },
      });
  }

  private updateBranch(formData: any): void {
    if (!this.branchId) return;

    const updateData: UpdateBranch = {
      id: this.branchId,
      name: formData.name.trim(),
      location: formData.location.trim(),
      cityId: Number(formData.cityId),
    };

    this.branchService
      .updateBranch(this.branchId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.showSuccess("Branch updated successfully", 5000);
          this.router.navigate(["/branches"]);
        },
        error: (error) => {
          this.saving = false;
          this.notificationService.showError(`Failed to update branch: ${error.message}`, 8000);
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.branchForm.controls).forEach((key) => {
      const control = this.branchForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(["/employee/settings/branches"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.branchForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.branchForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors["required"]) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors["minlength"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters`;
      }
      if (field.errors["maxlength"]) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
      }
      if (field.errors["min"]) {
        return `Please select a valid ${this.getFieldLabel(fieldName).toLowerCase()}`;
      }
    }
    return "";
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: "Branch Name",
      location: "Location",
      cityId: "City",
    };
    return labels[fieldName] || fieldName;
  }

  getCityName(cityId: number): string {
    const city = this.cities.find((c) => c.id === cityId);
    return city ? city.name : "";
  }
}
