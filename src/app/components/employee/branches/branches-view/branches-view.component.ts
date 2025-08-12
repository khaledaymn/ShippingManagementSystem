import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { Subject, takeUntil, debounceTime, forkJoin } from "rxjs";
import { TableComponent } from "../../../../shared/table/table.component";
import { BranchService } from "../../../../core/services/branch.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { Branch, BranchParams } from "../../../../core/models/branch";
import { TableConfig, TableData, TableEvent } from "../../../../core/models/table";
import { City } from "../../../../core/models/city";
import { ConfirmationDialogData } from "../../../../core/models/confirmation-dialog-data";
import { PaginationResponse } from "../../../../core/models/response";
import { NotificationComponent } from "../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent } from "../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-branches-view",
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, NotificationComponent, ConfirmationDialogComponent],
  templateUrl: "./branches-view.component.html",
  styleUrls: ["./branches-view.component.css"],
})
export class BranchesViewComponent implements OnInit, OnDestroy {
  tableConfig: TableConfig = {
    searchable: true,
    sortable: true,
    pagination: true,
    pageSizeOptions: [5, 10, 25, 50],
    columns: [
      {
        key: "id",
        label: "ID",
        type: "number",
        sortable: true,
        width: "80px",
      },
      {
        key: "name",
        label: "Branch Name",
        type: "text",
        sortable: true,
      },
      {
        key: "location",
        label: "Location",
        type: "text",
        sortable: false,
      },
      {
        key: "cityName",
        label: "City",
        type: "text",
        sortable: true,
      },
      {
        key: "creationDate",
        label: "Created Date",
        type: "date",
        sortable: true,
        width: "140px",
      },
      {
        key: "isDeleted",
        label: "Status",
        type: "action",
        sortable: false,
        width: "100px",
      },
    ],
    actions: [
      {
        action: "edit",
        label: "Edit Branch",
        icon: "bi-pencil",
        color: "primary",
      },
    ],
    filters: [
      {
        key: "cityId",
        label: "City",
        type: "select",
        options: [],
      },
      {
        key: "isDeleted",
        label: "Status",
        type: "select",
        options: [
          { value: false, label: "Active" },
          { value: true, label: "Deleted" },
        ],
      },
    ],
  };

  tableData: TableData = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 10,
  };

  loading = false;
  error: string | null = null;
  selectedBranches: Branch[] = [];
  cities: City[] = [];

  currentParams: BranchParams = {
    pageIndex: 1,
    pageSize: 10,
  };

  showConfirmDialog = false;
  confirmDialogData: ConfirmationDialogData = {
    title: "Confirm Delete",
    message: "Are you sure you want to delete this branch?",
    type: "danger",
    icon: "bi-trash",
  };

  confirmDialogLoading = false;
  pendingDeleteId: number | null = null;
  pendingBulkDelete = false;
  canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<BranchParams>();
  private filterSubject$ = new Subject<BranchParams>();

  constructor(
    private branchService: BranchService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadBranches();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadBranches();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.loadCities();
    this.loadBranches();
    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canCreate = this.authService.hasPermission('ChargeTypes', 'Create') ||
      this.authService.getUserRole() == 'Admin';
    this.canEdit = this.authService.hasPermission('ChargeTypes', 'Edit')||
      this.authService.getUserRole() == 'Admin';
    this.canDelete = this.authService.hasPermission('ChargeTypes', 'Delete')||
      this.authService.getUserRole() == 'Admin';

    if (!this.canDelete) {
      this.tableConfig.columns = this.tableConfig.columns.filter(
        (col) => col.key !== 'isDeleted'
      );
    }

    if (!this.canEdit) {
      this.tableConfig.actions = [];
    }

  }

  private loadCities(): void {
    this.branchService
      .getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cities) => {
          this.cities = cities.data as City[];
          const cityFilter = this.tableConfig.filters?.find((f) => f.key === "cityId");
          if (cityFilter) {
            cityFilter.options = cities.data.map((city) => ({
              value: city.id.toString(),
              label: city.name,
            }));
          }
        },
        error: (error) => {
          console.error("Failed to load cities:", error);
          this.notificationService.showError(`Failed to load city data: ${error.message}`, 8000);
        },
      });
  }

  private loadBranches(): void {
    this.loading = true;
    this.error = null;

    this.branchService
      .getAllBranches(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponse<Branch>) => {
          this.tableData = {
            items: response.data as Branch[] || [],
            totalCount: response.totalCount || 0,
            pageIndex: response.pageIndex || 1,
            pageSize: response.pageSize || 10,
          };
          this.loading = false;
          if (this.tableData.items.length > 0) {
        this.notificationService.showSuccess("Branches loaded successfully")

          } else {
            this.notificationService.showWarning("No branches found.", 6000);
          }
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.notificationService.showError(`Failed to load branches: ${error.message}`, 8000);
        },
      });
  }

  onTableEvent(event: TableEvent): void {
    try {
      switch (event.type) {
        case "search":
          this.handleSearch(event.data as { search?: string });
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "filter":
          this.handleFilter(event.data as { cityId?: string; isDeleted?: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: Branch });
          break;
        case "update":
          this.handleDelete(event.data as { action: string; item: Branch });
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
      console.warn("Invalid search data:", data);
      this.notificationService.showWarning("Invalid search input", 6000);
      return;
    }

    const newParams = {
      ...this.currentParams,
      search: data.search?.trim() || undefined,
      pageIndex: 1,
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.searchSubject$.next(newParams);
    }
  }

  private handleSort(data: { column: string; direction: string }): void {
    if (!data?.column || !data?.direction) {
      console.warn("Invalid sort data:", data);
      this.notificationService.showWarning("Invalid sort parameters", 6000);
      return;
    }

    const newParams = {
      ...this.currentParams,
      sort: `${data.column}_${data.direction}`,
      pageIndex: 1,
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadBranches();
    }
  }

  private handleFilter(data: { cityId?: string; isDeleted?: string }): void {
    if (!data) {
      console.warn("Invalid filter data:", data);
      this.notificationService.showWarning("Invalid filter input", 6000);
      return;
    }

    const newParams: BranchParams = {
      ...this.currentParams,
      pageIndex: 1,
    };

    if (data.cityId) {
      const cityId = Number.parseInt(data.cityId);
      newParams.cityId = isNaN(cityId) ? undefined : cityId;
    } else {
      newParams.cityId = undefined;
    }

    if (data.isDeleted !== undefined && data.isDeleted !== "") {
      newParams.isDeleted = data.isDeleted === "true";
    } else {
      newParams.isDeleted = undefined;
    }

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.filterSubject$.next(newParams);
    }
  }

  private handlePageChange(data: { pageIndex: number; pageSize: number }): void {
    if (!data || typeof data.pageIndex !== "number" || typeof data.pageSize !== "number") {
      console.warn("Invalid pagination data:", data);
      this.notificationService.showWarning("Invalid pagination parameters", 6000);
      return;
    }

    const newParams = {
      ...this.currentParams,
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadBranches();
    }
  }


  private handleAction(data: { action: string; item: Branch }): void {
    if (!data?.action || !data?.item) {
      console.warn("Invalid action data:", data);
      this.notificationService.showWarning("Invalid action data", 6000);
      return;
    }

    switch (data.action) {
      case "view":
        this.viewBranch(data.item);
        break;
      case "edit":
        this.editBranch(data.item);
        break;
      case "delete":
        this.deleteBranch(data.item);
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  private handleDelete(data: any): void {
    if (!this.canDelete) {
      this.notificationService.showWarning('You do not have permission to delete.', 6000);
      return;
    }

    this.deleteBranch(data);
  }

  viewBranch(branch: Branch): void {
    this.router.navigate(["/employee/settings/branches", branch.id]);
  }

  editBranch(branch: Branch): void {
    this.router.navigate(["/employee/settings/branches/edit", branch.id]);
  }

  createBranch(): void {
    this.router.navigate(["/employee/settings/branches/create"]);
  }

  deleteBranch(branch: any): void {
     if (!this.canDelete) {
      this.notificationService.showWarning('You do not have permission to delete.', 6000);
      return;
    }

    console.log(branch);

    this.confirmDialogData = {
      title: "Delete Branch",
      message: `Are you sure you want to delete "${branch.value}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      icon: "bi-trash",
    };
    this.pendingDeleteId = branch.id;
    this.pendingBulkDelete = false;
    this.showConfirmDialog = true;
  }

  bulkDeleteBranches(): void {
    if (this.selectedBranches.length === 0) {
      this.notificationService.showWarning("Please select branches to delete", 6000);
      return;
    }

    this.confirmDialogData = {
      title: "Delete Multiple Branches",
      message: `Are you sure you want to delete ${this.selectedBranches.length} selected branch${this.selectedBranches.length === 1 ? "" : "es"}? This action cannot be undone.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
      icon: "bi-trash",
    };
    this.pendingBulkDelete = true;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    this.confirmDialogLoading = true;
    this.notificationService.showInfo("Deleting branch(es)...", 3000);

    if (this.pendingBulkDelete) {
      const deleteObservables = this.selectedBranches.map((branch) =>
        this.branchService.deleteBranch(branch.id)
      );

      forkJoin(deleteObservables)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.confirmDialogLoading = false;
            this.showConfirmDialog = false;
            this.selectedBranches = [];
            this.loadBranches();
            this.notificationService.showSuccess(
              `Successfully deleted ${this.selectedBranches.length} branch${this.selectedBranches.length === 1 ? "" : "es"}`,
              5000
            );
          },
          error: (error) => {
            this.confirmDialogLoading = false;
            this.showConfirmDialog = false;
            this.notificationService.showError(`Failed to delete some branches: ${error.message}`, 8000);
          },
          complete: () => {
            this.confirmDialogLoading = false;
          },
        });
    } else if (this.pendingDeleteId) {
      this.branchService
        .deleteBranch(this.pendingDeleteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.confirmDialogLoading = false;
            this.showConfirmDialog = false;
            this.pendingDeleteId = null;
            this.loadBranches();
            this.notificationService.showSuccess("Branch deleted successfully", 5000);
          },
          error: (error) => {
            this.confirmDialogLoading = false;
            this.showConfirmDialog = false;
            this.notificationService.showError(`Failed to delete branch: ${error.message}`, 8000);
          },
          complete: () => {
            this.confirmDialogLoading = false;
          },
        });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteId = null;
    this.pendingBulkDelete = false;
    this.confirmDialogLoading = false;
  }

  refreshData(): void {
    this.loadBranches();
  }

  exportBranches(): void {
    if (this.loading || !this.tableData?.items?.length) {
      this.notificationService.showWarning("No data to export!", 6000);
      return;
    }

    const exportColumns = this.tableConfig.columns
      .filter((col) => col.type !== "action")
      .map((col) => ({
        key: col.key,
        label: col.label,
      }));

    const headers = exportColumns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

    const csvData = this.tableData.items.map((item) => {
      return exportColumns
        .map((col) => {
          const value = item[col.key as keyof Branch];
          const formattedValue = value === true ? "Active" : value === false ? "Inactive" : value ?? "";
          return `"${String(formattedValue).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Branches_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }

}
