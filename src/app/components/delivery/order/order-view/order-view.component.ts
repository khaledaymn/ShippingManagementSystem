import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { ShippingRepresentativeService } from '../../../../core/services/shipping-representative.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order, OrderParams, OrderStateValues, OrderTypeValues, PaymentTypeValues, OrderStateOptions, OrderTypeOptions, PaymentTypeOptions } from '../../../../core/models/order';
import { ShippingRepresentative } from '../../../../core/models/shipping-representative';
import { TableConfig, TableData, TableEvent } from '../../../../core/models/table';
import { TableComponent } from '../../../../shared/table/table.component';
import { NotificationComponent } from '../../../../shared/notification/notification.component';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Role } from '../../../../core/models/user';
import { CityService } from '../../../../core/services/city.service';
import { BranchService } from '../../../../core/services/branch.service';
import { MerchantService } from '../../../../core/services/merchant.service';
import { Merchant } from '../../../../core/models/merchant';
import { City } from '../../../../core/models/city';
import { Branch } from '../../../../core/models/branch';

@Component({
  selector: 'app-orders-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableComponent,
    NotificationComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.css']
})
export class DeliveryOrdersViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  cities: City[] = [];
  branches: Branch[] = [];
  merchants: Merchant[] = [];
  orders: Order[] = [];

  // Table Configuration
  tableConfig: TableConfig = {
    columns: [
      { key: 'customerName', label: 'Customer', sortable: true, type: 'text' },
      { key: 'customerPhone1', label: 'Phone', sortable: false, type: 'text' },
      {
        key: 'orderState',
        label: 'Status',
        sortable: false,
        type: 'badge',
        format: (value) => this.formatOrderStatus(value)
      },
      {
        key: 'orderPrice',
        label: 'Order Price',
        sortable: true,
        type: 'currency',
        align: 'right'
      },
      { key: 'cityName', label: 'City', sortable: false, type: 'text' },
      {
        key: 'creationDate',
        label: 'Created',
        sortable: true,
        type: 'date',
        format: (value) => new Date(value).toLocaleDateString('en-GB')
      },
      { key: "isDeleted", label: "Status", type: "action", sortable: false, width: "100px", align: "center" }
    ],
    actions: [
      {
        label: 'View Details',
        icon: 'bi bi-eye',
        action: 'details',
        color: 'primary',
        visible: () => true // Always visible
      },
      {
        label: 'Print',
        icon: 'bi bi-printer',
        action: 'print',
        color: 'info',
        visible: () => true // Always visible
      },
      {
        label: 'Change Status',
        icon: 'bi bi-arrow-repeat',
        action: 'changeStatus',
        color: 'warning',
        visible: () => true
      }
    ],
    filters: [
      {
        key: 'orderState',
        label: 'Status',
        type: 'select',
        options: OrderStateOptions
      },
      {
        key: 'orderType',
        label: 'Order Type',
        type: 'select',
        options: OrderTypeOptions
      },
      {
        key: 'paymentType',
        label: 'Payment Type',
        type: 'select',
        options: PaymentTypeOptions
      },
      {
        key: 'cityId',
        label: 'City',
        type: 'select',
        options: [],
      },
      {
        key: 'branchId',
        label: 'Branch',
        type: 'select',
        options: [],
      },
      {
        key: 'fromDate',
        label: 'From Date',
        type: 'date'
      },
      {
        key: 'toDate',
        label: 'To Date',
        type: 'date'
      }
    ],
    searchable: true,
    sortable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  tableData: TableData<Order> = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 10
  };

  loading = false;
  error: string | null = null;
  successMessage = '';

  // Modal states
  showChangeStatusModal = false;
  showAssignDeliveryModal = false;
  showConfirmDialog = false;

  // Forms
  changeStatusForm!: FormGroup;
  assignDeliveryForm!: FormGroup;

  // Data
  selectedOrder: Order | null = null;
  shippingRepresentatives: ShippingRepresentative[] = [];
  confirmationData: any = {};

  userId: string | undefined
  // Current filters and search
  currentParams: OrderParams = {
    pageIndex: 1,
    pageSize: 10,
    isDeleted: false
  };

  // Dialog data for confirmation
  dialogData: any = {
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this order?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger'
  };

  constructor(
    private orderService: OrderService,
    private shippingRepService: ShippingRepresentativeService,
    private cityService: CityService,
    private branchService: BranchService,
    private merchantService: MerchantService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.userId = this.getCurrentUserId()
    this.loadOrders();
    this.loadShippingRepresentatives();
    this.loadCities();
    this.loadBranches();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.changeStatusForm = this.fb.group({
      orderState: ['', Validators.required],
      notes: ['']
    });

    this.assignDeliveryForm = this.fb.group({
      shippingRepresentativeId: ['', Validators.required]
    });
  }

  private getCurrentUserId(): string | undefined {
    let userId = undefined
    this.authService.currentUser$.subscribe(
      (id) => userId = id?.id
    )
    return userId
  }

  private loadOrders(): void {
    this.loading = true;
    this.error = null;
   this.currentParams.shippingRepresentativeId = this.userId
    this.orderService.getOrders(this.currentParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orders = response.data;
          this.tableData = {
            items: response.data,
            totalCount: response.totalCount,
            pageIndex: response.pageIndex,
            pageSize: response.pageSize
          };
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load orders';
          this.loading = false;
        }
      });
  }

  private loadShippingRepresentatives(): void {
    this.shippingRepService.getShippingRepresentatives({
      pageIndex: 1,
      pageSize: 1000,
      isActive: true
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.shippingRepresentatives = response.data as ShippingRepresentative[];
          this.tableConfig.filters!.find((f) => f.key === 'shippingRepresentativeId')!.options = [
            ...this.shippingRepresentatives.map((rep) => ({
              value: rep.id.toString(),
              label: `${rep.name} - ${rep.email}`,
            })),
          ];
          if (this.shippingRepresentatives.length === 0) {
            this.error = 'No active shipping representatives found.';
          }
        },
        error: (error) => {
          console.error('Failed to load shipping representatives:', error);
        }
      });
  }

  private loadCities(): void {
    this.cityService
      .getAllCities({ pageIndex: 1, pageSize: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cities = response.data as City[];
          this.tableConfig.filters!.find((f) => f.key === 'cityId')!.options = [
            ...this.cities.map((city) => ({
              value: city.id.toString(),
              label: city.name,
            })),
          ];
        },
        error: (error) => {
          this.error = 'Failed to load cities: ' + error.message;
        },
      });
  }

  private loadBranches(): void {
    this.branchService
      .getAllBranches({ pageIndex: 1, pageSize: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.branches = response.data as Branch[];
          this.tableConfig.filters!.find((f) => f.key === 'branchId')!.options = [
            ...this.branches.map((branch) => ({
              value: branch.id.toString(),
              label: branch.name,
            })),
          ];
        },
        error: (error) => {
          this.error = 'Failed to load branches: ' + error.message;
        },
      });
  }

  onTableEvent(event: TableEvent): void {
    const defaultParams = {
      pageIndex: 1,
      pageSize: 10,
    };
    const isEmpty = (obj: any): boolean => {
      return Object.keys(obj).length === 0;
    };
    switch (event.type) {
      case 'search':
        this.currentParams.search = event.data.search;
        this.currentParams.pageIndex = 1;
        if (isEmpty(event.data))
          this.currentParams = defaultParams;
        this.loadOrders();
        break;

      case 'filter':
        Object.assign(this.currentParams, event.data);
        this.currentParams.pageIndex = 1;
        if (isEmpty(event.data))
          this.currentParams = defaultParams;
        this.loadOrders();
        break;

      case 'sort':
        this.currentParams.sort = `${event.data.column}_${event.data.direction}`;
        if (isEmpty(event.data))
          this.currentParams = defaultParams;
        this.loadOrders();
        break;

      case 'page':
        this.currentParams.pageIndex = event.data.pageIndex;
        this.currentParams.pageSize = event.data.pageSize;
        if (isEmpty(event.data))
          this.currentParams = defaultParams;
        this.loadOrders();
        break;

      case 'action':
        this.handleAction(event.data.action, event.data.item);
        break;
    }
  }

  private handleAction(action: string, order: Order): void {
    this.selectedOrder = order;

    switch (action) {
      case 'print':
        this.printOrder(order);
        break;

      case 'details':
        this.viewDetails(order.id);
        break;

      case 'changeStatus':
        this.openChangeStatusModal(order);
        break;
    }
  }

  // Action Methods
  private printOrder(order: Order): void {
    const printContent = this.generateOrderPrintContent(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generateOrderPrintContent(order: Order): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .order-info h3 { margin-bottom: 10px; color: #333; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .products { margin-top: 20px; }
          .products table { width: 100%; border-collapse: collapse; }
          .products th, .products td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .products th { background-color: #f2f2f2; }
          .totals { margin-top: 20px; text-align: right; }
          .totals div { margin-bottom: 5px; }
          .total-final { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Order Receipt</h1>
          <h2>Order #${order.id}</h2>
        </div>

        <div class="order-info">
          <h3>Customer Information</h3>
          <div class="info-row"><span>Name:</span><span>${order.customerName}</span></div>
          <div class="info-row"><span>Phone:</span><span>${order.customerPhone1}</span></div>
          ${order.customerPhone2 ? `<div class="info-row"><span>Phone 2:</span><span>${order.customerPhone2}</span></div>` : ''}
          <div class="info-row"><span>Address:</span><span>${order.villageAndStreet}</span></div>
          <div class="info-row"><span>City:</span><span>${order.cityName || 'N/A'}</span></div>
        </div>

        <div class="order-info">
          <h3>Order Details</h3>
          <div class="info-row"><span>Status:</span><span>${this.formatOrderStatus(order.orderState)}</span></div>
          <div class="info-row"><span>Type:</span><span>${this.formatOrderType(order.orderType)}</span></div>
          <div class="info-row"><span>Payment:</span><span>${this.formatPaymentType(order.paymentType)}</span></div>
          <div class="info-row"><span>Created:</span><span>${new Date(order.creationDate).toLocaleDateString('en-GB')}</span></div>
          <div class="info-row"><span>Merchant:</span><span>${order.merchantName || 'N/A'}</span></div>
          <div class="info-row"><span>Representative:</span><span>${order.shippingRepresentativeName || 'N/A'}</span></div>
        </div>

        ${order.products && order.products.length > 0 ? `
        <div class="products">
          <h3>Products</h3>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${product.weight} kg</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="totals">
          <div>Order Price: $${order.orderPrice.toFixed(2)}</div>
          <div>Charge Price: $${order.chargePrice.toFixed(2)}</div>
          <div>Amount Received: $${order.amountReceived.toFixed(2)}</div>
          <div>Total Weight: ${order.totalWeight} kg</div>
          <div class="total-final">Total: $${(order.orderPrice + order.chargePrice).toFixed(2)}</div>
        </div>

        ${order.notes ? `
        <div class="order-info">
          <h3>Notes</h3>
          <p>${order.notes}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private viewDetails(orderId: number) {
    this.router.navigate(['delivery/orders/details', orderId]);
  }

  private openChangeStatusModal(order: Order): void {
    this.selectedOrder = order;
    this.changeStatusForm.patchValue({
      orderState: order.orderState,
      notes: order.notes || ''
    });
    this.showChangeStatusModal = true;
  }

  private openAssignDeliveryModal(order: Order): void {
    this.selectedOrder = order;
    this.assignDeliveryForm.patchValue({
      shippingRepresentativeId: ''
    });
    this.showAssignDeliveryModal = true;
  }

  private confirmDelete(order: Order): void {
    this.selectedOrder = order;
    this.dialogData = {
      title: 'Delete Order',
      message: `Are you sure you want to delete order #${order.id} for ${order.customerName}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    };
    this.showConfirmDialog = true;
  }

  // Modal Actions
  onChangeStatus(): void {
    if (this.changeStatusForm.valid && this.selectedOrder) {
      this.loading = true;
      const formData = this.changeStatusForm.value;

      this.orderService.updateOrderStatus(this.selectedOrder.id, {
        orderState: formData.orderState,
        notes: formData.notes
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Order status updated successfully';
            this.showChangeStatusModal = false;
            this.loadOrders();
            this.loading = false;
            this.clearMessages();
          },
          error: (error) => {
            this.error = error.message || 'Failed to update order status';
            this.loading = false;
          }
        });
    }
  }

  onAssignDelivery(): void {
    if (this.assignDeliveryForm.valid && this.selectedOrder) {
      this.loading = true;
      const formData = this.assignDeliveryForm.value;

      this.orderService.assignOrderToDelivery(this.selectedOrder.id, {
        orderState: OrderStateValues.DeliveredToTheRepresentative,
        shippingRepresentativeId: formData.shippingRepresentativeId
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Order assigned to delivery successfully';
            this.showAssignDeliveryModal = false;
            this.loadOrders();
            this.loading = false;
            this.clearMessages();
          },
          error: (error) => {
            this.error = error.message || 'Failed to assign order to delivery';
            this.loading = false;
          }
        });
    }
  }

  onConfirmDelete(): void {
    if (this.selectedOrder) {
      this.loading = true;

      this.orderService.deleteOrder(this.selectedOrder.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Order deleted successfully';
            this.showConfirmDialog = false;
            this.loadOrders();
            this.loading = false;
            this.clearMessages();
          },
          error: (error) => {
            this.error = error.message || 'Failed to delete order';
            this.loading = false;
          }
        });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.selectedOrder = null;
  }

  onModalCancel(): void {
    this.showChangeStatusModal = false;
    this.showAssignDeliveryModal = false;
    this.selectedOrder = null;
  }

  // Utility Methods
  onAdd(): void {
    this.router.navigate(['/employee/orders/create']);
  }

  onExport(): void {
    const printContent = this.generateBulkPrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generateBulkPrintContent(): string {
    const orders = this.tableData.items;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { margin-top: 20px; }
          .summary div { margin-bottom: 5px; }
          .total-final { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Orders Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Order Price</th>
              <th>Charge Price</th>
              <th>Total Price</th>
              <th>City</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.customerPhone1}</td>
                <td>${this.formatOrderStatus(order.orderState)}</td>
                <td>${this.formatOrderType(order.orderType)}</td>
                <td>${this.formatPaymentType(order.paymentType)}</td>
                <td>$${order.orderPrice.toFixed(2)}</td>
                <td>$${order.chargePrice.toFixed(2)}</td>
                <td>$${(order.orderPrice + order.chargePrice).toFixed(2)}</td>
                <td>${order.cityName || 'N/A'}</td>
                <td>${new Date(order.creationDate).toLocaleDateString('en-GB')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3>Summary</h3>
          <div>Total Orders: ${orders.length}</div>
          <div>Total Order Value: $${orders.reduce((sum, order) => sum + order.orderPrice, 0).toFixed(2)}</div>
          <div>Total Charges: $${orders.reduce((sum, order) => sum + order.chargePrice, 0).toFixed(2)}</div>
          <div>Total Price: $${orders.reduce((sum, order) => sum + (order.orderPrice + order.chargePrice), 0).toFixed(2)}</div>
        </div>
      </body>
      </html>
    `;
  }

  refreshData(): void {
    this.loadOrders();
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.error = null;
    }, 3000);
  }

  // Formatting Methods
  formatOrderStatus(status: string): string {
    return status.replace(/([A-Z])/g, ' $1').trim();
  }

  private formatOrderType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }

  private formatPaymentType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }

  closeChangeStatusModal(): void {
    this.showChangeStatusModal = false;
    this.selectedOrder = null;
    this.changeStatusForm.reset();
  }

  closeAssignDeliveryModal(): void {
    this.showAssignDeliveryModal = false;
    this.selectedOrder = null;
    this.assignDeliveryForm.reset();
  }

  // Getter for shipping representatives options
  get shippingRepresentativeOptions() {
    return this.shippingRepresentatives.map(rep => ({
      value: rep.id,
      label: `${rep.name} - ${rep.email || rep.phoneNumber || ''}`
    }));
  }

  printAllOrders(): void {
    const printContent = this.generateAllOrdersPrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All Orders Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .orders-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              .orders-table th { background-color: #f2f2f2; }
              .status-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; }
              .status-new { background-color: #e3f2fd; color: #1976d2; }
              .status-pending { background-color: #fff3e0; color: #f57c00; }
              .status-deliveredtotherepresentative { background-color: #ede7f6; color: #7b1fa2; }
              .status-delivered { background-color: #e8f5e8; color: #388e3c; }
              .status-cannotbereached { background-color: #ffebee; color: #c62828; }
              .status-postponed { background-color: #f5f5f5; color: #616161; }
              .status-partiallydelivered { background-color: #fff8e1; color: #ff8f00; }
              .status-canceledbycustomer { background-color: #ffebee; color: #c62828; }
              .status-rejectedwithpayment { background-color: #ffccbc; color: #bf360c; }
              .status-rejectedwithpartialpayment { background-color: #ffccbc; color: #bf360c; }
              .status-rejectedwithoutpayment { background-color: #ffccbc; color: #bf360c; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generateAllOrdersPrintContent(): string {
    return `
      <div class="header">
        <h1>Orders Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Orders: ${this.orders.length}</p>
      </div>

      <table class="orders-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Order Price</th>
            <th>Charge Price</th>
            <th>Total Price</th>
            <th>City</th>
            <th>Merchant</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${this.orders
            .map(
              (order) => `
            <tr>
              <td>${order.customerName}</td>
              <td>${order.customerPhone1}</td>
              <td>${order.orderType}</td>
              <td><span class="status-badge status-${order.orderState.toLowerCase()}">${order.orderState}</span></td>
              <td>${order.paymentType}</td>
              <td>$${order.orderPrice.toFixed(2)}</td>
              <td>$${order.chargePrice.toFixed(2)}</td>
              <td>$${(order.orderPrice + order.chargePrice).toFixed(2)}</td>
              <td>${order.cityName || 'N/A'}</td>
              <td>${order.merchantName || 'N/A'}</td>
              <td>${new Date(order.creationDate).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  // Getter for order state options
  get orderStateOptions() {
    return OrderStateOptions;
  }
}
