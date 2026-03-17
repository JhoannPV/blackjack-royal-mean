import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    const esLogin = req.url.includes('/auth/login');
    const esRegister = req.url.includes('/auth/register');

    if (esLogin || esRegister || req.headers.has('Authorization')) {
        return next(req);
    }

    const token = authService.token();

    if (!token) {
        return next(req);
    }

    const reqConToken = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(reqConToken);
};
