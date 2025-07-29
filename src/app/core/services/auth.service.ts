import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, throwError } from "rxjs"
import { map, tap, catchError } from "rxjs/operators"

import { AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, Role, User, UserCredentials } from "../models/user"
import { environment } from "../../../enviroments/environment"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/Account`
  private readonly TOKEN_KEY = "auth_token"
  private readonly USER_KEY = "user_data"
  private readonly PERMISSIONS_KEY = "user_permissions"

  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private permissionsSubject = new BehaviorSubject<{
    [moduleName: string]: string[] // Module ID to array of permission strings
  } | null>(null)
  public permissions$ = this.permissionsSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadUserFromStorage()
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY)
    const permissionsData = localStorage.getItem(this.PERMISSIONS_KEY)

    if (userData) {
      try {
        const user = JSON.parse(userData)
        this.currentUserSubject.next(user)
      } catch (e) {
        this.clearAuthData()
      }
    }

    if (permissionsData) {
      try {
        const permissions = JSON.parse(permissionsData)
        this.permissionsSubject.next(permissions)
      } catch (e) {
        localStorage.removeItem(this.PERMISSIONS_KEY)
        this.permissionsSubject.next(null)
      }
    }
  }

  login(credentials: UserCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/Login`, credentials).pipe(
      tap((response) => this.handleAuthResponse(response)),
      map((response) => {
        const user: User = {
          id: response.id,
          email: response.email || "",
          roleId: response.role,
          name: response.name,
        }
        return user
      }),
      catchError((error) => {
        console.error("Login failed", error)
        if (error.status === 401) {
          return throwError(() => new Error("Invalid credentials"))
        }
        return throwError(() => new Error("An error occurred during login. Please try again."))
      }),
    )
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post(this.API_URL + "/ForgetPassword", request, { responseType: "text" }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error("Forgot password request failed", error)
        if (error.status === 404) {
          return throwError(() => new Error("Email not found in our records."))
        }
        return throwError(() => new Error("An error occurred. Please try again later."))
      }),
    )
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(this.API_URL + "/ResetPassword", request, { responseType: "text" }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error("Reset password request failed", error)
        if (error.status === 400) {
          return throwError(() => new Error("Invalid or expired token."))
        }
        return throwError(() => new Error("An error occurred. Please try again later."))
      }),
    )
  }

  logout(): void {
    this.clearAuthData()
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  hasRole(role: Role): boolean {
    const user = this.currentUserSubject.value
    return !!user && user.roleId === role
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value
    return user ? user.roleId : null
  }

  hasPermission(moduleName: string, permissionType: string): boolean {
  const permissions = this.permissionsSubject.value;

  if (!permissions) {
    console.warn(`No permissions data available for user`);
    return false;
  }

  const modulePermissions = permissions[moduleName];

  if (!modulePermissions) {
    console.warn(`No permissions defined for module: ${moduleName}`);
    return false;
  }

  const hasPermission = modulePermissions.includes(permissionType);
  if (!hasPermission) {
    console.warn(`User lacks permission: ${permissionType} for module: ${moduleName}`);
  }
  return hasPermission;
}

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token)
    const user: User = {
      id: response.id,
      roleId: response.role,
      email: response.email || "",
      name: response.name,
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    this.currentUserSubject.next(user)

    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(response.permissions))
    this.permissionsSubject.next(response.permissions)
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.PERMISSIONS_KEY)
    this.currentUserSubject.next(null)
    this.permissionsSubject.next(null)
  }

}
