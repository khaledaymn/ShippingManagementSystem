// import { Injectable } from "@angular/core"
// import {
//  HttpRequest,
//  HttpHandler,
//  HttpEvent,
//  HttpInterceptor,
//  HttpErrorResponse,
// } from "@angular/common/http"
// import { Observable, throwError } from "rxjs"
// import { catchError } from "rxjs/operators"
// import { AuthService } from "../services/auth.service"
// import { Router } from "@angular/router"

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//   ) {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     const token = this.authService.getToken()

//     // Add token to all requests except login, forgot password, reset password
//     const authEndpoints = [
//       `${this.authService["API_URL"]}/Login`,
//       `${this.authService["API_URL"]}/ForgetPassword`,
//       `${this.authService["API_URL"]}/ResetPassword`,
//     ]

//     const isAuthRequest = authEndpoints.some((url) => request.url.includes(url))

//     if (token && !isAuthRequest) {
//       request = this.addToken(request, token)
//     }

//     return next.handle(request).pipe(
//       catchError((error) => {
//         if (error instanceof HttpErrorResponse && error.status === 401) {
//           // Token is invalid or expired, or unauthorized access
//           this.authService.logout()
//           this.router.navigate(["/auth/login"], {
//             queryParams: { returnUrl: this.router.url },
//           })
//         }
//         return throwError(() => error)
//       }),
//     )
//   }

//   private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
//     return request.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//   }
// }



import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Add token to all requests except login, forgot password, reset password
  const authEndpoints = [
    `${authService['API_URL']}/Login`,
    `${authService['API_URL']}/ForgetPassword`,
    `${authService['API_URL']}/ResetPassword`,
  ];

  const isAuthRequest = authEndpoints.some((url) => req.url.includes(url));

  let request = req;
  if (token && !isAuthRequest) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token is invalid or expired, or unauthorized access
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => error);
    }),
  );
}
