import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'casino',
        pathMatch: 'full'
    },
    {
        path: 'casino',
        loadComponent: () => import('./features/casino/casino').then(c => c.Casino)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then(c => c.Login)
    },
    {
        path: 'estadisticas',
        loadComponent: () => import('./features/estadisticas/estadisticas').then(c => c.Estadisticas)
    },
    {
        path: 'estadisticas-globales',
        loadComponent: () => import('./features/estadisticas-globales/estadisticas-globales').then(c => c.EstadisticasGlobales)
    },
    {
        path: '**',
        redirectTo: 'casino'
    }
];
