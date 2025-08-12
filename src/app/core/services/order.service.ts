import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Order,
  Product,
  CreateOrderDTO,
  AssignOrderToDeliveryDTO,
  UpdateOrderStatusDTO,
  OrderParams,
  PaginatedResponse,
  OrderState,
} from '../models/order';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl + '/Orders';

  constructor(private http: HttpClient) {}

  /**
   * Handles HTTP errors and formats error messages.
   * @param error - The HTTP error response.
   * @returns An observable that throws an error with a formatted message.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Retrieves a paginated list of orders based on provided parameters.
   * @param params - The parameters for filtering, sorting, and pagination.
   * @returns An observable of a paginated response containing orders.
   */
  getOrders(params: OrderParams): Observable<PaginatedResponse<Order>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.orderState) httpParams = httpParams.set('orderState', params.orderState);
    if (params.cityId) httpParams = httpParams.set('cityId', params.cityId.toString());
    if (params.branchId) httpParams = httpParams.set('branchId', params.branchId.toString());
    if (params.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
    if (params.shippingRepresentativeId)
      httpParams = httpParams.set('shippingRepresentativeId', params.shippingRepresentativeId);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params.orderType) httpParams = httpParams.set('orderType', params.orderType);
    if (params.paymentType) httpParams = httpParams.set('paymentType', params.paymentType);
    if (params.isDeleted !== undefined) httpParams = httpParams.set('isDeleted', params.isDeleted.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http
      .get<PaginatedResponse<Order>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves a single order by its ID.
   * @param id - The ID of the order.
   * @returns An observable of the order.
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/GetById/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Retrieves orders by their status.
   * @param status - The status of the orders to retrieve.
   * @returns An observable of an array of orders.
   */
  getOrdersByStatus(status: OrderState): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/GetByStatus/${status}`).pipe(catchError(this.handleError));
  }

  /**
   * Retrieves products associated with a specific order.
   * @param orderId - The ID of the order.
   * @returns An observable of an array of products.
   */
  getProductsByOrderId(orderId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/GetProductsByOrderId/${orderId}`).pipe(catchError(this.handleError));
  }

  /**
   * Creates a new order.
   * @param order - The order data to create.
   * @returns An observable of the response with success status and message.
   */
  createOrder(order: CreateOrderDTO): Observable<string> {
    console.log(order);

    return this.http
      .post(`${this.apiUrl}/CreateOrder`, order, {responseType: 'text'})
      .pipe(catchError(this.handleError));
  }

  /**
   * Assigns an order to a delivery representative.
   * @param id - The ID of the order.
   * @param data - The data for assigning the order.
   * @returns An observable of the response with success status and message.
   */
  assignOrderToDelivery(id: number, data: AssignOrderToDeliveryDTO): Observable<string> {
    return this.http
      .put(`${this.apiUrl}/AssignToDelivery/${id}`, data, {responseType: 'text'})
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the status of an order.
   * @param id - The ID of the order.
   * @param data - The data for updating the order status.
   * @returns An observable of the response with success status and message.
   */
  updateOrderStatus(id: number, data: UpdateOrderStatusDTO): Observable<string> {
    return this.http
      .put(`${this.apiUrl}/UpdateOrder/${id}`, data, {responseType: 'text'})
      .pipe(catchError(this.handleError));
  }

  /**
   * Deletes an order by its ID.
   * @param id - The ID of the order.
   * @returns An observable of the response with success status and message.
   */
  deleteOrder(id: number): Observable<string> {
    return this.http
      .delete(`${this.apiUrl}/DeleteOrder/${id}`, {responseType: 'text'})
      .pipe(catchError(this.handleError));
  }
}
