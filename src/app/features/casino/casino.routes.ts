import { Routes } from '@angular/router';

export const casinoRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./casino').then(c => c.Casino)
    }
];
