import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, forkJoin } from "rxjs";
import { MerchantService } from "../../../../../core/services/merchant.service";
import { BranchService } from "../../../../../core/services/branch.service";
import { CityService } from "../../../../../core/services/city.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { Merchant, CreateMerchant, UpdateMerchant, SpecialDeliveryPrice } from "../../../../../core/models/merchant";
import { Branch, BranchParams } from "../../../../../core/models/branch";
import { City, CityParams } from "../../../../../core/models/city";
import { Role } from "../../../../../core/models/user";

@Component({
  selector: "app-merchants-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./merchants-edit.component.html",
  styleUrls: ["./merchants-edit.component.css"],
})
export class MerchantsEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  merchantForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  merchantId: string | null = null;
  canCreate = false;
  canUpdate = false;
  branches: Branch[] = [];
  cities: City[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private merchantService: MerchantService,
    private branchService: BranchService,
    private cityService: CityService,
    private authService: AuthService
  ) {
    this.merchantForm = this.createForm();
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadDropdownData();

    this.merchantId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.merchantId;

    if (this.isEditMode && this.merchantId) {
      this.loadMerchantData(this.merchantId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ["", [Validators.required, Validators.email]],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
        address: ["", [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        storeName: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        rejectedOrderPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        specialPickup: [0, [Validators.min(0)]],
        password: [""],
        branchIds: [[]],
        specialDeliveryPrices: this.fb.array<FormGroup>([]),
      },
      { updateOn: "blur" }
    );
  }

  get specialDeliveryPricesArray(): FormArray<FormGroup> {
    return this.merchantForm.get("specialDeliveryPrices") as FormArray<FormGroup>;
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Merchants", "CREATE") || userRole === Role.ADMIN;
    this.canUpdate = this.authService.hasPermission("Merchants", "UPDATE") || userRole === Role.ADMIN;

    if (this.isEditMode && !this.canUpdate) {
      this.errorMessage = "You do not have permission to edit merchants.";
      setTimeout(() => this.router.navigate(["/employee/users/merchants"]), 3000);
      return;
    }

    if (!this.isEditMode && !this.canCreate) {
      this.errorMessage = "You do not have permission to create merchants.";
      setTimeout(() => this.router.navigate(["/employee/users/merchants"]), 3000);
      return;
    }

    if (!this.isEditMode) {
      this.merchantForm.get("password")?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
      ]);
    } else {
      this.merchantForm.get("password")?.clearValidators();
    }
    this.merchantForm.get("password")?.updateValueAndValidity();
  }

  private loadDropdownData(): void {
    this.isLoading = true;
    const branchParams: BranchParams = {
      pageIndex: 1,
      pageSize: 1000,
      isDeleted: false,
    };
    const cityParams: CityParams = {
      pageIndex: 1,
      pageSize: 1000,
      isDeleted: false,
      };
    forkJoin([
      this.branchService.getAllBranches(branchParams),
      this.cityService.getAllCities(cityParams),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([branchResponse, cities]) => {
          this.branches = (branchResponse.data as Branch[]) || [];
          this.cities = cities.data as City[] || [];
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load branches or cities";
          this.isLoading = false;
        },
      });
  }

  private loadMerchantData(id: string): void {
    this.isLoading = true;
    this.merchantService
      .getMerchantById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (merchant) => {
          this.populateForm(merchant);
          this.isLoading = false;
          this.successMessage = "Merchant details loaded successfully";
          setTimeout(() => (this.successMessage = null), 5000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load merchant data";
          this.isLoading = false;
          setTimeout(() => this.router.navigate(["/employee/users/merchants"]), 3000);
        },
      });
  }

  private populateForm(merchant: Merchant): void {
    this.merchantForm.patchValue({
      name: merchant.name,
      email: merchant.email,
      phoneNumber: merchant.phoneNumber,
      address: merchant.address,
      storeName: merchant.storeName,
      rejectedOrderPercent: merchant.rejectedOrderPercent,
      specialPickup: merchant.specialPickup || 0,
      branchIds: merchant.branches?.map((b) => b.id) || [],
    });

    this.specialDeliveryPricesArray.clear();
    if (merchant.specialDeliveryPrices) {
      merchant.specialDeliveryPrices.forEach((price) => {
        this.addSpecialDeliveryPrice(price);
      });
    }
  }

  addSpecialDeliveryPrice(price?: SpecialDeliveryPrice): void {
    const priceGroup = this.fb.group({
      cityId: [price?.cityId || "", Validators.required],
      specialPrice: [price?.specialPrice || 0, [Validators.required, Validators.min(0)]],
    });
    this.specialDeliveryPricesArray.push(priceGroup);
  }

  removeSpecialDeliveryPrice(index: number): void {
    this.specialDeliveryPricesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.merchantForm.invalid) {
      this.merchantForm.markAllAsTouched();
      this.errorMessage = "Please fill out all required fields correctly.";
      setTimeout(() => (this.errorMessage = null), 6000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.merchantForm.value;

    if (this.isEditMode && this.merchantId) {
      const updateData: UpdateMerchant = {
        id: this.merchantId,
        name: formValue.name,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        storeName: formValue.storeName,
        rejectedOrderPercent: formValue.rejectedOrderPercent,
        specialPickup: formValue.specialPickup,
        branchIds: formValue.branchIds,
        specialDeliveryPrices: formValue.specialDeliveryPrices,
      };

      this.merchantService
        .updateMerchant(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = `Merchant "${updateData.name}" updated successfully!`;
            this.isLoading = false;
            setTimeout(() => {
              this.successMessage = null;
              this.router.navigate(["/employee/users/merchants"]);
            }, 3000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to update merchant";
            this.isLoading = false;
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
    } else {
      const createData: CreateMerchant = {
        name: formValue.name,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        password: formValue.password,
        address: formValue.address,
        storeName: formValue.storeName,
        rejectedOrderPercent: formValue.rejectedOrderPercent,
        specialPickup: formValue.specialPickup,
        branchIds: formValue.branchIds,
        specialDeliveryPrices: formValue.specialDeliveryPrices,
      };

      this.merchantService
        .createMerchant(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = `Merchant "${createData.name}" created successfully!`;
            this.isLoading = false;
            setTimeout(() => {
              this.successMessage = null;
              this.router.navigate(["/employee/users/merchants"]);
            }, 3000);
          },
          error: (error) => {
            this.errorMessage = error.message || "Failed to create merchant";
            this.isLoading = false;
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(["/employee/users/merchants"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.merchantForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.merchantForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      if (field.errors["email"]) return "Invalid email format";
      if (field.errors["minlength"]) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"]) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${field.errors["maxlength"].requiredLength} characters`;
      if (field.errors["min"]) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors["min"].min}`;
      if (field.errors["max"]) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${field.errors["max"].max}`;
      if (field.errors["pattern"]) return `Invalid ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} format`;
    }
    return "";
  }
}
