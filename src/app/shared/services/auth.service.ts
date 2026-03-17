import { computed, Injectable, signal } from '@angular/core';

import { type ResultadoAuth, type UsuarioRegistrado, type UsuarioSesion } from '../models/auth-user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly storageUsuariosKey = 'blackjack-royal-usuarios';
    private readonly storageTokenKey = 'blackjack-royal-jwt';
    private readonly storageSesionKey = 'blackjack-royal-sesion';

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
    }

    registrar(nombre: string, usuario: string, password: string): ResultadoAuth {
        const nombreNormalizado = nombre.trim();
        const usuarioNormalizado = usuario.trim().toLowerCase();
        const passwordNormalizado = password.trim();

        if (!nombreNormalizado || !usuarioNormalizado || !passwordNormalizado) {
            return { ok: false, mensaje: 'Completa todos los campos para registrarte.' };
        }

        const usuarios = this.obtenerUsuarios();
        const existe = usuarios.some(item => item.usuario.toLowerCase() === usuarioNormalizado);

        if (existe) {
            return { ok: false, mensaje: 'Ese usuario ya existe. Prueba con otro.' };
        }

        const nuevoUsuario: UsuarioRegistrado = {
            nombre: nombreNormalizado,
            usuario: usuarioNormalizado,
            password: passwordNormalizado
        };

        usuarios.push(nuevoUsuario);
        this.guardarUsuarios(usuarios);
        this.crearSesion({ nombre: nuevoUsuario.nombre, usuario: nuevoUsuario.usuario });

        return { ok: true, mensaje: 'Registro exitoso. Sesion iniciada.' };
    }

    iniciarSesion(usuario: string, password: string): ResultadoAuth {
        const usuarioNormalizado = usuario.trim().toLowerCase();
        const passwordNormalizado = password.trim();

        if (!usuarioNormalizado || !passwordNormalizado) {
            return { ok: false, mensaje: 'Debes ingresar usuario y contrasena.' };
        }

        const usuarios = this.obtenerUsuarios();
        const encontrado = usuarios.find(item => item.usuario.toLowerCase() === usuarioNormalizado);

        if (!encontrado || encontrado.password !== passwordNormalizado) {
            return { ok: false, mensaje: 'Credenciales invalidas.' };
        }

        this.crearSesion({ nombre: encontrado.nombre, usuario: encontrado.usuario });

        return { ok: true, mensaje: 'Sesion iniciada correctamente.' };
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

    obtenerUsuariosRegistrados(): UsuarioSesion[] {
        return this.obtenerUsuarios().map(item => ({
            nombre: item.nombre,
            usuario: item.usuario
        }));
    }

    cerrarSesion(): void {
        this.token.set('');
        this.usuarioActual.set(null);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.removeItem(this.storageTokenKey);
        window.localStorage.removeItem(this.storageSesionKey);
    }

    private crearSesion(usuario: UsuarioSesion): void {
        const token = this.generarJwtFicticio(usuario);

        this.token.set(token);
        this.usuarioActual.set(usuario);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(this.storageTokenKey, token);
        window.localStorage.setItem(this.storageSesionKey, JSON.stringify(usuario));
    }

    private generarJwtFicticio(usuario: UsuarioSesion): string {
        const encabezado = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sub: usuario.usuario,
            name: usuario.nombre,
            iat: Date.now()
        };

        return `${this.base64(JSON.stringify(encabezado))}.${this.base64(JSON.stringify(payload))}.firma-ficticia`;
    }

    private base64(valor: string): string {
        if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
            const bytes = new TextEncoder().encode(valor);
            let binario = '';

            for (const byte of bytes) {
                binario += String.fromCharCode(byte);
            }

            return window.btoa(binario);
        }

        return Buffer.from(valor, 'utf8').toString('base64');
    }

    private obtenerUsuarios(): UsuarioRegistrado[] {
        if (typeof window === 'undefined') {
            return [];
        }

        const datos = window.localStorage.getItem(this.storageUsuariosKey);

        if (!datos) {
            return [];
        }

        try {
            const usuarios = JSON.parse(datos) as UsuarioRegistrado[];
            return Array.isArray(usuarios) ? usuarios : [];
        } catch {
            return [];
        }
    }

    private guardarUsuarios(usuarios: UsuarioRegistrado[]): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(this.storageUsuariosKey, JSON.stringify(usuarios));
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
}
