import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'casino',
        pathMatch: 'full'
    },
    {
        path: 'casino',
        canActivate: [authGuard],
        loadComponent: () => import('./features/casino/casino').then(c => c.Casino)
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/login/login').then(c => c.Login)
    },
    {
        path: 'estadisticas',
        canActivate: [authGuard],
        loadComponent: () => import('./features/estadisticas/estadisticas').then(c => c.Estadisticas)
    },
    {
        path: 'estadisticas-globales',
        canActivate: [authGuard],
        loadComponent: () => import('./features/estadisticas-globales/estadisticas-globales').then(c => c.EstadisticasGlobales)
    },
    {
        path: '**',
        redirectTo: 'casino'
    }
];
