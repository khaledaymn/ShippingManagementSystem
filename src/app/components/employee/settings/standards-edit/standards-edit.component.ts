import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { Subject, takeUntil } from "rxjs"
import { Standard, UpdateStandard } from "../../../../core/models/standard"
import { StandardService } from "../../../../core/services/standard.service"
import { NotificationService } from "../../../../core/services/notification.service"

@Component({
  selector: "app-standards-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./standards-edit.component.html",
  styleUrls: ["./standards-edit.component.css"],
})
export class StandardsEditComponent implements OnInit, OnDestroy {
  standardForm: FormGroup
  standard: Standard | null = null
  standardId: number | null = null
  loading = false
  saving = false
  error: string | null = null
  successMessage: string | null = null
  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private standardService: StandardService,
    private router: Router,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) {
    this.standardForm = this.createForm()
  }

  // Update the ngOnInit method to always load the first standard
  ngOnInit(): void {
    // Always work with ID 1, ignore route params
    this.standardId = 1
    this.loadStandard()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private createForm(): FormGroup {
    return this.fb.group({
      standardWeight: ["", [Validators.required, Validators.min(0.01), Validators.max(1000)]],
      villagePrice: ["", [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      kgPrice: ["", [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
    })
  }

  // Update the loadStandard method to use getFirstStandard
  loadStandard(): void {
    this.loading = true
    this.error = null
    this.standardService
      .getFirstStandard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (standard) => {
          if (standard) {
            this.standard = standard
            this.standardId = standard.id
            this.populateForm(standard)
          } else {
            this.error = "Standard configuration not found"
            this.notificationService.showError("Standard configuration not found")
          }
          this.loading = false
        },
        error: (error) => {
          this.error = error.message
          this.loading = false
          console.error("Error loading standard:", error)
          this.notificationService.showError("Failed to load standard configuration for editing")
        },
      })
  }

  private populateForm(standard: Standard): void {
    this.standardForm.patchValue({
      standardWeight: standard.standardWeight,
      villagePrice: standard.villagePrice,
      kgPrice: standard.kGprice,
    })
  }

  // Update the onSubmit method to always use ID 1
  onSubmit(): void {
    if (this.standardForm.invalid) {
      this.markFormGroupTouched()
      this.notificationService.showWarning("Please fix the form errors before submitting")
      return
    }

    this.saving = true
    this.error = null
    this.successMessage = null

    const formValue = this.standardForm.value
    const updateData: UpdateStandard = {
      standardWeight: formValue.standardWeight,
      villagePrice: formValue.villagePrice,
      kgPrice: formValue.kgPrice,
    }

 // Validate data before submitting
    const validation = this.standardService.validateStandardData(updateData)
    if (!validation.isValid) {
      this.notificationService.showError("Please correct the validation errors")
      return
    }

    // Show calculated values before saving
    const calculated = this.standardService.calculateDerivedValues(updateData)
    // this.notificationService.showInfo(
    //   `Saving configuration: ${this.formatCurrency(calculated.totalForStandardWeight)} total value`,
    //   3000,
    // )

    // Always use ID 1
    this.standardService
      .updateStandard(1, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.successMessage = message
          this.saving = false
          this.notificationService.showSuccess("Standard configuration updated successfully!...", 3000)
          // Redirect after successful update
          setTimeout(() => {
            this.router.navigate(["/employee/settings/general-settings"])
          }, 2000)
        },
        error: (error) => {
          this.error = error.message
          this.saving = false
          this.notificationService.showError("Failed to update standard configuration")
          console.error("Error updating standard:", error)
        },
      })
  }

  onCancel(): void {
    this.router.navigate(["/employee/settings/general-settings"])
  }

  onReset(): void {
    if (this.standard) {
      this.populateForm(this.standard)
      this.error = null
      this.successMessage = null
    } else {
      this.notificationService.showWarning("No original data to reset to")
    }
  }

  // onPreview(): void {
  //   if (this.standardForm.valid) {
  //     const formValue = this.standardForm.value
  //     const calculated = this.standardService.calculateDerivedValues(formValue)

  //     this.notificationService.showInfo(
  //       `Preview: Total value would be ${this.formatCurrency(calculated.totalForStandardWeight)}`,
  //       5000,
  //     )
  //   } else {
  //     this.notificationService.showWarning("Please fill in all required fields to preview")
  //   }
  // }

  private markFormGroupTouched(): void {
    Object.keys(this.standardForm.controls).forEach((key) => {
      const control = this.standardForm.get(key)
      control?.markAsTouched()
    })
  }

  // Getter methods for form controls
  get standardWeight() {
    return this.standardForm.get("standardWeight")
  }
  get villagePrice() {
    return this.standardForm.get("villagePrice")
  }
  get kgPrice() {
    return this.standardForm.get("kgPrice")
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.standardForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  getFieldError(fieldName: string): string {
    const field = this.standardForm.get(fieldName)
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors["required"]) {
        return `${this.getFieldLabel(fieldName)} is required`
      }
      if (field.errors["min"]) {
        return `${this.getFieldLabel(fieldName)} must be greater than ${field.errors["min"].min}`
      }
      if (field.errors["max"]) {
        return `${this.getFieldLabel(fieldName)} must be less than ${field.errors["max"].max}`
      }
    }
    return ""
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      standardWeight: "Standard Weight",
      villagePrice: "Village Price",
      kgPrice: "KG Price",
    }
    return labels[fieldName] || fieldName
  }

  // Calculated values
  get calculatedPricePerGram(): number {
    const kgPrice = this.standardForm.get("kgPrice")?.value
    return kgPrice ? kgPrice / 1000 : 0
  }

  get calculatedTotalForStandardWeight(): number {
    const standardWeight = this.standardForm.get("standardWeight")?.value
    const kgPrice = this.standardForm.get("kgPrice")?.value
    return standardWeight && kgPrice ? standardWeight * kgPrice : 0
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  formatWeight(value: number): string {
    return `${value} kg`
  }
}
