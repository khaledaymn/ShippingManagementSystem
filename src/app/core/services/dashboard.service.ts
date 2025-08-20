import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { DashboardSummary } from "../models/dashboard"
import { environment } from "../../../enviroments/environment"

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private apiUrl = environment.apiUrl + "/Dashboard"

  constructor(private http: HttpClient) {}

  getDashboardSummary(userId?: string): Observable<DashboardSummary> {
    const url = userId ? `${this.apiUrl}?userId=${userId}` : `${this.apiUrl}`
    return this.http.get<DashboardSummary>(url).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "An unexpected error occurred"
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`
    }
    console.error(errorMessage)
    return throwError(() => new Error(errorMessage))
  }
}
