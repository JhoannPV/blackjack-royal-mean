import { computed, effect, Injectable, inject, signal } from '@angular/core';

import { type Carta, type RegistroEstadisticas, type ResultadoJuego } from '../models/casino-game.model';
import { AuthService } from '../../../shared/services/auth.service';
import { crearBaraja, valorCarta } from '../utils/casino-deck.util';

@Injectable({
    providedIn: 'root'
})
export class CasinoGameService {
    private readonly storageKeyBase = 'blackjack-royal-estadisticas';
    private readonly authService = inject(AuthService);

    private readonly deck = signal<Carta[]>([]);

    readonly cartasJugador = signal<Carta[]>([]);
    readonly cartasComputadora = signal<Carta[]>([]);

    readonly puntosJugador = signal(0);
    readonly puntosComputadora = signal(0);

    readonly juegoTerminado = signal(true);
    readonly mensajeEstado = signal('Pulsa "Nuevo Juego" para empezar.');

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
        let mensaje = 'Nadie gana :(';

        if (resultado === 'jugador') {
            mensaje = 'Jugador gana';
        }

        if (resultado === 'computadora') {
            mensaje = 'Computadora gana';
        }

        this.actualizarEstadisticas(resultado);

        this.mensajeEstado.set(`Resultado: ${mensaje}`);

        if (typeof window !== 'undefined') {
            setTimeout(() => {
                window.alert(mensaje);
            }, 100);
        }
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
        if (resultado === 'jugador') {
            this.ganadas.update(total => total + 1);
        }

        if (resultado === 'computadora') {
            this.perdidas.update(total => total + 1);
        }

        if (resultado === 'empate') {
            this.empatadas.update(total => total + 1);
        }

        this.guardarEstadisticas();
    }

    private cargarEstadisticas(usuario: string | null): void {
        if (!usuario) {
            this.ganadas.set(0);
            this.perdidas.set(0);
            this.empatadas.set(0);
            return;
        }

        if (typeof window === 'undefined') {
            return;
        }

        const datos = window.localStorage.getItem(this.obtenerStorageKey(usuario));

        if (!datos) {
            return;
        }

        try {
            const registro = JSON.parse(datos) as Partial<RegistroEstadisticas>;
            this.ganadas.set(typeof registro.ganadas === 'number' ? registro.ganadas : 0);
            this.perdidas.set(typeof registro.perdidas === 'number' ? registro.perdidas : 0);
            this.empatadas.set(typeof registro.empatadas === 'number' ? registro.empatadas : 0);
        } catch {
            this.ganadas.set(0);
            this.perdidas.set(0);
            this.empatadas.set(0);
        }
    }

    private guardarEstadisticas(): void {
        const usuario = this.authService.usuarioActual()?.usuario ?? null;

        if (!usuario) {
            return;
        }

        if (typeof window === 'undefined') {
            return;
        }

        const registro: RegistroEstadisticas = {
            ganadas: this.ganadas(),
            perdidas: this.perdidas(),
            empatadas: this.empatadas()
        };

        window.localStorage.setItem(this.obtenerStorageKey(usuario), JSON.stringify(registro));
    }

    private obtenerStorageKey(usuario: string): string {
        return `${this.storageKeyBase}-${usuario}`;
    }
}
