export interface Partida {
    id: string;
    jugadorId: string;
    resultado: 'victoria' | 'derrota' | 'empate';
    fecha: Date;
}
