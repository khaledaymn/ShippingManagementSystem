import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { CreateShippingType, ShippingType, ShippingTypeParams } from "../models/shipping-type"
import { PaginationResponse } from "../models/response"

@Injectable({
  providedIn: "root",
})
export class ShippingTypeService {
  private apiUrl = `${environment.apiUrl}/ChargeTypes` // Using chargeType endpoint

  constructor(private http: HttpClient) {}

  // Get all shipping types with pagination and filtering
  getAllShippingTypes(params: ShippingTypeParams): Observable<PaginationResponse<ShippingType>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) httpParams = httpParams.set("search", params.search)
    if (params.minPrice !== undefined) httpParams = httpParams.set("minPrice", params.minPrice.toString())
    if (params.maxPrice !== undefined) httpParams = httpParams.set("maxPrice", params.maxPrice.toString())
    if (params.minDays !== undefined) httpParams = httpParams.set("minDays", params.minDays.toString())
    if (params.maxDays !== undefined) httpParams = httpParams.set("maxDays", params.maxDays.toString())
    if (params.isDeleted !== undefined) httpParams = httpParams.set("isDeleted", params.isDeleted.toString())
    if (params.sort) httpParams = httpParams.set("sort", params.sort)

    return this.http
      .get<PaginationResponse<ShippingType>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(this.handleError))
  }

  // Get shipping type by ID
  getShippingTypeById(id: number): Observable<ShippingType> {
    return this.http.get<ShippingType>(`${this.apiUrl}/GetById/${id}`).pipe(catchError(this.handleError))
  }

  // Create a new shipping type
  createShippingType(shippingType: CreateShippingType): Observable<string> {
    return this.http.post(`${this.apiUrl}/Create`, shippingType,{ responseType: 'text' }).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Update an existing shipping type
  updateShippingType(id: number, shippingType: ShippingType): Observable<string> {
    return this.http.put(`${this.apiUrl}/Update/${id}`, shippingType,{ responseType: 'text' }).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Delete a shipping type
  deleteShippingType(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`, { responseType: 'text' }).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

 // Bulk delete shipping types
  // bulkDeleteShippingTypes(ids: number[]): Observable<string> {
  //   return this.http.post<{ message: string }>(`${this.apiUrl}/BulkDelete`, { ids }).pipe(
  //     map((response) => response.message),
  //     catchError(this.handleError),
  //   )
  // }

  // Handle HTTP errors

  private handleError(error: any): Observable<never> {
    let errorMessage = "An error occurred"
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    return throwError(() => new Error(errorMessage))
  }
  
}
