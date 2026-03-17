import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { type Carta, type ResultadoJuego } from '../models/casino-game.model';
import { AuthService } from '../../../shared/services/auth.service';
import { API_BASE_URL } from '../../../shared/config/api.config';
import { crearBaraja, valorCarta } from '../utils/casino-deck.util';

interface EstadisticasResponse {
    ganadas: number;
    perdidas: number;
    empatadas: number;
    totalPartidas: number;
}

@Injectable({
    providedIn: 'root'
})
export class CasinoGameService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiUrl = `${API_BASE_URL}/stats`;

    private readonly deck = signal<Carta[]>([]);

    readonly cartasJugador = signal<Carta[]>([]);
    readonly cartasComputadora = signal<Carta[]>([]);

    readonly puntosJugador = signal(0);
    readonly puntosComputadora = signal(0);

    readonly juegoTerminado = signal(true);
    readonly mensajeEstado = signal('Pulsa "Nuevo Juego" para empezar.');
    readonly modalVisible = signal(false);
    readonly modalTitulo = signal('Resultado');
    readonly modalMensaje = signal('');
    readonly modalTipo = signal<'ganador' | 'perdedor' | 'empate'>('empate');

    readonly ganadas = signal(0);
    readonly perdidas = signal(0);
    readonly empatadas = signal(0);

    readonly puedePedir = computed(() => !this.juegoTerminado());
    readonly puedeDetener = computed(() => !this.juegoTerminado() && this.cartasJugador().length > 0);
    readonly totalPartidas = computed(() => this.ganadas() + this.perdidas() + this.empatadas());

    constructor() {
        effect(() => {
            const usuario = this.authService.usuarioActual()?.usuario ?? null;
            this.cargarEstadisticas(usuario);
        });
    }

    nuevoJuego(): void {
        this.deck.set(crearBaraja());
        this.cartasJugador.set([]);
        this.cartasComputadora.set([]);
        this.puntosJugador.set(0);
        this.puntosComputadora.set(0);
        this.juegoTerminado.set(false);
        this.mensajeEstado.set('Turno del jugador: pide una carta o plántate.');
        this.cerrarModalResultado();
    }

    pedirCartaJugador(): void {
        if (!this.puedePedir()) {
            return;
        }

        const carta = this.tomarCarta();
        this.cartasJugador.update(cartas => [...cartas, carta]);

        const puntosActuales = this.puntosJugador() + valorCarta(carta);
        this.puntosJugador.set(puntosActuales);

        if (puntosActuales >= 21) {
            this.iniciarTurnoComputadora();
        }
    }

    detenerJuego(): void {
        if (!this.puedeDetener()) {
            return;
        }

        this.iniciarTurnoComputadora();
    }

    private iniciarTurnoComputadora(): void {
        this.juegoTerminado.set(true);

        const puntosMinimos = this.puntosJugador();

        while (this.puntosComputadora() <= puntosMinimos && puntosMinimos < 21) {
            const carta = this.tomarCarta();
            this.cartasComputadora.update(cartas => [...cartas, carta]);
            this.puntosComputadora.update(total => total + valorCarta(carta));

            if (this.puntosComputadora() > 21) {
                break;
            }
        }

        while (this.puntosComputadora() < puntosMinimos && puntosMinimos === 21) {
            const carta = this.tomarCarta();
            this.cartasComputadora.update(cartas => [...cartas, carta]);
            this.puntosComputadora.update(total => total + valorCarta(carta));

            if (this.puntosComputadora() >= 21) {
                break;
            }
        }

        this.notificarResultado(this.determinarGanador());
    }

    private determinarGanador(): ResultadoJuego {
        const puntosJugador = this.puntosJugador();
        const puntosComputadora = this.puntosComputadora();

        if (puntosJugador > 21) {
            return 'computadora';
        }

        if (puntosComputadora > 21) {
            return 'jugador';
        }

        if (puntosJugador === 21 && puntosComputadora === 21) {
            return 'empate';
        }

        return 'computadora';
    }

    private notificarResultado(resultado: ResultadoJuego): void {
        let mensaje = 'Nadie gana 😞';
        let titulo = 'Empate';
        let tipo: 'ganador' | 'perdedor' | 'empate' = 'empate';

        if (resultado === 'jugador') {
            mensaje = 'Jugador gana';
            titulo = 'Ganaste';
            tipo = 'ganador';
        }

        if (resultado === 'computadora') {
            mensaje = 'Computadora gana';
            titulo = 'Perdiste';
            tipo = 'perdedor';
        }

        this.actualizarEstadisticas(resultado);

        this.mensajeEstado.set(`Resultado: ${mensaje}`);
        this.modalTitulo.set(titulo);
        this.modalMensaje.set(mensaje);
        this.modalTipo.set(tipo);
        this.modalVisible.set(true);
    }

    cerrarModalResultado(): void {
        this.modalVisible.set(false);
    }

    private tomarCarta(): Carta {
        const mazo = this.deck();

        if (mazo.length === 0) {
            throw new Error('No hay cartas en el deck');
        }

        const carta = mazo[mazo.length - 1];
        this.deck.set(mazo.slice(0, -1));

        return carta;
    }

    private actualizarEstadisticas(resultado: ResultadoJuego): void {
        const resultadoBackend = resultado === 'jugador'
            ? 'ganada'
            : resultado === 'computadora'
                ? 'perdida'
                : 'empatada';

        this.http.post<EstadisticasResponse>(
            `${this.apiUrl}/register-result`,
            { resultado: resultadoBackend }
        ).pipe(
            catchError(() => of(null))
        ).subscribe(response => {
            if (!response) {
                return;
            }

            this.ganadas.set(response.ganadas);
            this.perdidas.set(response.perdidas);
            this.empatadas.set(response.empatadas);
        });
    }

    private cargarEstadisticas(usuario: string | null): void {
        if (!usuario) {
            this.ganadas.set(0);
            this.perdidas.set(0);
            this.empatadas.set(0);
            return;
        }

        this.http.get<EstadisticasResponse>(`${this.apiUrl}/me`).pipe(
            catchError(() => of<EstadisticasResponse>({ ganadas: 0, perdidas: 0, empatadas: 0, totalPartidas: 0 }))
        ).subscribe(response => {
            this.ganadas.set(response.ganadas);
            this.perdidas.set(response.perdidas);
            this.empatadas.set(response.empatadas);
        });
    }
}
