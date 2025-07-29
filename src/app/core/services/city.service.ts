import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../enviroments/environment';
import { PaginationResponse } from '../models/response';
import { City, CityParams, CreateCity, EditCity } from '../models/city';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = `${environment.apiUrl}/Cities`;
  constructor(private http: HttpClient) {}

  // Get all cities with pagination and filtering
  getAllCities(params: CityParams): Observable<PaginationResponse<City>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.governorateId) httpParams = httpParams.set('governorateId', params.governorateId.toString());
    if (params.minChargePrice) httpParams = httpParams.set('minChargePrice', params.minChargePrice.toString());
    if (params.maxChargePrice) httpParams = httpParams.set('maxChargePrice', params.maxChargePrice.toString());
    if (params.minPickUpPrice) httpParams = httpParams.set('minPickUpPrice', params.minPickUpPrice.toString());
    if (params.maxPickUpPrice) httpParams = httpParams.set('maxPickUpPrice', params.maxPickUpPrice.toString());
    if (params.isDeleted !== undefined) httpParams = httpParams.set('isDeleted', params.isDeleted.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<PaginationResponse<City>>(`${this.apiUrl}/GetAll`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get city by ID
  getCityById(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/GetCityById/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Create a new city
  createCity(city: CreateCity): Observable<string> {
    return this.http.post(`${this.apiUrl}/CreateCity`, city,{responseType:'text'})
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  // Update an existing city
  editCity(city: EditCity): Observable<string> {
    return this.http.put(`${this.apiUrl}/Edit`, city,{responseType:'text'})
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  // Delete a city
  deleteCity(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/DeleteCity/${id}`,{responseType:'text'})
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  // Handle HTTP errors
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
