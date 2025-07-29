import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { Branch, BranchParams, CreateBranch, UpdateBranch } from "../models/branch"
import { NotificationService } from "./notification.service"
import { PaginationResponse } from "../models/response"
import { City } from "../models/city"
import { CityService } from "./city.service"

@Injectable({
  providedIn: "root",
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/Branches`
  private readonly notificationService = inject(NotificationService)
  private readonly cityService = inject(CityService)

  constructor(private http: HttpClient) {}

  // Get all branches with pagination and filtering
  getAllBranches(params: BranchParams): Observable<PaginationResponse<Branch>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) httpParams = httpParams.set("search", params.search)
    if (params.location) httpParams = httpParams.set("location", params.location)
    if (params.cityId) httpParams = httpParams.set("cityId", params.cityId.toString())
    if (params.isDeleted !== undefined) httpParams = httpParams.set("isDeleted", params.isDeleted.toString())
    if (params.sort) httpParams = httpParams.set("sort", params.sort)
    console.log(params);
    
    return this.http.get<PaginationResponse<Branch>>(`${this.apiUrl}/GetAll`, { params: httpParams }).pipe(
      map((response) => {
        if (response.data && response.data.length > 0) {
        }
        return response
      }),
      catchError(this.handleError.bind(this)),
    )
  }

  // Get branch by ID
  getBranchById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/GetById/${id}`).pipe(
      map((branch) => {
        this.notificationService.showSuccess("Branch details loaded successfully")
        return branch
      }),
      catchError(this.handleError.bind(this)),
    )
  }

  // Create a new branch
  createBranch(branch: CreateBranch): Observable<string> {
    this.notificationService.showInfo("Creating new branch...", 2000)

    return this.http.post(`${this.apiUrl}/Create`, branch,{responseType:'text'}).pipe(
      map((response) => {
        this.notificationService.showSuccess("Branch created successfully")
        return response
      }),
      catchError((error) => {
        this.notificationService.showError("Failed to create branch")
        return this.handleError(error)
      }),
    )
  }

  // Update an existing branch
  updateBranch(id: number, branch: UpdateBranch): Observable<string> {
    this.notificationService.showInfo("Updating branch...", 2000)

    return this.http.put(`${this.apiUrl}/Update/${id}`, branch,{responseType:'text'}).pipe(
      map((response) => {
        this.notificationService.showSuccess("Branch updated successfully", 5000)
        return response
      }),
      catchError((error) => {
        this.notificationService.showError("Failed to update branch")
        return this.handleError(error)
      }),
    )
  }

  // Delete a branch
  deleteBranch(id: number): Observable<string> {
    this.notificationService.showWarning("Deleting branch...", 2000)

    return this.http.delete(`${this.apiUrl}/Delete/${id}`,{responseType:'text'}).pipe(
      map((response) => {
        this.notificationService.showSuccess("Branch deleted successfully")
        return response
      }),
      catchError((error) => {
        this.notificationService.showError("Failed to delete branch")
        return this.handleError(error)
      }),
    )
  }

// Get cities for dropdown using your city service
  getCities(): Observable<PaginationResponse<City>> {
    const params = {
      pageIndex: 1,
      pageSize: 1000, // Get all cities
      IsDeleted: false,
    }
    return this.cityService.getAllCities(params).pipe(
      map((response) => response || []),
      catchError(() => {
        // Return empty array if API fails
        this.notificationService.showError("Failed to load cities")
        return []
      }),
    )
  }

  // Validate branch data
  validateBranchData(data: CreateBranch | Branch): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if ("name" in data && (!data.name || data.name.trim().length < 2)) {
      errors.push("Branch name must be at least 2 characters long")
    }

    if ("location" in data && (!data.location || data.location.trim().length < 5)) {
      errors.push("Location must be at least 5 characters long")
    }

    if ("cityId" in data && (!data.cityId || data.cityId <= 0)) {
      errors.push("City must be selected")
    }

    const isValid = errors.length === 0

    if (!isValid) {
      errors.forEach((error) => {
        this.notificationService.showError(error, 6000)
      })
    }

    return { isValid, errors }
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

    console.error("BranchService Error:", error)
    this.notificationService.showError(errorMessage, 8000)

    return throwError(() => new Error(errorMessage))
  }
}
