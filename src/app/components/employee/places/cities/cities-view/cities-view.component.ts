import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, debounceTime } from "rxjs";
import { City, CityParams } from "../../../../../core/models/city";
import { CityService } from "../../../../../core/services/city.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { TableComponent } from "../../../../../shared/table/table.component";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "../../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { TableConfig, TableData, TableEvent } from "../../../../../core/models/table";

@Component({
  selector: "app-cities-view",
  standalone: true,
  imports: [CommonModule, TableComponent, NotificationComponent, ConfirmationDialogComponent, RouterModule],
  templateUrl: "./cities-view.component.html",
  styleUrls: ["./cities-view.component.css"]
})
export class CitiesViewComponent implements OnInit, OnDestroy {
  @ViewChild(ConfirmationDialogComponent) confirmDialog!: ConfirmationDialogComponent;

  tableConfig: TableConfig = {
    searchable: true,
    sortable: true,
    pagination: true,
    pageSizeOptions: [5, 10, 25, 50],
    columns: [
      { key: "name", label: "City Name", sortable: true, type: "text", align: "left" },
      { key: "governorateName", label: "Governorate", sortable: false, type: "text", align: "left" },
      { key: "chargePrice", label: "Charge Price", sortable: true, type: "currency", width: "180px", align: "center" },
      { key: "pickUpPrice", label: "Pickup Price", sortable: true, type: "currency", width: "180px", align: "center" },
      { key: "isDeleted", label: "Status", sortable: false, type: "action", align: "center" }
    ],
    actions: [
      { action: "edit", label: "Edit", icon: "bi-pencil", color: "primary",visible: () => this.canEdit },
      { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning",visible: () => this.canDelete }
    ],
    filters: [
      { key: "search", label: "Search", type: "text", placeholder: "Search by city name..." },
      { key: "governorateName", label: "Governorate", type: "text", placeholder: "Filter by governorate" },
      { key: "minChargePrice", label: "Min Charge Price", type: "number", placeholder: "0.00"},
      { key: "maxChargePrice", label: "Max Charge Price", type: "number", placeholder: "999.99" },
      { key: "minPickUpPrice", label: "Min Pickup Price", type: "number", placeholder: "0.00"},
      { key: "maxPickUpPrice", label: "Max Pickup Price", type: "number", placeholder: "999.99" },
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

  tableData: TableData<City> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5
  };

  isLoading = false;
  error: string | null = null;
  selectedItems: City[] = [];
  dialogData: ConfirmationDialogData = {};
  showDialog = false;

  canCreate = false;
  canEdit = false;
  canDelete = false;

  currentParams: CityParams = {
    pageIndex: 1,
    pageSize: 10
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<CityParams>();
  private filterSubject$ = new Subject<CityParams>();

  constructor(
    private cityService: CityService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadCities();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadCities();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadCities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Cities", "Create") || userRole === "Admin";
    this.canEdit = this.authService.hasPermission("Cities", "Edit") || userRole === "Admin";
    this.canDelete = this.authService.hasPermission("Cities", "Delete") || userRole === "Admin";

    if (!this.canDelete) {
      if (this.tableConfig.actions) {
        this.tableConfig.actions = this.tableConfig.actions.filter((action) => action.action !== "update");
      }
      this.tableConfig.columns = this.tableConfig.columns.filter(
        (col) => col.key !== 'isDeleted'
      );

    }
  }

  loadCities(): void {
    this.isLoading = true;
    this.error = null;
    console.log(this.currentParams);

    this.cityService
      .getAllCities(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as City[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.isLoading = false;
          if (this.tableData.items.length === 0) {
            this.notificationService.showWarning("No cities found.", 6000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message || "Failed to load cities";
          this.notificationService.showError(`Failed to load cities: ${error.message}`, 8000);
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
          this.handleFilter(event.data as CityParams);
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: City });
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

  private handleFilter(data: Partial<CityParams>): void {
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
      this.loadCities();
      return;
    }

    if (!data) {
      console.warn("Invalid filter data:", data);
      this.notificationService.showWarning("Invalid filter input", 6000);
      return;
    }
    const newParams: CityParams = {
      ...this.currentParams,
      pageIndex: 1
    };

    if (data.search !== undefined) {
      newParams.search = data.search?.trim() || undefined;
    }

    if (data.governorateId !== undefined) {
      const governorateId = typeof data.governorateId === "string" ? Number.parseInt(data.governorateId, 10) : data.governorateId;
      newParams.governorateId = isNaN(governorateId) || governorateId <= 0 ? undefined : governorateId;
    } else {
      newParams.governorateId = undefined;
    }

    if (data.minChargePrice !== undefined) {
      const minChargePrice = typeof data.minChargePrice === "string" ? Number.parseFloat(data.minChargePrice) : data.minChargePrice;
      newParams.minChargePrice = isNaN(minChargePrice) || minChargePrice < 0 ? undefined : minChargePrice;
    } else {
      newParams.minChargePrice = undefined;
    }

    if (data.maxChargePrice !== undefined) {
      const maxChargePrice = typeof data.maxChargePrice === "string" ? Number.parseFloat(data.maxChargePrice) : data.maxChargePrice;
      newParams.maxChargePrice = isNaN(maxChargePrice) || maxChargePrice < 0 ? undefined : maxChargePrice;
    } else {
      newParams.maxChargePrice = undefined;
    }

    if (data.minPickUpPrice !== undefined) {
      const minPickUpPrice = typeof data.minPickUpPrice === "string" ? Number.parseFloat(data.minPickUpPrice) : data.minPickUpPrice;
      newParams.minPickUpPrice = isNaN(minPickUpPrice) || minPickUpPrice < 0 ? undefined : minPickUpPrice;
    } else {
      newParams.minPickUpPrice = undefined;
    }

    if (data.maxPickUpPrice !== undefined) {
      const maxPickUpPrice = typeof data.maxPickUpPrice === "string" ? Number.parseFloat(data.maxPickUpPrice) : data.maxPickUpPrice;
      newParams.maxPickUpPrice = isNaN(maxPickUpPrice) || maxPickUpPrice < 0 ? undefined : maxPickUpPrice;
    } else {
      newParams.maxPickUpPrice = undefined;
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
      chargePrice: "charge",
      pickUpPrice: "pickup"
    };

    const mappedColumn = columnMap[data.column] || data.column;
    const newParams = {
      ...this.currentParams,
      sort: `${mappedColumn}_${data.direction}`,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadCities();
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
      this.loadCities();
    }
  }

  private handleAction(data: { action: string; item: City }): void {
    if (!data?.action || !data?.item) {
      console.warn("Invalid action data:", data);
      this.notificationService.showWarning("Invalid action data", 6000);
      return;
    }

    switch (data.action) {
      case "edit":
        this.editCity(data.item);
        break;
      case "update":
        this.confirmDelete({ id: data.item.id, value: data.item.isDeleted });
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  addCity(): void {
    if (this.canCreate) {
      this.router.navigate(["/employee/places/cities/create"]);
    } else {
      this.notificationService.showWarning("You do not have permission to create cities.", 6000);
    }
  }

  editCity(city: City): void {
    if (this.canEdit) {
      this.router.navigate(["/employee/places/cities/edit", city.id]);
    } else {
      this.notificationService.showWarning("You do not have permission to edit cities.", 6000);
    }
  }

  confirmDelete(data: { id: number; value: boolean }): void {
    if (!this.canDelete) {
      this.notificationService.showWarning("You do not have permission to delete or activate cities.", 6000);
      return;
    }
    const city = this.tableData.items.find((c) => c.id === data.id);
    if (!city) {
      this.notificationService.showWarning("City not found.", 6000);
      return;
    }
    console.log(city);

    if (!city.isDeleted) {
      this.dialogData = {
        title: "Activate City",
        message: `Are you sure you want to activate the city "${city.name}"? This will restore it to active status.`,
        confirmText: "Activate",
        cancelText: "Cancel",
        type: "warning",
        icon: "bi-arrow-counterclockwise"
      };
    } else {
      this.dialogData = {
        title: "Delete City",
        message: `Are you sure you want to delete the city "${city.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        icon: "bi-trash"
      };
    }
    this.selectedItems = [city];
    this.showDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedItems.length !== 1) {
      this.isLoading = false;
      this.showDialog = false;
      this.notificationService.showWarning("Invalid city selection.", 6000);
      return;
    }

    this.isLoading = true;
    const city = this.selectedItems[0];
    const isActivate = this.dialogData.confirmText === "Activate";

    console.log(`onConfirmDelete triggered: Action=${isActivate ? 'Activate' : 'Delete'}, City ID=${city.id}, City Name=${city.name}`);

    this.cityService.deleteCity(city.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Action completed: ${isActivate ? 'Activated' : 'Deleted'} city ID=${city.id}`);
        this.isLoading = false;
        this.showDialog = false;
        this.notificationService.showSuccess(
          isActivate ? `City "${city.name}" activated successfully!` : `City "${city.name}" deleted successfully!`,
          5000
        );
        this.selectedItems = [];
        this.loadCities();
      },
      error: (error) => {
        console.error(`Action failed: ${isActivate ? 'Activate' : 'Delete'} city ID=${city.id}`, error);
        this.isLoading = false;
        this.showDialog = false;
        this.notificationService.showError(
          isActivate ? `Failed to activate city: ${error.message}` : `Failed to delete city: ${error.message}`,
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
    this.loadCities();
  }

  exportCities(): void {
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
          const value = item[col.key as keyof City];
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
    link.setAttribute('download', `Cities_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }
}
