import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { type Carta } from './models/casino-game.model';
import { UserMenu } from '../../shared/components/user-menu/user-menu';
import { ResultModal } from '../../shared/components/result-modal/result-modal';
import { CasinoGameService } from './services/casino-game.service';
import { rutaCarta } from './utils/casino-deck.util';

@Component({
    selector: 'app-casino',
    imports: [UserMenu, ResultModal],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './casino.html',
    styleUrl: './casino.css'
})
export class Casino implements OnInit {
    readonly juego = inject(CasinoGameService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.nuevoJuego();
    }

    nuevoJuego(): void {
        this.juego.nuevoJuego();
    }

    pedirCarta(): void {
        this.juego.pedirCartaJugador();
    }

    detenerJuego(): void {
        this.juego.detenerJuego();
    }

    obtenerRutaCarta(carta: Carta): string {
        return rutaCarta(carta);
    }

    irAEstadisticas(): void {
        this.router.navigateByUrl('/estadisticas');
    }
}
