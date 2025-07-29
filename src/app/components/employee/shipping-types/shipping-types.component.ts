import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  TableConfig,
  TableData,
  TableEvent,
  TableColumn,
  TableAction,
  TableFilter,
} from '../../../core/models/table';
import { ShippingType, ShippingTypeParams } from '../../../core/models/shipping-type';
import { ShippingTypeService } from '../../../core/services/shipping-type.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service'; // إضافة AuthService
import { TableComponent } from '../../../shared/table/table.component';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-shipping-types',
  templateUrl: './shipping-types.component.html',
  styleUrls: ['./shipping-types.component.css'],
  imports: [TableComponent, CommonModule, NotificationComponent],
  standalone: true,
})
export class ShippingTypesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // متغيرات لتخزين حالة الصلاحيات
  canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        key: 'id',
        label: '#',
        sortable: true,
        type: 'number',
        width: '40px',
        align: 'center',
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        type: 'text',
        align: 'left',
      },
      {
        key: 'extraPrice',
        label: 'Extra Price',
        sortable: true,
        type: 'currency',
        width: '180px',
        align: 'center',
      },
      {
        key: 'numOfDay',
        label: 'Delivery Days',
        sortable: true,
        type: 'number',
        align: 'center',
      },
      {
        key: 'isDeleted',
        label: 'Status',
        sortable: false,
        type: 'action',
        align: 'center',
      },
    ] as TableColumn[],
    actions: [
      {
        label: 'Edit',
        icon: 'bi-pencil',
        action: 'edit',
        color: 'primary',
      },
    ] as TableAction[],
    filters: [
      {
        key: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Search by name...',
      },
      {
        key: 'minPrice',
        label: 'Min Price',
        type: 'number',
        placeholder: '0.00',
        min: 0,
      },
      {
        key: 'maxPrice',
        label: 'Max Price',
        type: 'number',
        placeholder: '999.99',
        min: 0,
      },
      {
        key: 'minDays',
        label: 'Min Days',
        type: 'number',
        placeholder: '1',
        min: 1,
      },
      {
        key: 'maxDays',
        label: 'Max Days',
        type: 'number',
        placeholder: '30',
        min: 1,
      },
      {
        key: 'isDeleted',
        label: 'Status',
        type: 'select',
        options: [
          { value: false, label: 'Active' },
          { value: true, label: 'Deleted' },
        ],
      },
    ] as TableFilter[],
    searchable: true,
    sortable: true,
    selectable: false,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 15, 25, 50],
  };

  // Table data
  tableData: TableData<ShippingType> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 10,
  };

  // State
  loading = false;
  error: string | null = null;
  selectedItems: ShippingType[] = [];

  // Current parameters
  private currentParams: ShippingTypeParams = {
    pageIndex: 1,
    pageSize: 10,
  };

  // Table title and subtitle
  tableTitle = 'Shipping Types';
  tableSubtitle = 'Manage delivery options and pricing for your store';

  constructor(
    private shippingTypeService: ShippingTypeService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.checkPermissions();
    this.loadShippingTypes();
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

  private loadShippingTypes(): void {
    this.loading = true;
    this.error = null;

    this.shippingTypeService
      .getAllShippingTypes(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tableData = {
            items: response.data as ShippingType[],
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize,
          };
          this.loading = false;
          if (this.tableData.items.length > 0) {
          } else {
            this.notificationService.showWarning('No shipping types found.', 6000);
          }
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.notificationService.showError(`Failed to load shipping types: ${error.message}`, 8000);
        },
      });
  }

  onTableEvent(event: TableEvent): void {
    switch (event.type) {
      case 'sort':
        this.handleSort(event.data);
        break;
      case 'filter':
        this.handleFilter(event.data);
        break;
      case 'search':
        this.handleSearch(event.data);
        break;
      case 'page':
        this.handlePageChange(event.data);
        break;
      case 'action':
        this.handleAction(event.data);
        break;
      case 'select':
        this.handleSelection(event.data);
        break;
      case 'update':
        this.handleDelete(event.data);
        break;
    }
  }

  private handleSort(sortData: any): void {
    const { column, direction } = sortData;
    const value = column === 'extraPrice' ? 'price' : column === 'numOfDay' ? 'days' : column;
    this.currentParams.sort = `${value}_${direction}`;
    this.currentParams.pageIndex = 1;
    this.loadShippingTypes();
  }

  private handleFilter(filterData: any): void {
    const defaultParams = {
      pageIndex: 1,
      pageSize: 10,
    };

    const isFilterEmpty = Object.keys(filterData).length === 0;

    this.currentParams = isFilterEmpty
      ? { ...defaultParams }
      : {
          ...this.currentParams,
          ...filterData,
          pageIndex: 1,
        };

    this.loadShippingTypes();
  }

  private handleSearch(searchData: any): void {
    this.currentParams.search = searchData.search;
    this.currentParams.pageIndex = 1;
    this.loadShippingTypes();
  }

  private handlePageChange(pageData: any): void {
    this.currentParams.pageIndex = pageData.pageIndex;
    this.currentParams.pageSize = pageData.pageSize;
    this.loadShippingTypes();
  }

  private handleAction(actionData: any): void {
    const { action, item } = actionData;

    switch (action) {
      case 'edit':
        if (this.canEdit) {
          this.editShippingType(item);
        } else {
          this.notificationService.showWarning('You do not have permission to edit.', 6000);
        }
        break;
    }
  }

  private handleSelection(selectionData: any): void {
    this.selectedItems = selectionData.selectedItems;
  }

  private handleDelete(data: any): void {

    if (!this.canDelete) {
      this.notificationService.showWarning('You do not have permission to delete.', 6000);
      return;
    }

    this.loading = true;

    this.shippingTypeService
      .deleteShippingType(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadShippingTypes();
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.message || 'Failed to delete shipping type';
          this.notificationService.showError(`Failed to delete shipping type: ${err.message}`, 8000);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private editShippingType(shippingType: ShippingType): void {
    this.router.navigate(['/employee/settings/shipping-types/edit', shippingType.id]);
  }

  onAddNew(): void {
    if (this.canCreate) {
      this.router.navigate(['/employee/settings/shipping-types/create']);
    } else {
      this.notificationService.showWarning('You do not have permission to create.', 6000);
    }
  }

  onRefresh(): void {
    this.loadShippingTypes();
  }

  onExport(tableData: TableData<ShippingType>): void {
    if (this.loading || !tableData?.items?.length) {
      this.notificationService.showWarning('No data to export!', 6000);
      return;
    }

    const exportColumns = this.tableConfig.columns
      .filter((col: any) => col.type !== 'action')
      .map((col: any) => ({
        key: col.key,
        label: col.label,
      }));

    const headers = exportColumns.map((col: any) => `"${col.label.replace(/"/g, '""')}"`).join(',');

    const csvData = tableData.items.map((item) => {
      return exportColumns
        .map((col: any) => {
          const value = item[col.key as keyof ShippingType];
          const formattedValue = value === true ? 'Active' : value === false ? 'Inactive' : value ?? '';
          return `"${String(formattedValue).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...csvData].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Shipping_Types_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess('Data exported successfully as CSV!', 5000);
  }

  toggleSelection(): void {
    this.tableConfig.selectable = !this.tableConfig.selectable;
    this.selectedItems = [];
    this.notificationService.showInfo(
      `Row selection ${this.tableConfig.selectable ? 'enabled' : 'disabled'}`,
      5000
    );
  }
}
