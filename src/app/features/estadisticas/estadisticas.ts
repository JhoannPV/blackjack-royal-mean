import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CasinoGameService } from '../casino/services/casino-game.service';
import { UserMenu } from '../../shared/components/user-menu/user-menu';

@Component({
    selector: 'app-estadisticas',
    imports: [UserMenu],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './estadisticas.html',
    styleUrl: './estadisticas.css'
})
export class Estadisticas {
    readonly juego = inject(CasinoGameService);
    private readonly router = inject(Router);

    irACasino(): void {
        this.router.navigateByUrl('/casino');
    }

    irAEstadisticasGlobales(): void {
        this.router.navigateByUrl('/estadisticas-globales');
    }
}
