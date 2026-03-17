import { computed, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, Observable, tap } from 'rxjs';

import { type ResultadoAuth, type UsuarioSesion } from '../models/auth-user.model';
import { API_BASE_URL } from '../config/api.config';

interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        username: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${API_BASE_URL}/auth`;
    private readonly storageTokenKey = 'blackjack-royal-jwt';
    private readonly storageSesionKey = 'blackjack-royal-sesion';
    private sessionVersion = 0;

    readonly token = signal('');
    readonly usuarioActual = signal<UsuarioSesion | null>(null);
    readonly autenticado = computed(() => this.token().length > 0 && this.usuarioActual() !== null);

    readonly nombreUsuario = computed(() => this.usuarioActual()?.nombre ?? 'Invitado');
    readonly inicialUsuario = computed(() => {
        const nombre = this.usuarioActual()?.nombre?.trim() ?? '';

        if (!nombre) {
            return '?';
        }

        return nombre.charAt(0).toUpperCase();
    });

    constructor() {
        this.cargarSesion();
        this.renovarSesion();
    }

    registrar(nombre: string, usuario: string, password: string): Observable<ResultadoAuth> {
        const nombreNormalizado = nombre.trim();
        const usuarioNormalizado = usuario.trim().toLowerCase();
        const passwordNormalizado = password.trim();

        if (!nombreNormalizado || !usuarioNormalizado || !passwordNormalizado) {
            return of({ ok: false, mensaje: 'Completa todos los campos para registrarte.' });
        }

        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
            name: nombreNormalizado,
            usuario: usuarioNormalizado,
            password: passwordNormalizado
        }).pipe(
            tap(response => this.crearSesionDesdeApi(response)),
            map(() => ({ ok: true, mensaje: 'Registro exitoso. Sesion iniciada.' })),
            catchError(error => of({ ok: false, mensaje: this.obtenerMensajeError(error, 'No se pudo registrar el usuario.') }))
        );
    }

    iniciarSesion(usuario: string, password: string): Observable<ResultadoAuth> {
        const usuarioNormalizado = usuario.trim().toLowerCase();
        const passwordNormalizado = password.trim();

        if (!usuarioNormalizado || !passwordNormalizado) {
            return of({ ok: false, mensaje: 'Debes ingresar usuario y contrasena.' });
        }

        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
            usuario: usuarioNormalizado,
            password: passwordNormalizado
        }).pipe(
            tap(response => this.crearSesionDesdeApi(response)),
            map(() => ({ ok: true, mensaje: 'Sesion iniciada correctamente.' })),
            catchError(error => of({ ok: false, mensaje: this.obtenerMensajeError(error, 'Credenciales invalidas.') }))
        );
    }

    sesionValida(): boolean {
        if (!this.autenticado()) {
            return false;
        }

        if (typeof window === 'undefined') {
            return true;
        }

        const tokenStorage = window.localStorage.getItem(this.storageTokenKey);
        const sesionStorage = window.localStorage.getItem(this.storageSesionKey);

        return Boolean(tokenStorage && sesionStorage);
    }

    cerrarSesion(): void {
        this.sessionVersion += 1;
        this.token.set('');
        this.usuarioActual.set(null);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.removeItem(this.storageTokenKey);
        window.localStorage.removeItem(this.storageSesionKey);
    }

    private crearSesionDesdeApi(response: AuthResponse): void {
        const usuario: UsuarioSesion = {
            nombre: response.user.name,
            usuario: response.user.username
        };

        this.token.set(response.token);
        this.usuarioActual.set(usuario);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(this.storageTokenKey, response.token);
        window.localStorage.setItem(this.storageSesionKey, JSON.stringify(usuario));
    }

    private cargarSesion(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const token = window.localStorage.getItem(this.storageTokenKey) ?? '';
        const sesionRaw = window.localStorage.getItem(this.storageSesionKey);

        if (!token || !sesionRaw) {
            return;
        }

        try {
            const sesion = JSON.parse(sesionRaw) as UsuarioSesion;

            if (!sesion?.usuario || !sesion?.nombre) {
                return;
            }

            this.token.set(token);
            this.usuarioActual.set(sesion);
        } catch {
            this.cerrarSesion();
        }
    }

    private renovarSesion(): void {
        const token = this.token();
        const requestVersion = this.sessionVersion;

        if (!token) {
            return;
        }

        this.http.get<AuthResponse>(`${this.apiUrl}/renew-token`).pipe(
            tap(response => {
                // Evita reactivar la sesion si el usuario cerro sesion mientras la peticion seguia en vuelo.
                if (requestVersion !== this.sessionVersion) {
                    return;
                }

                this.crearSesionDesdeApi(response);
            }),
            catchError(() => {
                if (requestVersion === this.sessionVersion) {
                    this.cerrarSesion();
                }
                return of(null);
            })
        ).subscribe();
    }

    private obtenerMensajeError(error: unknown, fallback: string): string {
        if (typeof error !== 'object' || error === null) {
            return fallback;
        }

        const apiError = (error as { error?: { error?: string } }).error?.error;
        return typeof apiError === 'string' && apiError.trim().length > 0 ? apiError : fallback;
    }
}
