import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard = (module: string, permission: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/auth/login');
    }

    if (authService.hasPermission(module, permission)) {
      return true;
    }

    return router.parseUrl('/unauthorized');
  };
};
