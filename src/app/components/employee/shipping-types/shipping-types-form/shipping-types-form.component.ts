import { Component, OnInit, OnDestroy } from "@angular/core"
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { Subject, takeUntil } from "rxjs"
import { ShippingTypeService } from "../../../../core/services/shipping-type.service"
import { NotificationService } from "../../../../core/services/notification.service"
import { CreateShippingType, ShippingType } from "../../../../core/models/shipping-type"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-shipping-types-form",
  templateUrl: "./shipping-types-form.component.html",
  styleUrls: ["./shipping-types-form.component.css"],
   imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ShippingTypesFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()

  shippingTypeForm: FormGroup
  isEditMode = false
  shippingTypeId: number | null = null
  loading = false
  submitting = false

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shippingTypeService: ShippingTypeService,
    private notificationService: NotificationService,
  ) {
    this.shippingTypeForm = this.createForm()
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true
        this.shippingTypeId = +params["id"]
        this.loadShippingType()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      extraPrice: [0, [Validators.required, Validators.min(0), Validators.max(9999.99)]],
      numOfDay: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
    })
  }

  private loadShippingType(): void {
    if (!this.shippingTypeId) return

    this.loading = true
    this.shippingTypeService
      .getShippingTypeById(this.shippingTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shippingType) => {
          this.shippingTypeForm.patchValue({
            name: shippingType.name,
            extraPrice: shippingType.extraPrice,
            numOfDay: shippingType.numOfDay,
          })
          this.loading = false
        },
        error: (error) => {
          this.loading = false
          this.notificationService.showError(`Failed to load shipping type: ${error.message}`)
          this.router.navigate(["/employee/settings/shipping-types"])
        },
      })
  }

  onSubmit(): void {
    if (this.shippingTypeForm.invalid) {
      this.markFormGroupTouched()
      return
    }

    this.submitting = true
    const formValue = this.shippingTypeForm.value

    if (this.isEditMode && this.shippingTypeId) {
      this.updateShippingType(formValue)
    } else {
      this.createShippingType(formValue)
    }
  }

  private createShippingType(data: CreateShippingType): void {
    this.shippingTypeService
      .createShippingType(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.submitting = false
          this.notificationService.showSuccess(message)
          this.router.navigate(["/employee/settings/shipping-types"])
        },
        error: (error) => {
          this.submitting = false
          this.notificationService.showError(`Failed to create shipping type: ${error.message}`)
        },
      })
  }

  private updateShippingType(data: any): void {
    if (!this.shippingTypeId) return

    const updateData: ShippingType = {
      id: this.shippingTypeId,
      name: data.name,
      extraPrice: data.extraPrice,
      numOfDay: data.numOfDay,
      isDeleted: false,
    }

    this.shippingTypeService
      .updateShippingType(this.shippingTypeId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.submitting = false
          this.notificationService.showSuccess(message)
          this.router.navigate(["/shipping-types"])
          console.log("Edit");

        },
        error: (error) => {
          this.submitting = false
          this.notificationService.showError(`Failed to update shipping type: ${error.message}`)
        },
      })
  }

  private markFormGroupTouched(): void {
    Object.keys(this.shippingTypeForm.controls).forEach((key) => {
      const control = this.shippingTypeForm.get(key)
      control?.markAsTouched()
    })
  }

  onCancel(): void {
    this.router.navigate(["/employee/settings/shipping-types"])
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.shippingTypeForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  getFieldError(fieldName: string): string {
    const field = this.shippingTypeForm.get(fieldName)
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors["required"]) {
        return `${this.getFieldLabel(fieldName)} is required`
      }
      if (field.errors["minlength"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters`
      }
      if (field.errors["maxlength"]) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors["maxlength"].requiredLength} characters`
      }
      if (field.errors["min"]) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["min"].min}`
      }
      if (field.errors["max"]) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors["max"].max}`
      }
    }
    return ""
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: "Name",
      extraPrice: "Extra Price",
      numOfDay: "Delivery Days",
    }
    return labels[fieldName] || fieldName
  }

  get pageTitle(): string {
    return this.isEditMode ? "Edit Shipping Type" : "Create New Shipping Type"
  }

  get submitButtonText(): string {
    if (this.submitting) {
      return this.isEditMode ? "Updating..." : "Creating..."
    }
    return this.isEditMode ? "Update Shipping Type" : "Create Shipping Type"
  }
}
