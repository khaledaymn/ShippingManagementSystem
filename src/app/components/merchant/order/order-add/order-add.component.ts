import { Component, OnInit, OnDestroy } from "@angular/core"
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { Subject, takeUntil } from "rxjs"
import { CommonModule } from "@angular/common"

import { OrderService } from "../../../../core/services/order.service"
import { CityService } from "../../../../core/services/city.service"
import { BranchService } from "../../../../core/services/branch.service"
import { MerchantService } from "../../../../core/services/merchant.service"
import { ShippingTypeService } from "../../../../core/services/shipping-type.service"
import { AuthService } from "../../../../core/services/auth.service"
import { NotificationComponent } from "../../../../shared/notification/notification.component"

import {
  CreateOrderDTO,
  OrderTypeOptions,
  PaymentTypeOptions,
  OrderTypeValues,
  PaymentTypeValues,
} from "../../../../core/models/order"
import { City } from "../../../../core/models/city"
import { Branch } from "../../../../core/models/branch"
import { Merchant } from "../../../../core/models/merchant"
import { ShippingType } from "../../../../core/models/shipping-type"

@Component({
  selector: "app-orders-add",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: "./order-add.component.html",
  styleUrls: ["./order-add.component.css"],
})
export class MerchantOrdersAddComponent implements OnInit, OnDestroy {
  orderForm: FormGroup
  loading = false
  error: string | null = null
  successMessage = ""

  // Dropdown data
  cities: City[] = []
  branches: Branch[] = []
  merchants: Merchant[] = []
  chargeTypes: ShippingType[] = []

  // Options for dropdowns
  orderTypeOptions = OrderTypeOptions
  paymentTypeOptions = PaymentTypeOptions

  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private cityService: CityService,
    private branchService: BranchService,
    private shippingTypeService: ShippingTypeService,
    private authService: AuthService
  ) {
    this.orderForm = this.createOrderForm()
  }

  ngOnInit(): void {
    this.loadDropdownData()
    this.setupShippingToVillageListener()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private createOrderForm(): FormGroup {
    return this.fb.group({
      // Customer Information
      customerName: ["", [Validators.required, Validators.minLength(2)]],
      customerPhone1: ["", [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      customerPhone2: ["", [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      villageAndStreet: ["", [Validators.minLength(5)]],
      notes: [""],

      // Order Details
      orderPrice: [0, [Validators.required, Validators.min(0.01)]],
      shippingToVillage: [false],
      orderType: [OrderTypeValues.DeliveryAtBranch, Validators.required],
      paymentType: [PaymentTypeValues.CashOnDelivery, Validators.required],

      // Location and Service
      cityId: ["", Validators.required],
      chargeTypeId: ["", Validators.required],
      branchId: ["", Validators.required],
      // Products
      products: this.fb.array([this.createProductForm()]),
    })
  }

  private setupShippingToVillageListener(): void {
    this.orderForm.get("shippingToVillage")?.valueChanges.subscribe((isChecked) => {
      const villageAndStreetControl = this.orderForm.get("villageAndStreet")

      if (isChecked) {
        // When checked, make villageAndStreet required
        villageAndStreetControl?.setValidators([Validators.required, Validators.minLength(5)])
      } else {
        // When unchecked, remove validators and clear value
        villageAndStreetControl?.clearValidators()
        villageAndStreetControl?.setValue("")
      }

      villageAndStreetControl?.updateValueAndValidity()
    })
  }

  get shouldShowVillageAndStreet(): boolean {
    return this.orderForm.get("shippingToVillage")?.value === true
  }

  private createProductForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      weight: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    })
  }

  get products(): FormArray {
    return this.orderForm.get("products") as FormArray
  }

  addProduct(): void {
    this.products.push(this.createProductForm())
  }

  removeProduct(index: number): void {
    if (this.products.length > 1) {
      this.products.removeAt(index)
    }
  }

  get totalWeight(): number {
    return this.products.controls.reduce((total, product) => {
      const weight = product.get("weight")?.value || 0
      const quantity = product.get("quantity")?.value || 0
      return total + weight * quantity
    }, 0)
  }

  private loadDropdownData(): void {
    this.loading = true

    // Load cities
    this.cityService
      .getAllCities({ pageIndex: 1, pageSize: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cities = (response.data as City[]) || []
        },
        error: (error) => {
          this.error = "Failed to load cities: " + error.message
        },
      })

    // Load branches
    this.branchService
      .getAllBranches({ pageIndex: 1, pageSize: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.branches = (response.data as Branch[]) || []
        },
        error: (error) => {
          this.error = "Failed to load branches: " + error.message
        },
      })

    // Load charge types (shipping types)
    this.shippingTypeService
      .getAllShippingTypes({ pageIndex: 1, pageSize: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.chargeTypes = (response.data as ShippingType[]) || []
          this.loading = false
        },
        error: (error) => {
          this.error = "Failed to load charge types: " + error.message
          this.loading = false
        },
      })
  }

  private getCurrentUserId(): string | undefined {
    let userId = undefined
    this.authService.currentUser$.subscribe(
      (id) => userId = id?.id
    )
    return userId
  }
  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm)
      return
    }

    this.loading = true
    this.error = null

    const formValue = this.orderForm.value
    const orderData: CreateOrderDTO = {
      customerName: formValue.customerName,
      customerPhone1: formValue.customerPhone1,
      customerPhone2: formValue.customerPhone2 || undefined,
      villageAndStreet: formValue.villageAndStreet,
      notes: formValue.notes || undefined,
      orderPrice: formValue.orderPrice,
      shippingToVillage: formValue.shippingToVillage,
      cityId: Number.parseInt(formValue.cityId, 10),
      chargeTypeId: Number.parseInt(formValue.chargeTypeId, 10),
      branchId: Number.parseInt(formValue.branchId, 10),
      merchantId: this.getCurrentUserId() ?? '',
      orderType: formValue.orderType,
      paymentType: formValue.paymentType,
      products: formValue.products.map((product: any, index: number) => ({
        id: 0, // Will be set by backend
        name: product.name,
        weight: product.weight,
        quantity: product.quantity,
        orderId: 0, // Will be set by backend
      })),
    }

    this.orderService
      .createOrder(orderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.successMessage = message
          this.loading = false
          this.clearMessages()
          // Navigate back to orders list after success
          setTimeout(() => {
            this.router.navigate(["/merchant/orders"])
          }, 2000)
        },
        error: (error) => {
          this.error = error.message
          this.loading = false
        },
      })
  }

  onCancel(): void {
    this.router.navigate(["/merchant/orders"])
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl)
          } else {
            arrayControl.markAsTouched()
          }
        })
      } else {
        control?.markAsTouched()
      }
    })
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = ""
      this.error = null
    }, 3000)
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName)
    return !!(field && field.invalid && field.touched)
  }

  isProductFieldInvalid(productIndex: number, fieldName: string): boolean {
    const field = this.products.at(productIndex).get(fieldName)
    return !!(field && field.invalid && field.touched)
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName)
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`
      if (field.errors["minlength"]) return `${fieldName} is too short`
      if (field.errors["pattern"]) return `${fieldName} format is invalid`
      if (field.errors["min"]) return `${fieldName} must be greater than 0`
    }
    return ""
  }

  getProductFieldError(productIndex: number, fieldName: string): string {
    const field = this.products.at(productIndex).get(fieldName)
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`
      if (field.errors["minlength"]) return `${fieldName} is too short`
      if (field.errors["min"]) return `${fieldName} must be greater than 0`
    }
    return ""
  }
}
