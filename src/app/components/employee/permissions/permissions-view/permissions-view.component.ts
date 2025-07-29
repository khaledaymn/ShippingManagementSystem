import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil, debounceTime, forkJoin } from "rxjs";
import { GroupService } from "../../../../core/services/group.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { ConfirmationDialogComponent } from "../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { TableComponent } from "../../../../shared/table/table.component";
import { Group, GroupParams } from "../../../../core/models/group";
import { TableConfig, TableData, TableEvent } from "../../../../core/models/table";
import { PaginationResponse } from "../../../../core/models/response";
import { ConfirmationDialogData } from "../../../../shared/confirmation-dialog/confirmation-dialog.component";
import { NotificationComponent } from "../../../../shared/notification/notification.component";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-permissions-view",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableComponent,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: "./permissions-view.component.html",
  styleUrl: "./permissions-view.component.css",
})
export class PermissionsViewComponent implements OnInit, OnDestroy {
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
      { key: "name", label: "Group Name", type: "text", sortable: true },
      {
        key: "creationDate",
        label: "Created Date",
        type: "date",
        sortable: true,
        width: "540px",
        format: (value: string | Date) => new Date(value).toLocaleDateString(),
      },
    ],
    actions: [
      { action: "edit", label: "Edit Permissions", icon: "bi-pencil", color: "primary" },
      { action: "delete", label: "Delete Group", icon: "bi-trash", color: "danger" },
    ],
    filters: [
      { key: "name", label: "Group Name", type: "text", placeholder: "Search by group name..." },
    ],
  };

  tableData: TableData = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 5,
  };

  loading = false;
  error: string | null = null;
  selectedItems: Group[] = [];
  dialogData: ConfirmationDialogData = {};
  showDialog = false;
canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;

  currentParams: GroupParams = {
    pageIndex: 1,
    pageSize: 5,
  };

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<GroupParams>();
  private filterSubject$ = new Subject<GroupParams>();

  constructor(
    private groupService: GroupService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadGroups();
      });

    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
        this.loadGroups();
      });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "instant" });
    this.loadGroups();
    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canCreate = this.authService.hasPermission('Permissions', 'Create') ||
      this.authService.getUserRole() == 'Admin';
    this.canEdit = this.authService.hasPermission('Permissions', 'Edit')||
      this.authService.getUserRole() == 'Admin';
    this.canDelete = this.authService.hasPermission('Permissions', 'Delete')||
      this.authService.getUserRole() == 'Admin';
      
    if (!this.canDelete) {
      this.tableConfig.actions = [
        { action: "edit", label: "Edit Permissions", icon: "bi-pencil", color: "primary" },
      ];
    }

    if (!this.canEdit) {
      this.tableConfig.actions = [
        { action: "delete", label: "Delete Group", icon: "bi-trash", color: "danger" },
      ];
    }

    if(!this.canDelete && !this.canEdit){
      this.tableConfig.actions = [];
    }

  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;

    this.groupService
      .getAllGroups(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponse<Group>) => {
          this.tableData = {
            items: response.data as Group[] || [],
            totalCount: response.totalCount || 0,
            pageIndex: response.pageIndex || 1,
            pageSize: response.pageSize || 5,
          };
          this.loading = false;
          if (this.tableData.items.length > 0) {
          } else {
            this.notificationService.showWarning("No permission groups found.", 6000);
          }
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.notificationService.showError(`Failed to load permission groups: ${error.message}`, 8000);
        },
      });
  }

  onTableEvent(event: TableEvent): void {
    try {
      switch (event.type) {
        case "search":
          this.handleSearch(event.data as { name?: string });
          break;
        case "filter":
          this.handleFilter(event.data as { name?: string });
          break;
        case "sort":
          this.handleSort(event.data as { column: string; direction: string });
          break;
        case "page":
          this.handlePageChange(event.data as { pageIndex: number; pageSize: number });
          break;
        case "select":
          this.handleSelection(event.data as { selectedItems: Group[] });
          break;
        case "action":
          this.handleAction(event.data as { action: string; item: Group });
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

  private handleSearch(data: { name?: string }): void {
    if (!data || typeof data.name !== "string") {
      return;
    }

    const newParams = {
      ...this.currentParams,
      name: data.name?.trim() || undefined,
      pageIndex: 1,
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.searchSubject$.next(newParams);
      this.notificationService.showInfo(`Searching for "${data.name}"`, 5000);
    }
  }

  private handleFilter(data: { name?: string }): void {
    if (!data) {
      console.warn("Invalid filter data:", data);
      this.notificationService.showWarning("Invalid filter input", 6000);
      return;
    }

    const newParams = {
      ...this.currentParams,
      name: data.name?.trim() || undefined,
      pageIndex: 1,
    };

    if (JSON.stringify(newParams) !== JSON.stringify(this.currentParams)) {
      this.filterSubject$.next(newParams);
      this.notificationService.showInfo("Applying filters...", 5000);
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
      this.loadGroups();
      this.notificationService.showInfo(`Sorting by ${data.column} (${data.direction})`, 5000);
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
      this.loadGroups();
      this.notificationService.showInfo(`Navigating to page ${data.pageIndex}`, 5000);
    }
  }

  private handleSelection(data: { selectedItems: Group[] }): void {
    if (!data?.selectedItems || !Array.isArray(data.selectedItems)) {
      console.warn("Invalid selection data:", data);
      this.selectedItems = [];
      this.notificationService.showWarning("Invalid selection data", 6000);
      return;
    }
    this.selectedItems = data.selectedItems;
    this.notificationService.showInfo(
      `${data.selectedItems.length} group${data.selectedItems.length === 1 ? "" : "s"} selected`,
      5000
    );
  }

  private handleAction(data: { action: string; item: Group }): void {
    if (!data?.action || !data?.item) {
      console.warn("Invalid action data:", data);
      this.notificationService.showWarning("Invalid action data", 6000);
      return;
    }

    switch (data.action) {
      case "edit":
        this.editGroup(data.item);
        this.notificationService.showInfo(`Editing group "${data.item.name}"`, 5000);
        break;
      case "delete":
        this.confirmDelete(data.item);
        break;
      default:
        console.warn(`Unknown action: ${data.action}`);
        this.notificationService.showWarning("Invalid action", 6000);
    }
  }

  addGroup(): void {
    this.router.navigate(["/employee/settings/permissions/create"]);
  }

  editGroup(group: Group): void {
    this.router.navigate(["/employee/settings/permissions/edit", group.id]);
  }

  confirmDelete(group: Group): void {
    this.dialogData = {
      title: "Delete Group",
      message: `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      icon: "bi-trash",
    };
    this.selectedItems = [group];
    this.showDialog = true;
  }

  confirmBulkDelete(): void {
    if (this.selectedItems.length === 0) {
      this.notificationService.showWarning("Please select groups to delete", 6000);
      return;
    }

    this.dialogData = {
      title: "Delete Selected Groups",
      message: `Are you sure you want to delete ${this.selectedItems.length} selected group${this.selectedItems.length === 1 ? "" : "s"}? This action cannot be undone.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
      icon: "bi-trash",
    };
    this.showDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedItems.length === 0) {
      this.loading = false;
      this.showDialog = false;
      this.notificationService.showWarning("No groups selected for deletion", 6000);
      return;
    }

    this.loading = true;
    this.notificationService.showInfo(`Deleting ${this.selectedItems.length} group${this.selectedItems.length === 1 ? "" : "s"}...`, 3000);

    const deleteObservables = this.selectedItems.map((group) =>
      this.groupService.deleteGroup(group.id)
    );

    forkJoin(deleteObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.showDialog = false;
          this.notificationService.showSuccess(
            `Successfully deleted ${this.selectedItems.length} group${this.selectedItems.length === 1 ? "" : "s"}`,
            5000
          );
          this.selectedItems = [];
          this.loadGroups();
        },
        error: (error) => {
          this.loading = false;
          this.showDialog = false;
          this.notificationService.showError(`Failed to delete some groups: ${error.message}`, 8000);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onCancelDelete(): void {
    this.showDialog = false;
    this.selectedItems = [];
    this.notificationService.showInfo("Deletion cancelled", 5000);
  }

  refreshData(): void {
    this.loadGroups();
    this.notificationService.showInfo("Refreshing permission groups...", 3000);
  }

  exportGroups(): void {
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
          const value = item[col.key as keyof Group];
          const formattedValue = value instanceof Date ? value.toLocaleDateString() : value ?? "";
          return `"${String(formattedValue).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Permission_Groups_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess("Data exported successfully as CSV!", 5000);
  }

  toggleSelection(): void {
    this.tableConfig.selectable = !this.tableConfig.selectable;
    this.selectedItems = [];
    this.notificationService.showInfo(
      `Row selection ${this.tableConfig.selectable ? "enabled" : "disabled"}`,
      5000
    );
  }

  resetFilters(): void {
    this.currentParams = {
      pageIndex: 1,
      pageSize: 5,
    };
    this.loadGroups();
    this.notificationService.showInfo("Filters reset", 5000);
  }
}
