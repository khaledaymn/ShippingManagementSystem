import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order, OrderStateOptions, OrderTypeOptions, PaymentTypeOptions } from '../../../../core/models/order';
import { NotificationComponent } from '../../../../shared/notification/notification.component';
import { Role } from '../../../../core/models/user';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class DeliveryOrderDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  order: Order | null = null;
  loading = false;
  error: string | null = null;
  successMessage = '';
  canEdit = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.loadOrderDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrderDetails(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (orderId) {
      this.loading = true;
      this.orderService.getOrderById(orderId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (order) => {
            console.log(order);

            this.order = order;
            this.loading = false;
            // Load products if not included in the initial response
            if (!order.products) {
              this.loadOrderProducts(orderId);
            }
          },
          error: (error) => {
            this.error = error.message || 'Failed to load order details';
            this.loading = false;
          }
        });
    } else {
      this.error = 'Invalid order ID';
      this.loading = false;
    }
  }

  private loadOrderProducts(orderId: number): void {
    this.orderService.getProductsByOrderId(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          if (this.order) {
            this.order.products = products;
          }
        },
        error: (error) => {
          this.error = error.message || 'Failed to load order products';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/delivery/orders']);
  }

  printOrder(): void {
    if (this.order) {
      const printContent = this.generateOrderPrintContent();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  private generateOrderPrintContent(): string {
    if (!this.order) return '';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${this.order.id}</title>
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
          <h2>Order #${this.order.id}</h2>
        </div>

        <div class="order-info">
          <h3>Customer Information</h3>
          <div class="info-row"><span>Name:</span><span>${this.order.customerName}</span></div>
          <div class="info-row"><span>Phone:</span><span>${this.order.customerPhone1}</span></div>
          ${this.order.customerPhone2 ? `<div class="info-row"><span>Phone 2:</span><span>${this.order.customerPhone2}</span></div>` : ''}
          <div class="info-row"><span>Address:</span><span>${this.order.villageAndStreet}</span></div>
          <div class="info-row"><span>City:</span><span>${this.order.cityName || 'N/A'}</span></div>
        </div>

        <div class="order-info">
          <h3>Order Details</h3>
          <div class="info-row"><span>Status:</span><span>${this.formatOrderStatus(this.order.orderState)}</span></div>
          <div class="info-row"><span>Type:</span><span>${this.formatOrderType(this.order.orderType)}</span></div>
          <div class="info-row"><span>Payment:</span><span>${this.formatPaymentType(this.order.paymentType)}</span></div>
          <div class="info-row"><span>Created:</span><span>${new Date(this.order.creationDate).toLocaleDateString('en-GB')}</span></div>
          <div class="info-row"><span>Merchant:</span><span>${this.order.merchantName || 'N/A'}</span></div>
          <div class="info-row"><span>Representative:</span><span>${this.order.shippingRepresentativeName || 'N/A'}</span></div>
        </div>

        ${this.order.products && this.order.products.length > 0 ? `
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
              ${this.order.products.map(product => `
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
          <div>Order Price: $${this.order.orderPrice.toFixed(2)}</div>
          <div>Charge Price: $${this.order.chargePrice.toFixed(2)}</div>
          <div>Amount Received: $${this.order.amountReceived.toFixed(2)}</div>
          <div>Total Weight: ${this.order.totalWeight} kg</div>
          <div class="total-final">Total: $${(this.order.orderPrice + this.order.chargePrice).toFixed(2)}</div>
        </div>

        ${this.order.notes ? `
        <div class="order-info">
          <h3>Notes</h3>
          <p>${this.order.notes}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  formatOrderStatus(status: string): string {
    return OrderStateOptions.find(option => option.value === status)?.label || status;
  }

  formatOrderType(type: string): string {
    return OrderTypeOptions.find(option => option.value === type)?.label || type;
  }

  formatPaymentType(type: string): string {
    return PaymentTypeOptions.find(option => option.value === type)?.label || type;
  }
}
