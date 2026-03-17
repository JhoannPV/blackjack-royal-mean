import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.sesionValida()) {
        return true;
    }

    authService.cerrarSesion();

    return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.sesionValida()) {
        return true;
    }

    return router.createUrlTree(['/casino']);
};
