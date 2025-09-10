import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, debounceTime, forkJoin } from "rxjs";
import { Governorate, GovernorateParams } from "../../../../../core/models/governorate";
import { GovernorateService } from "../../../../../core/services/governorate.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { TableComponent } from "../../../../../shared/table/table.component";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent } from "../../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { TableConfig, TableData, TableEvent } from "../../../../../core/models/table";
import { ConfirmationDialogData } from "../../../../../core/models/confirmation-dialog-data";

@Component({
  selector: "app-governorates-view",
  standalone: true,
  imports: [CommonModule, TableComponent, NotificationComponent, ConfirmationDialogComponent, RouterModule],
  templateUrl: "./governorate-view.component.html",
  styleUrls: ["./governorate-view.component.css"]
})
export class GovernoratesViewComponent implements OnInit, OnDestroy {
  @ViewChild(ConfirmationDialogComponent) confirmDialog!: ConfirmationDialogComponent;

  tableConfig: TableConfig = {
    searchable: true,
    sortable: true,
    pagination: true,
    pageSizeOptions: [5, 10, 25, 50],
    columns: [
      { key: "name", label: "Governorate Name", sortable: true, type: "text", align: "center" },
      { key: "isDeleted", label: "Status", sortable: false, type: "action", align: "center" }
    ],
    actions: [
      { action: "edit", label: "Edit", icon: "bi-pencil", color: "primary", visible: () => this.canEdit},
      // { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning" }
    ],
    filters: [
      { key: "search", label: "Search", type: "text", placeholder: "Search by governorate name..." },
      {
        key: "isDeleted",
        label: "Status",
        type: "select",
        options: [
          { value: "true", label: "Inactive" },
          { value: "false", label: "Active" }
        ]
      }
    ]
  };

  tableData: TableData<Governorate> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5
  };

  isLoading = false;
  error: string | null = null;
  selectedItems: Governorate[] = [];
 dialogData: ConfirmationDialogData = {
    title: "",
    message: ""
  };
  showDialog = false;

  canCreate = false;
  canEdit = false;
  canDelete = false;

  currentParams: GovernorateParams = {
    pageIndex: 1,
    pageSize: 10
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<GovernorateParams>();
  private filterSubject$ = new Subject<GovernorateParams>();

  constructor(
    private governorateService: GovernorateService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadGovernorates();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadGovernorates();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadGovernorates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Governorates", "Create") || userRole === "Admin";
    this.canEdit = this.authService.hasPermission("Governorates", "Edit") || userRole === "Admin";
    this.canDelete = this.authService.hasPermission("Governorates", "Delete") || userRole === "Admin";

    if (!this.canDelete) {
      if (this.tableConfig.actions) {
        this.tableConfig.actions = this.tableConfig.actions.filter((action) => action.action !== "update");
      }
      this.tableConfig.columns = this.tableConfig.columns.filter(
        (col) => col.key !== 'isDeleted'
      );

    }
  }

  loadGovernorates(): void {
    this.isLoading = true;
    this.error = null;

    this.governorateService
      .getAllGovernorates(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as Governorate[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.isLoading = false;
          if (this.tableData.items.length === 0) {
            this.notificationService.showWarning("No governorates found.", 6000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message || "Failed to load governorates";
          this.notificationService.showError(`Failed to load governorates: ${error.message}`, 8000);
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
          this.handleFilter(event.data as Partial<GovernorateParams>);
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: "edit" | "update"; item: Governorate });
          break;
        case "update":
          this.confirmDelete(event.data as { id: number; value: boolean });
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

  private handleFilter(data: Partial<GovernorateParams>): void {
    if (!data) {
      console.warn("Invalid filter data:", data);
      this.notificationService.showWarning("Invalid filter input", 6000);
      return;
    }

    const newParams: GovernorateParams = {
      ...this.currentParams,
      pageIndex: 1
    };

    if (data.search !== undefined) {
      newParams.search = data.search?.trim() || undefined;
    }

    if (data.isDeleted !== undefined) {
      newParams.isDeleted = data.isDeleted;
    } else {
      newParams.isDeleted = undefined;
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
      id: "id",
      name: "name"
    };

    const mappedColumn = columnMap[data.column] || data.column;
    const newParams = {
      ...this.currentParams,
      sort: `${mappedColumn}_${data.direction}`,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadGovernorates();
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
      this.loadGovernorates();
    }
  }

  private handleAction(data: { action: string; item: Governorate }): void {
    if (!data?.action || !data?.item) {
      console.warn("Invalid action data:", data);
      this.notificationService.showWarning("Invalid action data", 6000);
      return;
    }

    switch (data.action) {
      case "edit":
        this.editGovernorate(data.item);
        break;
      case "update":
        this.confirmDelete({ id: data.item.id, value: data.item.isDeleted ?? false });
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  addGovernorate(): void {
    if (this.canCreate) {
      this.router.navigate(["/employee/places/governorates/create"]);
    } else {
      this.notificationService.showWarning("You do not have permission to create governorates.", 6000);
    }
  }

  editGovernorate(governorate: Governorate): void {
    if (this.canEdit) {
      this.router.navigate(["/employee/places/governorates/edit", governorate.id]);
    } else {
      this.notificationService.showWarning("You do not have permission to edit governorates.", 6000);
    }
  }

  confirmDelete(data: { id: number; value: boolean }): void {
    if (!this.canDelete) {
      this.notificationService.showWarning("You do not have permission to delete or activate governorates.", 6000);
      return;
    }
    const governorate = this.tableData.items.find((g) => g.id === data.id);
    if (!governorate) {
      this.notificationService.showWarning("Governorate not found.", 6000);
      return;
    }
    console.log(governorate);

    if (!governorate.isDeleted) {
      this.dialogData = {
        title: "Activate Governorate",
        message: `Are you sure you want to activate the governorate "${governorate.name}"? This will restore it to active status.`,
        confirmText: "Activate",
        cancelText: "Cancel",
        type: "warning",
        icon: "bi-arrow-counterclockwise"
      };
    } else {
      this.dialogData = {
        title: "Delete Governorate",
        message: `Are you sure you want to delete the governorate "${governorate.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        icon: "bi-trash"
      };
    }
    this.selectedItems = [governorate];
    this.showDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedItems.length !== 1) {
      this.isLoading = false;
      this.showDialog = false;
      this.notificationService.showWarning("Invalid governorate selection.", 6000);
      return;
    }

    this.isLoading = true;
    const governorate = this.selectedItems[0];
    const isActivate = this.dialogData.confirmText === "Activate";

    console.log(`onConfirmDelete triggered: Action=${isActivate ? 'Activate' : 'Delete'}, Governorate ID=${governorate.id}, Governorate Name=${governorate.name}`);

    this.governorateService.deleteGovernorate(governorate.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Action completed: ${isActivate ? 'Activated' : 'Deleted'} governorate ID=${governorate.id}`);
        this.isLoading = false;
        this.showDialog = false;
        this.notificationService.showSuccess(
          isActivate ? `Governorate "${governorate.name}" activated successfully!` : `Governorate "${governorate.name}" deleted successfully!`,
          5000
        );
        this.selectedItems = [];
        this.loadGovernorates();
      },
      error: (error) => {
        console.error(`Action failed: ${isActivate ? 'Activate' : 'Delete'} governorate ID=${governorate.id}`, error);
        this.isLoading = false;
        this.showDialog = false;
        this.notificationService.showError(
          isActivate ? `Failed to activate governorate: ${error.message}` : `Failed to delete governorate: ${error.message}`,
          8000
        );
      }
    });
  }

  onCancelDelete(): void {
    console.log('onCancelDelete triggered');
    this.showDialog = false;
    this.selectedItems = [];
  }

  refreshData(): void {
    this.loadGovernorates();
  }

  exportGovernorates(): void {
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
          let value = item[col.key as keyof Governorate];
          if (col.key === "isDeleted") {
            value = value ? "Inactive" : "Active";
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
    link.setAttribute('download', `Governorates_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }
}
