import { shuffle } from 'underscore';

import { type Carta, type PaloCarta, type FiguraEspecial } from '../models/casino-game.model';

const PALOS: PaloCarta[] = ['C', 'D', 'H', 'S'];
const FIGURAS_ESPECIALES: FiguraEspecial[] = ['A', 'J', 'Q', 'K'];
const RANGO_INICIAL = 2;
const RANGO_FINAL = 10;

export const crearBaraja = (): Carta[] => {
    const deck: Carta[] = [];

    for (let i = RANGO_INICIAL; i <= RANGO_FINAL; i++) {
        for (const palo of PALOS) {
            deck.push(`${i}${palo}` as Carta);
        }
    }

    for (const palo of PALOS) {
        for (const especial of FIGURAS_ESPECIALES) {
            deck.push(`${especial}${palo}` as Carta);
        }
    }

    return shuffle(deck);
};

export const valorCarta = (carta: Carta): number => {
    const valor = carta.substring(0, carta.length - 1);

    if (!Number.isNaN(Number(valor))) {
        return Number(valor);
    }

    if (valor === 'A') {
        return 1;
    }

    if (valor === 'J') {
        return 11;
    }

    if (valor === 'Q') {
        return 12;
    }

    return 13;
};

export const rutaCarta = (carta: Carta): string => `/assets/cartas/${carta}.png`;
