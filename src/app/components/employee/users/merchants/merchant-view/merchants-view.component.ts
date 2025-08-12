import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, debounceTime } from "rxjs";
import { Merchant, MerchantQueryParams } from "../../../../../core/models/merchant";
import { MerchantService } from "../../../../../core/services/merchant.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { TableComponent } from "../../../../../shared/table/table.component";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "../../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { TableConfig, TableData, TableEvent } from "../../../../../core/models/table";

@Component({
  selector: "app-merchants-view",
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, NotificationComponent, ConfirmationDialogComponent],
  templateUrl: "./merchants-view.component.html",
  styleUrls: ["./merchants-view.component.css"],
})
export class MerchantsViewComponent implements OnInit, OnDestroy {
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
      { key: "storeName", label: "Store Name", type: "text", sortable: true, align: "left" },
      {
        key: "rejectedOrderPrecentage",
        label: "Rejected %",
        type: "text",
        sortable: true,
        align: "center",
      },
      { key: "isDeleted", label: "Status", type: "action", sortable: false, width: "100px", align: "center" }
    ],
    actions: [
      { action: "edit", label: "Edit Merchant", icon: "bi-pencil", color: "primary", visible: () => this.canEdit },
      { action: "details", label: "View Details", icon: "bi-eye", color: "secondary" },
      { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning" ,visible: () => this.canDelete}
    ],
    filters: [
      { key: "search", label: "Search", type: "text", placeholder: "Search by merchant name..." },
      { key: "branch", label: "Branch", type: "text", placeholder: "Filter by branch" },
      {
        key: "isDeleted",
        label: "Status",
        type: "select",
        options: [
          { value: "true", label: "Inactive" },
          { value: "false", label: "Active" }
        ],
        placeholder: "Filter by status"
      }
    ]
  };

  tableData: TableData<Merchant> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5
  };

  isLoading = false;
  error: string | null = null;
  selectedMerchants: Merchant[] = [];
  dialogData: ConfirmationDialogData = {};
  showConfirmDialog = false;

  canCreate = false;
  canEdit = false;
  canDelete = false;

  currentParams: MerchantQueryParams = {
    pageIndex: 1,
    pageSize: 10
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<MerchantQueryParams>();
  private filterSubject$ = new Subject<MerchantQueryParams>();

  constructor(
    private merchantService: MerchantService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadMerchants();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadMerchants();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadMerchants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Merchants", "Create") || userRole === "Admin";
    this.canEdit = this.authService.hasPermission("Merchants", "Edit") || userRole === "Admin";
    this.canDelete = this.authService.hasPermission("Merchants", "Delete") || userRole === "Admin";

    if (!this.canDelete) {
      this.tableConfig.columns = this.tableConfig.columns.filter(
        (col) => col.key !== 'isDeleted'
      );
    }

  }

  private loadMerchants(): void {
    this.isLoading = true;
    this.error = null;

    console.log(this.currentParams);

    this.merchantService
      .getMerchants(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as Merchant[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.isLoading = false;
          if (this.tableData.items.length === 0) {
            this.notificationService.showWarning("No merchants found.", 6000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message || "Failed to load merchants";
          this.notificationService.showError(`Failed to load merchants: ${error.message}`, 8000);
        }
      });
  }

  onTableEvent(event: TableEvent): void {
    try {
      switch (event.type) {
        case "search":
          this.handleSearch(event.data as { search?: string });
          break;
        case "filter":
          this.handleFilter(event.data as Partial<MerchantQueryParams>);
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: Merchant });
          break;
        case "update":
          this.confirmDelete(event.data as { id: string; value: boolean });
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

  private handleFilter(data: Partial<MerchantQueryParams>): void {

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
    this.loadMerchants();
    return;
  }
  if (!data) {
    console.warn("Invalid filter data:", data);
    this.notificationService.showWarning("Invalid filter input", 6000);
    return;
  }

    const newParams: MerchantQueryParams = {
      ...this.currentParams,
      pageIndex: 1
    };

    if (data.search !== undefined) {
      newParams.search = data.search?.trim() || undefined;
    }

    if (data.isActive !== undefined) {
      newParams.isActive = !data.isActive;
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
      storeName: "storeName",
      rejectedOrderPercent: "rejectedOrderPercent"
    };

    const mappedColumn = columnMap[data.column] || data.column;
    const newParams = {
      ...this.currentParams,
      sort: `${mappedColumn}_${data.direction}`,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadMerchants();
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
      this.loadMerchants();
    }
  }

  private handleAction(data: { action: string; item: Merchant }): void {
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
        this.confirmDelete({ id: data.item.id, value: data.item.isDeleted });
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  onAdd(): void {
    if (this.canCreate) {
      this.router.navigate(["/employee/users/merchants/create"]);
    } else {
      this.notificationService.showWarning("You do not have permission to create merchants.", 6000);
    }
  }

  onEdit(merchant: Merchant): void {
    if (this.canEdit) {
      this.router.navigate(["/employee/users/merchants/edit", merchant.id]);
    } else {
      this.notificationService.showWarning("You do not have permission to edit merchants.", 6000);
    }
  }

  onDetails(merchant: Merchant): void {
    this.router.navigate(["/employee/users/merchants/details", merchant.id]);
  }

  confirmDelete(data: { id: string; value: boolean }): void {
    if (!this.canDelete) {
      this.notificationService.showWarning("You do not have permission to delete or activate merchants.", 6000);
      return;
    }
    const merchant = this.tableData.items.find((m) => m.id === data.id);
    if (!merchant) {
      this.notificationService.showWarning("Merchant not found.", 6000);
      return;
    }
    console.log(merchant);

    if (!merchant.isDeleted) {
      this.dialogData = {
        title: "Activate Merchant",
        message: `Are you sure you want to activate the merchant "${merchant.name}"? This will restore their account to active status.`,
        confirmText: "Activate",
        cancelText: "Cancel",
        type: "warning",
        icon: "bi-arrow-counterclockwise"
      };
    } else {
      this.dialogData = {
        title: "Delete Merchant",
        message: `Are you sure you want to delete the merchant "${merchant.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        icon: "bi-trash"
      };
    }
    this.selectedMerchants = [merchant];
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedMerchants.length !== 1) {
      this.isLoading = false;
      this.showConfirmDialog = false;
      this.notificationService.showWarning("Invalid merchant selection.", 6000);
      return;
    }

    this.isLoading = true;
    const merchant = this.selectedMerchants[0];
    const isActivate = this.dialogData.confirmText === "Activate";

    console.log(`onConfirmDelete triggered: Action=${isActivate ? 'Activate' : 'Delete'}, Merchant ID=${merchant.id}, Merchant Name=${merchant.name}`);

    this.merchantService.deleteMerchant(merchant.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Action completed: ${isActivate ? 'Activated' : 'Deleted'} merchant ID=${merchant.id}`);
        this.isLoading = false;
        this.showConfirmDialog = false;
        this.notificationService.showSuccess(
          isActivate ? `Merchant "${merchant.name}" activated successfully!` : `Merchant "${merchant.name}" deleted successfully!`,
          5000
        );
        this.selectedMerchants = [];
        this.loadMerchants();
      },
      error: (error) => {
        console.error(`Action failed: ${isActivate ? 'Activate' : 'Delete'} merchant ID=${merchant.id}`, error);
        this.isLoading = false;
        this.showConfirmDialog = false;
        this.notificationService.showError(
          isActivate ? `Failed to activate merchant: ${error.message}` : `Failed to delete merchant: ${error.message}`,
          8000
        );
      }
    });
  }

  onCancelDelete(): void {
    console.log('onCancelDelete triggered');
    this.showConfirmDialog = false;
    this.selectedMerchants = [];
  }

  onExport(): void {
    if (this.isLoading || !this.tableData?.items?.length) {
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
          let value = item[col.key as keyof Merchant];
          if (col.key === "isDeleted") {
            value = value ? "Inactive" : "Active";
          } else if (col.key === "branches") {
            value = Array.isArray(value) ? value.map((b: any) => b.name).join(", ") : "No branches";
          } else if (col.key === "rejectedOrderPercent") {
            value = `${value}%`;
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
    link.setAttribute('download', `Merchants_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }

  refreshData(): void {
    this.loadMerchants();
  }
}
