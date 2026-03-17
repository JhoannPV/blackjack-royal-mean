import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-user-menu',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './user-menu.html',
    styleUrl: './user-menu.css'
})
export class UserMenu {
    readonly mostrarCasino = input(true);
    readonly mostrarEstadisticas = input(true);
    readonly mostrarEstadisticasGlobales = input(true);

    readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly menuAbierto = signal(false);

    alternarMenu(): void {
        this.menuAbierto.update(estado => !estado);
    }

    irACasino(): void {
        this.menuAbierto.set(false);
        this.router.navigateByUrl('/casino');
    }

    irAEstadisticas(): void {
        this.menuAbierto.set(false);
        this.router.navigateByUrl('/estadisticas');
    }

    irAEstadisticasGlobales(): void {
        this.menuAbierto.set(false);
        this.router.navigateByUrl('/estadisticas-globales');
    }

    cerrarSesion(): void {
        this.authService.cerrarSesion();
        this.menuAbierto.set(false);
        this.router.navigateByUrl('/login', { replaceUrl: true });
    }
}
