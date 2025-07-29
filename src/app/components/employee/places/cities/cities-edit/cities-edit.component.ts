import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { CityService } from "../../../../../core/services/city.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { City, CreateCity, EditCity } from "../../../../../core/models/city";
import { Governorate } from "../../../../../core/models/governorate";
import { GovernorateService } from "../../../../../core/services/governorate.service";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-cities-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: "./cities-edit.component.html",
  styleUrls: ["./cities-edit.component.css"],
})
export class CitiesEditComponent implements OnInit, OnDestroy {
  cityForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = "";
  successMessage = "";
  cityId: number | null = null;
  canCreate = false;
  canEdit = false;
  governorates: Governorate[] = [];
  loadingGovernorates = false;
  private submitSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cityService: CityService,
    private governorateService: GovernorateService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.cityForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      chargePrice: [0, [Validators.required, Validators.min(0)]],
      pickUpPrice: [0, [Validators.required, Validators.min(0)]],
      governorateId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadGovernorates();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) {
      this.submitSubscription.unsubscribe();
    }
  }

  private checkPermissions(): void {
    this.canCreate = this.authService.hasPermission("Cities", "Create") || this.authService.getUserRole() === "Admin";
    this.canEdit = this.authService.hasPermission("Cities", "Edit") || this.authService.getUserRole() === "Admin";

    if (this.isEditMode && !this.canEdit) {
      this.router.navigate(["/unauthorized"]);
      return;
    }

    if (!this.isEditMode && !this.canCreate) {
      this.router.navigate(["/unauthorized"]);
      return;
    }
  }

  private loadGovernorates(): void {
    this.loadingGovernorates = true;
    this.governorateService.getActiveGovernorates().subscribe({
      next: (governorates: Governorate[]) => {
        this.governorates = governorates;
        this.loadingGovernorates = false;
      },
      error: (error) => {
        this.notificationService.showError("Failed to load governorates");
        this.loadingGovernorates = false;
      },
    });
  }

  private checkRouteParams(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.cityId = Number.parseInt(id, 10);
      this.isEditMode = true;
      this.loadCityData();
    }
  }

  private loadCityData(): void {
    if (!this.cityId) return;

    this.isLoading = true;
    this.cityService.getCityById(this.cityId).subscribe({
      next: (city: City) => {
        const governorate = this.governorates.find((g) => g.name === city.governorateName);
        this.cityForm.patchValue({
          name: city.name,
          chargePrice: city.chargePrice,
          pickUpPrice: city.pickUpPrice,
          governorateId: governorate?.id || null,
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || "Failed to load city data";
        this.notificationService.showError(this.errorMessage);
        this.isLoading = false;
        this.router.navigate(["/employee/places/cities"]);
      },
    });
  }

  onSubmit(): void {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      this.errorMessage = "Please correct the errors in the form.";
      this.notificationService.showError(this.errorMessage, 8000);
      return;
    }

    if (this.isLoading) return; // Prevent multiple submissions

    this.isLoading = true;
    this.errorMessage = "";
    this.successMessage = "";
    this.notificationService.showInfo(this.isEditMode ? "Updating city..." : "Creating city...", 2000);

    const formValue = this.cityForm.value;

    if (this.isEditMode && this.cityId) {
      const editCity: EditCity = {
        id: this.cityId,
        name: formValue.name,
        chargePrice: formValue.chargePrice,
        pickUpPrice: formValue.pickUpPrice,
        governorateId: formValue.governorateId,
      };

      this.submitSubscription = this.cityService.editCity(editCity).subscribe({
        next: () => {
          this.successMessage = "City updated successfully!";
          this.notificationService.showSuccess(this.successMessage, 5000);
          this.isLoading = false;
          setTimeout(() => this.router.navigate(["/employee/places/cities"]), 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to update city";
          this.notificationService.showError(this.errorMessage, 8000);
          this.isLoading = false;
        },
      });
    } else {
      const createCity: CreateCity = {
        name: formValue.name,
        chargePrice: formValue.chargePrice,
        pickUpPrice: formValue.pickUpPrice,
        governorateId: formValue.governorateId,
      };

      this.submitSubscription = this.cityService.createCity(createCity).subscribe({
        next: () => {
          this.successMessage = "City added successfully!";
          this.notificationService.showSuccess(this.successMessage, 5000);
          this.isLoading = false;
          setTimeout(() => this.router.navigate(["/employee/places/cities"]), 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to create city";
          this.notificationService.showError(this.errorMessage, 8000);
          this.isLoading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(["/employee/places/cities"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cityForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["minlength"])
        return `${fieldName} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"])
        return `${fieldName} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
      if (field.errors["min"]) return `${fieldName} must be greater than or equal to ${field.errors["min"].min}`;
    }
    return "";
  }
}