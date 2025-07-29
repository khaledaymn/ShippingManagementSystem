import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Standard } from "../../../../core/models/standard";
import { StandardService } from "../../../../core/services/standard.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { NotificationComponent } from "../../../../shared/notification/notification.component";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-standards-view",
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: "./standards-view.component.html",
  styleUrls: ["./standards-view.component.css"],
})
export class StandardsViewComponent implements OnInit, OnDestroy {
  standards: Standard[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  canEdit: boolean = false;
  constructor(
    private standardService: StandardService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStandards();
    this.subscribeToLoading();
    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(){
     this.canEdit = this.authService.hasPermission('Settings', 'Edit')||
      this.authService.getUserRole() == 'Admin';
  }
  private loadStandards(): void {
    this.standardService
      .getSetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (standards) => {
          this.standards = standards.filter((s) => !s.isDeleted);
          if (this.standards.length > 0) {
          } else {
            this.notificationService.showWarning("No active standards found.", 6000);
          }
          this.error = null;
        },
        error: (error) => {
          this.error = error.message;
          this.notificationService.showError(`Failed to load standards: ${error.message}`, 8000);
          console.error("Error loading standards:", error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.standardService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading = loading;
    });
  }

  onEditStandard(standard: Standard): void {
    this.router.navigate(["/employee/settings/general-settings/edit", standard.id]);
  }

  onRefresh(): void {
    this.loadStandards();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatWeight(value: number): string {
    return `${value} kg`;
  }

  trackByStandardId(index: number, standard: Standard): number {
    return standard.id;
  }

  get singleStandard(): Standard | null {
    return this.standards.length > 0 ? this.standards[0] : null;
  }
}
