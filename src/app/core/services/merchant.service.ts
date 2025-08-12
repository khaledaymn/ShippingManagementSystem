import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import {
  Merchant,
  CreateMerchant,
  UpdateMerchant,
  MerchantQueryParams,
} from "../models/merchant"
import { PaginationResponse } from "../models/response"

@Injectable({
  providedIn: "root",
})
export class MerchantService {
  private readonly apiUrl = `${environment.apiUrl}/Merchants`

  constructor(private http: HttpClient) {}

  getMerchants(params: MerchantQueryParams): Observable<PaginationResponse<Merchant>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) {
      httpParams = httpParams.set("search", params.search)
    }

    if (params.isActive !== undefined) {
      httpParams = httpParams.set("isActive", params.isActive.toString())
    }

    if (params.sort) {
      httpParams = httpParams.set("sort", params.sort)
    }

    return this.http
      .get<PaginationResponse<Merchant>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(error => this.handleError(error,"Failed to retrieve merchants")))
  }

  getMerchantById(id: string): Observable<Merchant> {
    return this.http.get<Merchant>(`${this.apiUrl}/GetById/${id}`)
    .pipe(catchError(error => this.handleError(error,"Failed to retrieve merchant")))
  }

  createMerchant(merchant: CreateMerchant): Observable<{ success: boolean; message: string }> {
    return this.http.post(`${this.apiUrl}/Add`, merchant, {responseType: 'text'}).pipe(
      map((response) => ({ success: true, message: response })),
      catchError((error) => this.handleError(error, "Failed to create merchant")),
    )
  }

  updateMerchant(merchant: UpdateMerchant): Observable<{ success: boolean; message: string }> {
    return this.http.put(`${this.apiUrl}/Update`, merchant, {responseType: 'text'}).pipe(
      map((response) => ({ success: true, message: response })),
      catchError((error) => this.handleError(error, "Failed to update merchant")),
    )
  }

  deleteMerchant(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`, {responseType: 'text'}).pipe(
      map((response) => ({ success: true, message: response })),
      catchError((error) => this.handleError(error, "Failed to delete merchant")),
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
