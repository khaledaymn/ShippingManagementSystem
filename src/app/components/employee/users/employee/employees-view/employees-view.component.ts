import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil, debounceTime } from "rxjs";
import { Employee, EmployeeParams } from "../../../../../core/models/employee";
import { EmployeeService } from "../../../../../core/services/employee.service";
import { AuthService } from "../../../../../core/services/auth.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { TableComponent } from "../../../../../shared/table/table.component";
import { NotificationComponent } from "../../../../../shared/notification/notification.component";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "../../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { TableConfig, TableData, TableEvent } from "../../../../../core/models/table";

@Component({
  selector: "app-employees-view",
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, NotificationComponent, ConfirmationDialogComponent],
  templateUrl: "./employees-view.component.html",
  styleUrls: ["./employees-view.component.css"],
})
export class EmployeesViewComponent implements OnInit, OnDestroy {
  @ViewChild(ConfirmationDialogComponent) confirmDialog!: ConfirmationDialogComponent;

  tableConfig: TableConfig = {
    searchable: true,
    sortable: true,
    selectable: false,
    pagination: true,
    showHeader: true,
    showFooter: true,
    pageSizeOptions: [5, 10, 25, 50],
    columns: [
      { key: "name", label: "Name", type: "text", sortable: true, align: "left" },
      { key: "email", label: "Email", type: "text", sortable: true, align: "left" },
      { key: "address", label: "Address", type: "text", sortable: false, align: "left" },
      { key: "phoneNumber", label: "Phone Number", type: "text", sortable: false, align: "left" },
      { key: "creationDate", label: "Created Date", type: "date", sortable: false, width: "140px", align: "center" },
      { key: "isDeleted", label: "Status", type: "action", sortable: false, width: "100px", align: "center" }
    ],
    actions: [
      { action: "edit", label: "Edit Employee", icon: "bi-pencil", color: "primary" },
      { action: "details", label: "View Details", icon: "bi-eye", color: "secondary" },
      // { action: "update", label: "Toggle Status", icon: "bi-arrow-repeat", color: "warning" }
    ],
    filters: [
      { key: "search", label: "Search", type: "text", placeholder: "Search by employee name..." },
      // { key: "branch", label: "Branch", type: "text", placeholder: "Filter by branch" },
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

  tableData: TableData<Employee> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5
  };

  loading = false;
  error: string | null = null;
  selectedEmployees: Employee[] = [];
  dialogData: ConfirmationDialogData = {};
  showConfirmDialog = false;

  canCreate = false;
  canEdit = false;
  canDelete = false;

  currentParams: EmployeeParams = {
    pageIndex: 1,
    pageSize: 10
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<EmployeeParams>();
  private filterSubject$ = new Subject<EmployeeParams>();

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadEmployees();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadEmployees();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.checkPermissions();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const userRole = this.authService.getUserRole();
    this.canCreate = this.authService.hasPermission("Employees", "Create") || userRole === "Admin";
    this.canEdit = this.authService.hasPermission("Employees", "Edit") || userRole === "Admin";
    this.canDelete = this.authService.hasPermission("Employees", "Delete") || userRole === "Admin";


  }

  private loadEmployees(): void {
    this.loading = true;
    this.error = null;

    this.employeeService
      .getAllEmployees(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as Employee[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.loading = false;
          if (this.tableData.items.length === 0) {
            this.notificationService.showWarning("No employees found.", 6000);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || "Failed to load employees";
          this.notificationService.showError(`Failed to load employees: ${error.message}`, 8000);
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
          this.handleFilter(event.data as Partial<EmployeeParams>);
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: Employee });
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

  private handleFilter(data: Partial<EmployeeParams>): void {
    if (!data) {
      console.warn("Invalid filter data:", data);
      this.notificationService.showWarning("Invalid filter input", 6000);
      return;
    }

    const newParams: EmployeeParams = {
      ...this.currentParams,
      pageIndex: 1
    };

    if (data.search !== undefined) {
      newParams.search = data.search?.trim() || undefined;
    }

    if (data.branch !== undefined) {
      newParams.branch = data.branch?.trim() || undefined;
    }

    if (data.isActive !== undefined) {
      newParams.isActive =  data.isActive;
    } else {
      newParams.isActive = undefined;
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
      creationDate: "createdAt"
    };

    const mappedColumn = columnMap[data.column] || data.column;
    const newParams = {
      ...this.currentParams,
      sort: `${mappedColumn}_${data.direction}`,
      pageIndex: 1
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.currentParams = newParams;
      this.loadEmployees();
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
      this.loadEmployees();
    }
  }

  private handleAction(data: { action: string; item: Employee }): void {
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
      this.router.navigate(["/employee/users/employees/create"]);
    } else {
      this.notificationService.showWarning("You do not have permission to create employees.", 6000);
    }
  }

  onEdit(employee: Employee): void {
    if (this.canEdit) {
      this.router.navigate([`/employee/users/employees/edit`, employee.id]);
    } else {
      this.notificationService.showWarning("You do not have permission to edit employees.", 6000);
    }
  }

  onDetails(employee: Employee): void {
    this.router.navigate(["/employee/users/employees/details", employee.id]);
  }

  confirmDelete(data: { id: string; value: boolean }): void {
    if (!this.canDelete) {
      this.notificationService.showWarning("You do not have permission to delete or activate employees.", 6000);
      return;
    }
    const employee = this.tableData.items.find((e) => e.id === data.id);
    if (!employee) {
      this.notificationService.showWarning("Employee not found.", 6000);
      return;
    }
    console.log(employee);

    if (!employee.isDeleted) {
      this.dialogData = {
        title: "Activate Employee",
        message: `Are you sure you want to activate the employee "${employee.name}"? This will restore their account to active status.`,
        confirmText: "Activate",
        cancelText: "Cancel",
        type: "warning",
        icon: "bi-arrow-counterclockwise"
      };
    } else {
      this.dialogData = {
        title: "Delete Employee",
        message: `Are you sure you want to delete the employee "${employee.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        icon: "bi-trash"
      };
    }
    this.selectedEmployees = [employee];
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedEmployees.length !== 1) {
      this.loading = false;
      this.showConfirmDialog = false;
      this.notificationService.showWarning("Invalid employee selection.", 6000);
      return;
    }

    this.loading = true;
    const employee = this.selectedEmployees[0];
    const isActivate = this.dialogData.confirmText === "Activate";

    console.log(`onConfirmDelete triggered: Action=${isActivate ? 'Activate' : 'Delete'}, Employee ID=${employee.id}, Employee Name=${employee.name}`);

    this.employeeService.deleteEmployee(employee.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log(`Action completed: ${isActivate ? 'Activated' : 'Deleted'} employee ID=${employee.id}`);
        this.loading = false;
        this.showConfirmDialog = false;
        this.notificationService.showSuccess(
          isActivate ? `Employee "${employee.name}" activated successfully!` : `Employee "${employee.name}" deleted successfully!`,
          5000
        );
        this.selectedEmployees = [];
        this.loadEmployees();
      },
      error: (error) => {
        console.error(`Action failed: ${isActivate ? 'Activate' : 'Delete'} employee ID=${employee.id}`, error);
        this.loading = false;
        this.showConfirmDialog = false;
        this.notificationService.showError(
          isActivate ? `Failed to activate employee: ${error.message}` : `Failed to delete employee: ${error.message}`,
          8000
        );
      }
    });
  }

  onCancelDelete(): void {
    console.log('onCancelDelete triggered');
    this.showConfirmDialog = false;
    this.selectedEmployees = [];
  }

  refreshData(): void {
    this.loadEmployees();
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
          let value = item[col.key as keyof Employee];
          if (col.key === "isDeleted") {
            value = value ? "Inactive" : "Active";
          } else if (col.key === "branches") {
            value = Array.isArray(value) ? value.map((b: any) => b.name).join(", ") : "";
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
    link.setAttribute('download', `Employees_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }
}
