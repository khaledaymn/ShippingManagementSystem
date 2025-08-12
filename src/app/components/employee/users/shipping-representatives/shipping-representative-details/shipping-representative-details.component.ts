import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { ShippingRepresentativeService } from "../../../../../core/services/shipping-representative.service"
import { AuthService } from "../../../../../core/services/auth.service"
import { ShippingRepresentative, DiscountType } from "../../../../../core/models/shipping-representative"
import { Role } from "../../../../../core/models/user"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-shipping-representative-details",
  imports:[CommonModule,RouterModule],
  templateUrl: "./shipping-representative-details.component.html",
  styleUrls: ["./shipping-representative-details.component.css"],
})
export class ShippingRepresentativeDetailsComponent implements OnInit {
  shippingRepresentative: ShippingRepresentative | null = null
  loading = false
  error: string | null = null
  shippingRepresentativeId: string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shippingRepresentativeService: ShippingRepresentativeService,
    private authService: AuthService,
  ) {
    this.shippingRepresentativeId = this.route.snapshot.paramMap.get("id") || ""
  }

  ngOnInit(): void {
    this.checkPermissions()
    this.loadShippingRepresentativeDetails()
  }

  private checkPermissions(): void {
    const hasViewPermission =
      this.authService.hasPermission("ShippingRepresentatives", "VIEW") || this.authService.hasRole(Role.ADMIN)
    if (!hasViewPermission) {
      this.router.navigate(["/unauthorized"])
      return
    }
  }

  private loadShippingRepresentativeDetails(): void {
    if (!this.shippingRepresentativeId) {
      this.error = "Invalid shipping representative ID"
      return
    }

    this.loading = true
    this.error = null
    this.shippingRepresentativeService.getShippingRepresentativeById(this.shippingRepresentativeId).subscribe({
      next: (representative) => {
        console.log(representative);

        this.shippingRepresentative = representative
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load shipping representative details: " + error.message
        this.loading = false
      },
    })
  }

  onEdit(): void {
    this.router.navigate(["/employee/users/shipping-representatives/edit", this.shippingRepresentativeId])
  }

  onBack(): void {
    this.router.navigate(["/employee/users/shipping-representatives"])
  }

  getDiscountTypeText(discountType: DiscountType | undefined): string {
    return discountType === DiscountType.Fixed ? "Fixed Amount" : "Percentage"
  }

  getDiscountTypeBadgeClass(discountType: DiscountType | undefined): string {
    return discountType === DiscountType.Fixed ? "badge-info" : "badge-success"
  }

  formatDate(date: Date | undefined): string {
    if(!date){
      date = new Date();
    }
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  canEdit(): boolean {
    return this.authService.hasPermission("ShippingRepresentatives", "UPDATE") ||  this.authService.hasRole(Role.ADMIN)
  }

  companyPercentageSign(): string{
    if(this.shippingRepresentative?.discountType === DiscountType.Fixed)
      return '$';
    else if(this.shippingRepresentative?.discountType === DiscountType.Percentage)
      return '%';
    else
      return '';
  }
}
