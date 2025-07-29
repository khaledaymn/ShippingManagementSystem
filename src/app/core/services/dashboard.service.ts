// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { OrderService } from './order.service';
// import { OrderFilterParams, OrdersResponse } from '../models/order.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class DashboardService {
//   constructor(private orderAwareService: OrderService) {}

//   // Get orders for a specific merchant by ID and status
//   getMerchantOrders(merchantId: string, status: string): Observable<OrdersResponse> {
//     const params: OrderFilterParams = {
//       pageIndex: 1,
//       pageSize: 100,
//       merchantId,
//       status
//     };

//     return this.orderService.getOrders(params);
//   }

//   // Get orders for a specific representative by ID and status
//   getRepresentativeOrders(representativeId: string, status: string): Observable<OrdersResponse> {
//     const params: OrderFilterParams = {
//       pageIndex: 1,
//       pageSize: 100,
//       representativeId,
//       status
//     };

//     return this.orderService.getOrders(params);
//   }

//   // Get all orders filtered by status
//   getAllOrders(status: string): Observable<OrdersResponse> {
//     const params: OrderFilterParams = {
//       pageIndex: 1,
//       pageSize: 100,
//       status
//     };

//     return this.orderService.getOrders(params);
//   }
// }
