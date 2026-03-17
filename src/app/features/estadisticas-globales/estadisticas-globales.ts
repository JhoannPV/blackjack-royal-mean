import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { type RegistroEstadisticas } from '../casino/models/casino-game.model';
import { UserMenu } from '../../shared/components/user-menu/user-menu';
import { AuthService } from '../../shared/services/auth.service';

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
export class EstadisticasGlobales {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly filtro = signal('');
    readonly categoria = signal<CategoriaFiltro>('todas');

    readonly ranking = computed(() => {
        const usuarios = this.authService.obtenerUsuariosRegistrados();

        const datos = usuarios.map(usuario => {
            const estadisticas = this.obtenerEstadisticasPorUsuario(usuario.usuario);
            const total = estadisticas.ganadas + estadisticas.perdidas + estadisticas.empatadas;
            const efectividad = total > 0 ? (estadisticas.ganadas / total) * 100 : 0;

            return {
                nombre: usuario.nombre,
                usuario: usuario.usuario,
                ganadas: estadisticas.ganadas,
                perdidas: estadisticas.perdidas,
                empatadas: estadisticas.empatadas,
                total,
                efectividad
            };
        });

        return datos
            .sort((a, b) => {
                if (b.ganadas !== a.ganadas) {
                    return b.ganadas - a.ganadas;
                }

                if (b.efectividad !== a.efectividad) {
                    return b.efectividad - a.efectividad;
                }

                return b.total - a.total;
            })
            .map((item, index) => ({
                posicion: index + 1,
                ...item
            } satisfies RankingJugador));
    });

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

    private obtenerEstadisticasPorUsuario(usuario: string): RegistroEstadisticas {
        if (typeof window === 'undefined') {
            return { ganadas: 0, perdidas: 0, empatadas: 0 };
        }

        const raw = window.localStorage.getItem(`blackjack-royal-estadisticas-${usuario}`);

        if (!raw) {
            return { ganadas: 0, perdidas: 0, empatadas: 0 };
        }

        try {
            const datos = JSON.parse(raw) as Partial<RegistroEstadisticas>;

            return {
                ganadas: typeof datos.ganadas === 'number' ? datos.ganadas : 0,
                perdidas: typeof datos.perdidas === 'number' ? datos.perdidas : 0,
                empatadas: typeof datos.empatadas === 'number' ? datos.empatadas : 0
            };
        } catch {
            return { ganadas: 0, perdidas: 0, empatadas: 0 };
        }
    }
}
