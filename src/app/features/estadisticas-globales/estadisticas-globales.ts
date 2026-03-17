import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { UserMenu } from '../../shared/components/user-menu/user-menu';
import { AuthService } from '../../shared/services/auth.service';
import { API_BASE_URL } from '../../shared/config/api.config';

interface RankingJugador {
    posicion: number;
    nombre: string;
    usuario: string;
    ganadas: number;
    perdidas: number;
    empatadas: number;
    total: number;
    efectividad: number;
}

type CategoriaFiltro = 'todas' | 'ganadas' | 'perdidas' | 'empatadas';

@Component({
    selector: 'app-estadisticas-globales',
    imports: [UserMenu],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './estadisticas-globales.html',
    styleUrl: './estadisticas-globales.css'
})
export class EstadisticasGlobales implements OnInit {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly apiUrl = `${API_BASE_URL}/stats`;
    readonly filtro = signal('');
    readonly categoria = signal<CategoriaFiltro>('todas');
    readonly ranking = signal<RankingJugador[]>([]);

    ngOnInit(): void {
        this.cargarRanking();
    }

    readonly rankingFiltrado = computed(() => {
        const termino = this.filtro().trim().toLowerCase();
        const categoria = this.categoria();

        const base = [...this.ranking()];

        if (categoria !== 'todas') {
            base.sort((a, b) => {
                if (b[categoria] !== a[categoria]) {
                    return b[categoria] - a[categoria];
                }

                return b.ganadas - a.ganadas;
            });
        }

        const porCategoria = base.filter(jugador => {
            if (categoria === 'ganadas') {
                return jugador.ganadas > 0;
            }

            if (categoria === 'perdidas') {
                return jugador.perdidas > 0;
            }

            if (categoria === 'empatadas') {
                return jugador.empatadas > 0;
            }

            return true;
        });

        if (!termino) {
            return porCategoria;
        }

        return porCategoria.filter(jugador =>
            jugador.nombre.toLowerCase().includes(termino) ||
            jugador.usuario.toLowerCase().includes(termino)
        );
    });

    actualizarFiltro(valor: string): void {
        this.filtro.set(valor);
    }

    actualizarCategoria(valor: string): void {
        if (valor === 'ganadas' || valor === 'perdidas' || valor === 'empatadas' || valor === 'todas') {
            this.categoria.set(valor);
        }
    }

    obtenerMedalla(posicion: number): string {
        if (posicion === 1) {
            return '🥇';
        }

        if (posicion === 2) {
            return '🥈';
        }

        if (posicion === 3) {
            return '🥉';
        }

        return '•';
    }

    irACasino(): void {
        this.router.navigateByUrl('/casino');
    }

    private cargarRanking(): void {
        this.http.get<{ ranking: RankingJugador[] }>(
            `${this.apiUrl}/global`
        ).pipe(
            catchError(() => of({ ranking: [] }))
        ).subscribe(response => {
            this.ranking.set(Array.isArray(response.ranking) ? response.ranking : []);
        });
    }
}
