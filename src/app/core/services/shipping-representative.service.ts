import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import {
  ShippingRepresentative,
  CreateShippingRepresentative,
  UpdateShippingRepresentative,
  ShippingRepresentativeQueryParams,
} from "../models/shipping-representative"
import { environment } from "../../../enviroments/environment"
import { PaginationResponse } from "../models/response"

@Injectable({
  providedIn: "root",
})
export class ShippingRepresentativeService {
  private readonly apiUrl = `${environment.apiUrl}/ShippingRepresentatives`;

  constructor(private http: HttpClient) {}

  getShippingRepresentatives(
    params: ShippingRepresentativeQueryParams,
  ): Observable<PaginationResponse<ShippingRepresentative>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) {
      httpParams = httpParams.set("search", params.search)
    }

    if (params.branch) {
      httpParams = httpParams.set("branch", params.branch)
    }

    if (params.isActive !== undefined) {
      httpParams = httpParams.set("isActive", params.isActive.toString())
    }

    if (params.sort) {
      httpParams = httpParams.set("sort", params.sort)
    }

    if (params.governorateId !== undefined) {
      httpParams = httpParams.set("governorateId", params.governorateId.toString())
    }

    return this.http
      .get<PaginationResponse<ShippingRepresentative>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(error => this.handleError(error, "Failed to retrieve shipping representatives")))
  }

  getShippingRepresentativeById(id: string): Observable<ShippingRepresentative> {
    return this.http.get<ShippingRepresentative>(`${this.apiUrl}/GetById/${id}`).pipe(catchError( error => this.handleError(error, "Failed to retrieve shipping representative")))
  }

  createShippingRepresentative(
    representative: CreateShippingRepresentative,
  ): Observable<{ success: boolean; message: string }> {
    representative.discountType = Number(representative.discountType);
    return this.http.post<{ message: string }>(`${this.apiUrl}/Add`, representative).pipe(
      map((response) => ({ success: true, message: response.message })),
      catchError((error) => this.handleError(error, "Failed to create shipping representative")),
    )
  }

  updateShippingRepresentative(
    representative: UpdateShippingRepresentative,
  ): Observable<{ success: boolean; message: string }> {
    representative.discountType = Number(representative.discountType);
    return this.http.put<{ message: string }>(`${this.apiUrl}/Update`, representative).pipe(
      map((response) => ({ success: true, message: response.message })),
      catchError((error) => this.handleError(error, "Failed to update shipping representative")),
    )
  }

  deleteShippingRepresentative(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Delete/${id}`).pipe(
      map((response) => ({ success: true, message: response.message })),
      catchError((error) => this.handleError(error, "Failed to delete shipping representative")),
    )
  }

  private handleError(error: HttpErrorResponse, defaultMessage?: string): Observable<never> {
    let errorMessage = defaultMessage || "An error occurred"

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`
    } else {
      errorMessage = error.error?.message || `Server error: ${error.status} - ${error.message}`
    }

    return throwError(() => new Error(errorMessage))
  }
}
