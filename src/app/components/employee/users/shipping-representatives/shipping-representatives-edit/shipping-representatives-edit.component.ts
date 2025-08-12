import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, forkJoin } from "rxjs";
import { ShippingRepresentativeService } from "../../../../../core/services/shipping-representative.service";
import { GovernorateService } from "../../../../../core/services/governorate.service";
import {
  ShippingRepresentative,
  CreateShippingRepresentative,
  UpdateShippingRepresentative,
  DiscountType,
} from "../../../../../core/models/shipping-representative";
import { Governorate } from "../../../../../core/models/governorate";
import { Role } from "../../../../../core/models/user";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";

@Component({
  selector: "app-shipping-representatives-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NotificationComponent],
  templateUrl: "./shipping-representatives-edit.component.html",
  styleUrls: ["./shipping-representatives-edit.component.css"],
})
export class ShippingRepresentativesEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  governorates: Governorate[] = [];
  isLoading = false;
  isEditMode = false;
  shippingRepresentativeId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  private destroy$ = new Subject<void>();

  discountTypes = [
    { value: DiscountType.Fixed, label: "Fixed Amount" },
    { value: DiscountType.Percentage, label: "Percentage" },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shippingRepresentativeService: ShippingRepresentativeService,
    private governorateService: GovernorateService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group(
      {
        id: [""],
        name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/), Validators.maxLength(20)]],
        address: ["", [Validators.required, Validators.maxLength(500)]],
        discountType: [DiscountType.Percentage, [Validators.required]],
        companyPercent: [0, [Validators.required, Validators.min(0)]],
        governorateIds: [[], [Validators.required, this.minArrayLength(1)]],
        password: ["", [Validators.minLength(6), Validators.maxLength(100)]],
        confirmPassword: [""],
      },
      { validators: this.passwordMatchValidator, updateOn: "blur" }
    );
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.shippingRepresentativeId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.shippingRepresentativeId;

    forkJoin([
      this.governorateService.getActiveGovernorates(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([governorates]) => {
          this.governorates = governorates || [];
          if (this.isEditMode) {
            this.loadShippingRepresentativeData();
          }
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load governorates";
          this.notificationService.showError(this.errorMessage ?? "", 8000);
        },
      });

    if (this.isEditMode) {
      this.form.get("password")?.clearValidators();
      this.form.get("confirmPassword")?.clearValidators();
    } else {
      this.form.get("password")?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100)]);
      this.form.get("confirmPassword")?.setValidators([Validators.required]);
    }
    this.form.get("password")?.updateValueAndValidity();
    this.form.get("confirmPassword")?.updateValueAndValidity();

    // Subscribe to discountType changes to update companyPercent validators
    this.form.get("discountType")?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      const companyPercentControl = this.form.get("companyPercent");
      if (value === DiscountType.Percentage) {
        companyPercentControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        companyPercentControl?.setValidators([Validators.required, Validators.min(0)]);
      }
      companyPercentControl?.updateValueAndValidity();
    });

    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    if (this.isEditMode) {
      if (!(this.authService.hasPermission("ShippingRepresentatives", "UPDATE") || userRole === Role.ADMIN)) {
        this.notificationService.showWarning("You do not have permission to edit shipping representatives.", 6000);
        this.router.navigate(["/employee/users/shipping-representatives"]);
        return;
      }
    } else {
      if (!(this.authService.hasPermission("ShippingRepresentatives", "CREATE") || userRole === Role.ADMIN)) {
        this.notificationService.showWarning("You do not have permission to create shipping representatives.", 6000);
        this.router.navigate(["/employee/users/shipping-representatives"]);
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

  private minArrayLength(min: number) {
    return (control: any) => {
      if (control.value && control.value.length >= min) {
        return null;
      }
      return { minArrayLength: { requiredLength: min, actualLength: control.value ? control.value.length : 0 } };
    };
  }

  getAmountSymbol(): string {
    return this.form.get("discountType")?.value === DiscountType.Fixed ? "$" : "%";
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private loadShippingRepresentativeData(): void {
    if (!this.shippingRepresentativeId) return;

    this.isLoading = true;
    this.shippingRepresentativeService
      .getShippingRepresentativeById(this.shippingRepresentativeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (representative) => {
          const governorateIds = this.governorates
            .filter((gov) => representative.governorates.includes(gov.name))
            .map((gov) => gov.id);
          this.form.patchValue({
            id: representative.id,
            name: representative.name,
            email: representative.email,
            phoneNumber: representative.phoneNumber,
            address: representative.address,
            discountType: representative.discountType,
            companyPercent: representative.companyPercentage,
            governorateIds: governorateIds,
          });
          this.isLoading = false;
          this.notificationService.showSuccess("Shipping representative details loaded successfully", 5000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load shipping representative data";
          this.notificationService.showError(this.errorMessage ?? "", 8000);
          this.isLoading = false;
          this.router.navigate(["/employee/users/shipping-representatives"]);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showWarning("Please fill out all required fields correctly.", 6000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.notificationService.showInfo(
      this.isEditMode ? "Updating shipping representative..." : "Creating shipping representative...",
      2000
    );

    if (this.isEditMode) {
      const updateDto: UpdateShippingRepresentative = {
        id: this.shippingRepresentativeId!,
        name: this.form.value.name,
        email: this.form.value.email,
        phoneNumber: this.form.value.phoneNumber,
        address: this.form.value.address,
        discountType: this.form.value.discountType,
        companyPercentage: this.form.value.companyPercent,
        governorateIds: this.form.value.governorateIds,
      };
      console.log("Sending updateShippingRepresentative request:", updateDto);
      this.shippingRepresentativeService
        .updateShippingRepresentative(updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Shipping Representative ID=${updateDto.id} updated successfully`);
            this.successMessage = `Shipping Representative "${updateDto.name}" updated successfully!`;
            this.notificationService.showSuccess(this.successMessage, 5000);
            this.isLoading = false;
            setTimeout(() => this.router.navigate(["/employee/users/shipping-representatives"]), 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to update shipping representative";
            this.notificationService.showError(this.errorMessage ?? "", 8000);
            this.isLoading = false;
          },
        });
    } else {
      const addDto: CreateShippingRepresentative = {
        name: this.form.value.name,
        email: this.form.value.email,
        phoneNumber: this.form.value.phoneNumber,
        password: this.form.value.password,
        address: this.form.value.address,
        discountType: this.form.value.discountType,
        companyPercentage: this.form.value.companyPercent,
        governorateIds: this.form.value.governorateIds,
      };
      console.log("Sending createShippingRepresentative request:", addDto);
      this.shippingRepresentativeService
        .createShippingRepresentative(addDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Shipping Representative "${addDto.name}" created successfully`);
            this.successMessage = `Shipping Representative "${addDto.name}" created successfully!`;
            this.notificationService.showSuccess(this.successMessage, 5000);
            this.isLoading = false;
            setTimeout(() => this.router.navigate(["/employee/users/shipping-representatives"]), 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to create shipping representative";
            this.notificationService.showError(this.errorMessage ?? "", 8000);
            this.isLoading = false;
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(["/employee/users/shipping-representatives"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors["email"]) return "Invalid email format";
      if (field.errors["minlength"])
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"])
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors["maxlength"].requiredLength} characters`;
      if (field.errors["pattern"]) return `Invalid ${this.getFieldLabel(fieldName)} format`;
      if (field.errors["min"]) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["min"].min}`;
      if (field.errors["max"]) return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors["max"].max}`;
      if (field.errors["minArrayLength"])
        return `Please select at least ${field.errors["minArrayLength"].requiredLength} governorate(s)`;
      if (field.errors["passwordMismatch"]) return "Passwords do not match";
    }
    return "";
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: "Name",
      email: "Email",
      phoneNumber: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      address: "Address",
      discountType: "Discount Type",
      companyPercent: "Company Amount",
      governorateIds: "Governorates",
    };
    return labels[fieldName] || fieldName;
  }

  getPageTitle(): string {
    return this.isEditMode ? "Edit Shipping Representative" : "Add Shipping Representative";
  }
}