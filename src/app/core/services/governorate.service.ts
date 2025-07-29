import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { PaginationResponse } from "../models/response"
import { Governorate, GovernorateParams, CreateGovernorate, UpdateGovernorate } from "../models/governorate"

@Injectable({
  providedIn: "root",
})
export class GovernorateService {
  private apiUrl = `${environment.apiUrl}/Governorates`

  constructor(private http: HttpClient) {}

  // Get all governorates with pagination and filtering
  getAllGovernorates(params: GovernorateParams): Observable<PaginationResponse<Governorate>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) httpParams = httpParams.set("search", params.search)
    if (params.isDeleted !== undefined) httpParams = httpParams.set("isDeleted", params.isDeleted.toString())
    if (params.sort) httpParams = httpParams.set("sort", params.sort)

    return this.http
      .get<PaginationResponse<Governorate>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(this.handleError))
  }

  // Get governorate by ID
  getGovernorateById(id: number): Observable<Governorate> {
    return this.http.get<Governorate>(`${this.apiUrl}/GetById/${id}`).pipe(catchError(this.handleError))
  }

  // Get all active governorates (for dropdowns)
  getActiveGovernorates(): Observable<Governorate[]> {
    const params = new HttpParams().set("pageIndex", "1").set("pageSize", "100").set("isDeleted", "false")

    return this.http.get<PaginationResponse<Governorate>>(`${this.apiUrl}/GetAll`, { params }).pipe(
      map((response) => response.data as Governorate[] || []),
      catchError(this.handleError),
    )
  }

  // Create a new governorate
  createGovernorate(governorate: CreateGovernorate): Observable<string> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/Create`, governorate).pipe(
      map((response) => response.message),
      catchError(this.handleError),
    )
  }

  // Update an existing governorate
  updateGovernorate(id: number, governorate: UpdateGovernorate): Observable<string> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/Update/${id}`, governorate).pipe(
      map((response) => response.message),
      catchError(this.handleError),
    )
  }

  // Delete a governorate
  deleteGovernorate(id: number): Observable<string> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Delete/${id}`).pipe(
      map((response) => response.message),
      catchError(this.handleError),
    )
  }

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
