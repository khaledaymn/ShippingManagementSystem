import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { MerchantService } from "../../../../../core/services/merchant.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { Merchant, SpecialDeliveryPrice } from "../../../../../core/models/merchant";
import { Role } from "../../../../../core/models/user";

@Component({
  selector: "app-merchant-details",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./merchants-details.component.html",
  styleUrls: ["./merchants-details.component.css"],
})
export class MerchantsDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  merchant: Merchant | null = null;
  isLoading = false;
  errorMessage = "";
  merchantId: string | null = null;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private merchantService: MerchantService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.merchantId = this.route.snapshot.paramMap.get("id");

    if (this.merchantId) {
      this.loadMerchantDetails(this.merchantId);
    } else {
      this.notificationService.showError("Invalid merchant ID", 8000);
      this.router.navigate(["/employee/users/merchants"]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canEdit = this.authService.hasPermission("Merchants", "UPDATE") || this.authService.getUserRole() === Role.ADMIN;
  }

  private loadMerchantDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.merchantService
      .getMerchantById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (merchant) => {
          console.log(merchant);

          this.merchant = merchant;
          this.isLoading = false;
          this.notificationService.showSuccess("Merchant details loaded successfully", 5000);
        },
        error: (error) => {
          this.errorMessage = error.message || "Failed to load merchant details";
          this.notificationService.showError(this.errorMessage, 8000);
          this.isLoading = false;
        },
      });
  }

  onEdit(): void {
    if (this.merchantId) {
      this.router.navigate(["/employee/users/merchants/edit", this.merchantId]);
    }
  }

  onBack(): void {
    this.router.navigate(["/employee/users/merchants"]);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  getStatusClass(isDeleted: boolean): string {
    return isDeleted ? "status-inactive" : "status-active";
  }

  getStatusText(isDeleted: boolean): string {
    return isDeleted ? "Inactive" : "Active";
  }
}
