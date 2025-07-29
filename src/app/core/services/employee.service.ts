import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { PaginationResponse } from "../models/response"
import { AddEmployee, Employee, EmployeeParams, UpdateEmployee } from "../models/employee"

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employees`

  constructor(private http: HttpClient) {}

  // Get all employees with pagination and filtering
  getAllEmployees(params: EmployeeParams): Observable<PaginationResponse<Employee>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) httpParams = httpParams.set("search", params.search)
    if (params.branch) httpParams = httpParams.set("branch", params.branch)
    if (params.isActive !== undefined) httpParams = httpParams.set("isActive", params.isActive.toString())
    if (params.sort) httpParams = httpParams.set("sort", params.sort)

    return this.http
      .get<PaginationResponse<Employee>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(this.handleError))
  }

  // Get employee by ID
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/GetById/${id}`).pipe(catchError(this.handleError))
  }

  // Add a new employee
  addEmployee(employee: AddEmployee): Observable<string> {
    return this.http.post(`${this.apiUrl}/Add`, employee,{responseType: 'text'}).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Update an existing employee
  updateEmployee(employee: UpdateEmployee): Observable<string> {
    console.log(employee);

    return this.http.put(`${this.apiUrl}/Update`, employee,{responseType: 'text'}).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Delete an employee
  deleteEmployee(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`,{responseType: 'text'}).pipe(
      map((response) => response),
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
