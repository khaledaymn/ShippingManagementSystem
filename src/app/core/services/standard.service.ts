import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError, BehaviorSubject } from "rxjs"
import { catchError, map, tap } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { Standard, UpdateStandard } from "../models/standard"
import { NotificationService } from "./notification.service"

@Injectable({
  providedIn: "root",
})
export class StandardService {
  private apiUrl = `${environment.apiUrl}/Standard`
  private standardsSubject = new BehaviorSubject<Standard[]>([])
  public standards$ = this.standardsSubject.asObservable()
  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$ = this.loadingSubject.asObservable()

  constructor(private http: HttpClient,
    private notificationService: NotificationService
  ) {}


  // Get all standards
  getSetting(): Observable<Standard[]> {
    this.loadingSubject.next(true)
    return this.http.get<Standard[]>(`${this.apiUrl}/GetSetting`).pipe(
      map((standards) => {
        const firstStandard = standards.filter((s) => s.id === 1)
        if (firstStandard) {
        } else {
          this.notificationService.showWarning("No standard configuration found")
        }
        return firstStandard
      }),
      tap((standards) => {
        this.standardsSubject.next(standards)
        this.loadingSubject.next(false)
      }),
      catchError((error) => {
        this.loadingSubject.next(false)
        return this.handleError(error)
      }),
    )
  }

  updateStandard(id: number, standard: UpdateStandard): Observable<string> {
    this.loadingSubject.next(true);
    return this.http.put(`${this.apiUrl}/Update/${id}`, standard, { responseType: 'text' as const }).pipe(
      tap(() => {
        // Refresh the standards list after update
        this.getSetting().subscribe();
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.notificationService.showError("Failed to update standard configuration")
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
}

  validateStandardData(data: UpdateStandard): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.standardWeight || data.standardWeight <= 0) {
      errors.push("Standard weight must be greater than 0")
    }

    if (!data.villagePrice || data.villagePrice <= 0) {
      errors.push("Village price must be greater than 0")
    }

    if (!data.kgPrice || data.kgPrice <= 0) {
      errors.push("KG price must be greater than 0")
    }

    if (data.standardWeight && data.standardWeight > 1000) {
      errors.push("Standard weight cannot exceed 1000 kg")
    }

    if (data.villagePrice && data.villagePrice > 999999.99) {
      errors.push("Village price cannot exceed $999,999.99")
    }

    if (data.kgPrice && data.kgPrice > 999999.99) {
      errors.push("KG price cannot exceed $999,999.99")
    }

    const isValid = errors.length === 0

    if (!isValid) {
      errors.forEach((error) => {
        this.notificationService.showError(error, 6000)
      })
    }

    return { isValid, errors }
  }
  
  /**
   * Calculate derived values
   */
  calculateDerivedValues(data: UpdateStandard) {
    return {
      pricePerGram: data.kgPrice ? data.kgPrice / 1000 : 0,
      totalForStandardWeight: data.standardWeight && data.kgPrice ? data.standardWeight * data.kgPrice : 0,
      priceDifference: data.villagePrice && data.kgPrice ? Math.abs(data.villagePrice - data.kgPrice) : 0,
      profitMargin: data.villagePrice && data.kgPrice ? ((data.villagePrice - data.kgPrice) / data.kgPrice) * 100 : 0,
    }
  }
  
  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "An error occurred"

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = "Bad Request: Please check your input data"
          break
        case 401:
          errorMessage = "Unauthorized: Please log in again"
          break
        case 403:
          errorMessage = "Forbidden: You do not have permission to perform this action"
          break
        case 404:
          errorMessage = "Not Found: The requested resource was not found"
          break
        case 500:
          errorMessage = "Internal Server Error: Please try again later"
          break
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`
      }
    }

    console.error("StandardService Error:", error)
    return throwError(() => new Error(errorMessage))
  }

  // Get current standards from subject
  getCurrentStandards(): Standard[] {
    return this.standardsSubject.value
  }

  // Check if standards are loaded
  isStandardsLoaded(): boolean {
    return this.standardsSubject.value.length > 0
  }

  // Get first standard
  getFirstStandard(): Observable<Standard | null> {
    return this.getSetting().pipe(map((standards) => (standards.length > 0 ? standards[0] : null)))
  }
}
