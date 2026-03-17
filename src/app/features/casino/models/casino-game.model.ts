export type PaloCarta = 'C' | 'D' | 'H' | 'S';

export type FiguraEspecial = 'A' | 'J' | 'Q' | 'K';

export type Carta = `${number | FiguraEspecial}${PaloCarta}`;

export type ResultadoJuego = 'jugador' | 'computadora' | 'empate';

export interface RegistroEstadisticas {
    ganadas: number;
    perdidas: number;
    empatadas: number;
}
