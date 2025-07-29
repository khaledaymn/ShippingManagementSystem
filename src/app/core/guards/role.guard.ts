import { inject } from "@angular/core"
import { Router, CanActivateFn } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { Role } from "../models/user"

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService)
    const router = inject(Router)

    // First check if the user is authenticated
    if (!authService.isAuthenticated()) {
      return router.parseUrl("/auth/login")
    }

    // Then check if the user has any of the allowed roles
    const userRole = authService.getUserRole()
    if (userRole && allowedRoles.includes(userRole as Role)) {
      return true
    }

    // If not authorized, redirect to unauthorized page
    return router.parseUrl("/unauthorized")
  }
}
