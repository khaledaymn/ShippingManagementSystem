import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { ShippingRepresentativeService } from "../../../../../core/services/shipping-representative.service";
import { GovernorateService } from "../../../../../core/services/governorate.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { ShippingRepresentative, ShippingRepresentativeQueryParams, DiscountType } from "../../../../../core/models/shipping-representative";
import { Governorate } from "../../../../../core/models/governorate";
import { Role } from "../../../../../core/models/user";
import { TableComponent } from "../../../../../shared/table/table.component";
import { TableConfig, TableData, TableEvent } from "../../../../../core/models/table";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "../../../../../shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-shipping-representatives-view",
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, NotificationComponent, ConfirmationDialogComponent],
  templateUrl: "./shipping-representatives-view.component.html",
  styleUrls: ["./shipping-representatives-view.component.css"],
})
export class ShippingRepresentativesViewComponent implements OnInit, OnDestroy {
  @ViewChild(ConfirmationDialogComponent) confirmDialog!: ConfirmationDialogComponent;

  tableConfig: TableConfig = {
    searchable: true,
    sortable: true,
    pagination: true,
    pageSizeOptions: [5, 10, 25, 50],
    columns: [
      { key: "name", label: "Name", type: "text", sortable: true, align: "left" },
      { key: "email", label: "Email", type: "text", sortable: true, align: "left" },
      { key: "phoneNumber", label: "Phone Number", type: "text", sortable: false, align: "left" },
      { key: "hiringDate", label: "Hiring Date", type: "date", sortable: true, width: "140px", align: "center" },
      { key: "isDeleted", label: "Status", type: "action", sortable: false, width: "100px", align: "center", format: (value: boolean) => value ? "Inactive" : "Active" }
    ],
    actions: [
      { action: "edit", label: "Edit Representative", icon: "bi-pencil", color: "primary" },
      { action: "details", label: "View Details", icon: "bi-eye", color: "secondary" },
      { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning"}
    ],
    filters: [
      { key: "search", label: "Search", type: "text", placeholder: "Search by name, email, or phone..." },
      {
        key: "isDeleted",
        label: "Status",
        type: "select",
        options: [
          { value: "", label: "All Statuses" },
          { value: "false", label: "Active" },
          { value: "true", label: "Inactive" }
        ],
        placeholder: "Filter by status"
      }
    ]
  };

  tableData: TableData<ShippingRepresentative> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5
  };

  loading = false;
  error: string | null = null;
  selectedRepresentatives: ShippingRepresentative[] = [];
  dialogData: ConfirmationDialogData = {
    title: "",
    message: "",
  };
  showConfirmDialog = false;

  canCreate = false;
  canEdit = false;
  canDelete = false;

  governorates: Governorate[] = [];

  currentParams: ShippingRepresentativeQueryParams = {
    pageIndex: 1,
    pageSize: 10
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<ShippingRepresentativeQueryParams>();
  private filterSubject$ = new Subject<ShippingRepresentativeQueryParams>();

  constructor(
    private shippingRepresentativeService: ShippingRepresentativeService,
    private governorateService: GovernorateService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadShippingRepresentatives();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadShippingRepresentatives();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadGovernorates();
    this.loadShippingRepresentatives();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("ShippingRepresentatives", "Create") || userRole === Role.ADMIN;
    this.canEdit = this.authService.hasPermission("ShippingRepresentatives", "Edit") || userRole === Role.ADMIN;
    this.canDelete = this.authService.hasPermission("ShippingRepresentatives", "Delete") || userRole === Role.ADMIN;
    this.updateTableActions();
  }

  private updateTableActions(): void {
    this.tableConfig.actions = [
      { action: "edit", label: "Edit Representative", icon: "bi-pencil", color: "primary" as "primary", visible: () => this.canEdit },
      { action: "details", label: "View Details", icon: "bi-eye", color: "secondary" as "secondary", visible: () => true },
      { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning" as "warning", visible: () => this.canDelete }
    ].filter(action => action.visible);
  }

  private loadGovernorates(): void {
    this.governorateService.getActiveGovernorates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (governorates) => {
          this.governorates = governorates;
          const governorateFilter = this.tableConfig.filters && this.tableConfig.filters.find(f => f.key === "governorateId");
          if (governorateFilter) {
            governorateFilter.options = [
              { value: "", label: "All Governorates" },
              ...governorates.map(g => ({ value: g.id.toString(), label: g.name }))
            ];
          }
          this.notificationService.showSuccess("Governorates loaded successfully", 5000);
        },
        error: (error) => {
          this.notificationService.showError("Error loading governorates: " + error.message, 8000);
        }
      });
  }

  private loadShippingRepresentatives(): void {
    this.loading = true;
    this.error = null;

    this.shippingRepresentativeService
      .getShippingRepresentatives(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as ShippingRepresentative[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.loading = false;
          if (this.tableData.items.length === 0) {
            this.notificationService.showWarning("No shipping representatives found.", 6000);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || "Failed to load shipping representatives";
          this.notificationService.showError(`Failed to load shipping representatives: ${error.message}`, 8000);
        }
      });
  }

  formatCompanyPercentage(items: ShippingRepresentative[]) {
    return items.map(item =>
      item.companyPercentage !== undefined && item.companyPercentage !== null
        ? item.discountType === DiscountType.Fixed
          ? `$${item.companyPercentage}`
          : `${item.companyPercentage}%`
        : ""
    );
  }

  onTableEvent(event: TableEvent): void {
    try {
      switch (event.type) {
        case "search":
          this.handleSearch(event.data as { search?: string });
          break;
        case "filter":
          this.handleFilter(event.data as Partial<ShippingRepresentativeQueryParams>);
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: ShippingRepresentative });
          break;
        case "update":
          this.confirmToggleStatus(event.data as { id: string; value: boolean });
          break;
        default:
          console.warn(`Unhandled table event type: ${event.type}`);
          this.notificationService.showWarning("Invalid table action", 6000);
      }
    } catch (error) {
      console.error("Error processing table event:", error);
      this.notificationService.showError("An error occurred while processing the table action", 8000);
    }
  }

  private handleSearch(data: { search?: string }): void {
    if (!data || typeof data.search !== "string") {
      return;
    }

    const newParams = {
      ...this.currentParams,
      search: data.search?.trim() || undefined,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.searchSubject$.next(newParams);
    }
  }

 private handleFilter(data: Partial<ShippingRepresentativeQueryParams>): void {
    const defaultParams = {
      pageIndex: 1,
      pageSize: 10,
    };
  const isEmpty = (obj: any): boolean => {
    return Object.keys(obj).length === 0;
  };

  if(isEmpty(data)){
    this.currentParams = {
      ...defaultParams,
    }
    this.loadShippingRepresentatives();
    return;
  }
  if (!data) {
    console.warn("Invalid filter data:", data);
    this.notificationService.showWarning("Invalid filter input", 6000);
    return;
  }

    const newParams: ShippingRepresentativeQueryParams = {
      ...this.currentParams,
      pageIndex: 1
    };

    if (data.search !== undefined) {
      newParams.search = data.search?.trim() || undefined;
    }

    if (data.governorateId !== undefined) {
      newParams.governorateId = data.governorateId ? Number(data.governorateId) : undefined;
    }

    if (data.isActive !== undefined) {
      newParams.isActive = data.isActive;
    }

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.filterSubject$.next(newParams);
    }
  }

  private handleSort(data: { column: string; direction: string }): void {
    if (!data?.column || !data?.direction) {
      return;
    }

    const columnMap: { [key: string]: string } = {
      name: "name",
      email: "email",
      discountType: "discountType",
      companyPercentage: "companyPercentage",
      hiringDate: "hiringDate"
    };

    const mappedColumn = columnMap[data.column] || data.column;
    const newParams = {
      ...this.currentParams,
      sort: `${mappedColumn}_${data.direction}`,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadShippingRepresentatives();
    }
  }

  private handlePageChange(data: { pageIndex: number; pageSize: number }): void {
    if (!data || typeof data.pageIndex !== "number" || typeof data.pageSize !== "number") {
      return;
    }

    const newParams = {
      ...this.currentParams,
      pageIndex: data.pageIndex,
      pageSize: data.pageSize
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadShippingRepresentatives();
    }
  }

  private handleAction(data: { action: string; item: ShippingRepresentative }): void {
    if (!data?.action || !data?.item) {
      console.warn("Invalid action data:", data);
      this.notificationService.showWarning("Invalid action data", 6000);
      return;
    }

    switch (data.action) {
      case "edit":
        this.onEdit(data.item);
        break;
      case "details":
        this.onDetails(data.item);
        break;
      case "update":
        this.confirmToggleStatus({ id: data.item.id, value: data.item.isDeleted });
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  onAdd(): void {
    if (this.canCreate) {
      this.router.navigate(["/employee/users/shipping-representatives/create"]);
    } else {
      this.notificationService.showWarning("You do not have permission to create shipping representatives.", 6000);
    }
  }

  onEdit(representative: ShippingRepresentative): void {
    if (this.canEdit) {
      this.router.navigate(["/employee/users/shipping-representatives/edit", representative.id]);
    } else {
      this.notificationService.showWarning("You do not have permission to edit shipping representatives.", 6000);
    }
  }

  onDetails(representative: ShippingRepresentative): void {
    this.router.navigate(["/employee/users/shipping-representatives/details", representative.id]);
  }

  confirmToggleStatus(data: { id: string; value: boolean }): void {
    if (!this.canDelete) {
      this.notificationService.showWarning("You do not have permission to delete or activate shipping representatives.", 6000);
      return;
    }

    const representative = this.tableData.items.find((r) => r.id === data.id);
    if (!representative) {
      this.notificationService.showWarning("Shipping representative not found.", 6000);
      return;
    }

    if (representative.isDeleted) { // isDeleted: false means active, so deactivate
      this.dialogData = {
        title: "Delete Shipping Representative",
        message: `Are you sure you want to Delete the shipping representative "${representative.name}"? This will set their account to inactive status.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        icon: "bi-trash"
      };
    } else { // isDeleted: true means inactive, so activate
      this.dialogData = {
        title: "Activate Shipping Representative",
        message: `Are you sure you want to activate the shipping representative "${representative.name}"? This will restore their account to active status.`,
        confirmText: "Activate",
        cancelText: "Cancel",
        type: "warning",
        icon: "bi-arrow-counterclockwise"
      };
    }
    this.selectedRepresentatives = [representative];
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedRepresentatives.length !== 1) {
      this.loading = false;
      this.showConfirmDialog = false;
      this.notificationService.showWarning("Invalid shipping representative selection.", 6000);
      return;
    }

    this.loading = true;
    const representative = this.selectedRepresentatives[0];
    const isActivate = this.dialogData.confirmText === "Activate";

    console.log(`onConfirmDelete triggered: Action=${isActivate ? 'Activate' : 'Deactivate'}, Representative ID=${representative.id}, Representative Name=${representative.name}`);

    this.shippingRepresentativeService.deleteShippingRepresentative(representative.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Action completed: ${isActivate ? 'Activated' : 'Deactivated'} representative ID=${representative.id}`);
        this.loading = false;
        this.showConfirmDialog = false;
        this.notificationService.showSuccess(
          isActivate ? `Shipping representative "${representative.name}" activated successfully!` : `Shipping representative "${representative.name}" deactivated successfully!`,
          5000
        );
        this.selectedRepresentatives = [];
        this.loadShippingRepresentatives();
      },
      error: (error) => {
        console.error(`Action failed: ${isActivate ? 'Activate' : 'Deactivate'} representative ID=${representative.id}`, error);
        this.loading = false;
        this.showConfirmDialog = false;
        this.notificationService.showError(
          isActivate ? `Failed to activate shipping representative: ${error.message}` : `Failed to deactivate shipping representative: ${error.message}`,
          8000
        );
      }
    });
  }

  onCancelDelete(): void {
    console.log('onCancelDelete triggered');
    this.showConfirmDialog = false;
    this.selectedRepresentatives = [];
  }

  refreshData(): void {
    this.loadShippingRepresentatives();
  }

  onExport(): void {
    if (this.loading || !this.tableData?.items?.length) {
      this.notificationService.showWarning("No data to export!", 6000);
      return;
    }

    const exportColumns = this.tableConfig.columns
      .filter((col) => col.type !== "action")
      .map((col) => ({
        key: col.key,
        label: col.label
      }));

    const headers = exportColumns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

    const csvData = this.tableData.items.map((item) => {
      return exportColumns
        .map((col) => {
          let value = item[col.key as keyof ShippingRepresentative];
          if (col.key === "isDeleted") {
            value = value ? "Inactive" : "Active";
          } else if (col.key === "governorates") {
            value = Array.isArray(value) ? this.formatGovernoratesList(value, true) : "";
          } else if (col.key === "discountType") {
            value = value === DiscountType.Fixed ? "Fixed" : "Percentage";
          } else if (col.key === "hiringDate") {
            value = this.formatDate(value as Date);
          }
          const formattedValue = value ?? "";
          return `"${String(formattedValue).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Shipping_Representatives_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }

  formatGovernoratesList(governorates: string[], fullList: boolean = false): string {
    if (!governorates || governorates.length === 0) {
      return "None";
    }
    return fullList ? governorates.join(", ") : governorates.length > 2
      ? `${governorates.slice(0, 2).join(", ")} +${governorates.length - 2} more`
      : governorates.join(", ");
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return "N/A";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return "N/A";
      return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "N/A";
    }
  }
}
