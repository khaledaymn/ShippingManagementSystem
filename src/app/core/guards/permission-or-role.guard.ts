import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user';
import { inject } from '@angular/core';

export const permissionOrRoleGuard = (module: string, permission: string, allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/auth/login');
    }

    const hasPermission = authService.hasPermission(module, permission);

    const userRole = authService.getUserRole();
    const hasRole = userRole && allowedRoles.includes(userRole as Role);

    if ((hasPermission && userRole === Role.EMPLOYEE) || hasRole) {
      return true;
    }

    return router.parseUrl('/unauthorized');
  };
};
