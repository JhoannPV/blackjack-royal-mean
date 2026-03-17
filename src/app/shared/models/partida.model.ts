export interface Partida {
    jugadorId: string;
    resultado: 'victoria' | 'derrota' | 'empate';
    fecha: Date;
}
