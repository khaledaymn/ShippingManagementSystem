import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../../enviroments/environment"
import { PaginationResponse } from "../models/response"
import { CreateGroup, Group, GroupParams, Medule, MeduleParams, UpdateGroup } from "../models/group"

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/Group`

  constructor(private http: HttpClient) {}

  // Get all groups with pagination and filtering
  getAllGroups(params: GroupParams): Observable<PaginationResponse<Group>> {
    let httpParams = new HttpParams()
      .set("pageIndex", params.pageIndex.toString())
      .set("pageSize", params.pageSize.toString())

    if (params.search) httpParams = httpParams.set("search", params.search)
    if (params.userId) httpParams = httpParams.set("userId", params.userId)
    if (params.fromDate) httpParams = httpParams.set("fromDate", params.fromDate)
    if (params.toDate) httpParams = httpParams.set("toDate", params.toDate)
    if (params.sort) httpParams = httpParams.set("sort", params.sort)

    return this.http
      .get<PaginationResponse<Group>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(catchError(this.handleError))
  }

  // Get group by ID
  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/GetById/${id}`).pipe(catchError(this.handleError))
  }

  // Create a new group
  createGroup(group: CreateGroup): Observable<string> {
    console.log(group);

    return this.http.post(`${this.apiUrl}/Create`, group , {responseType:'text'}).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Update an existing group
  updateGroup(id: number, group: UpdateGroup): Observable<string> {
    console.log(id,group);

    return this.http.put(`${this.apiUrl}/Update/${id}`, group , {responseType:'text'}).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  // Delete a group
  deleteGroup(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`, {responseType:'text'}).pipe(
      map((response) => response),
      catchError(this.handleError),
    )
  }

  getAllMedules(): Observable<PaginationResponse<Medule>> {
    let httpParams = new HttpParams()
      .set('pageIndex', 1)
      .set('pageSize', 20);

    return this.http.get<PaginationResponse<Medule>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
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
