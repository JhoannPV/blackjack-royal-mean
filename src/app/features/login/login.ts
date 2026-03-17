import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login implements OnInit {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    readonly modoRegistro = signal(false);
    readonly mensajeError = signal('');
    readonly mensajeInfo = signal('');

    loginUsuario = '';
    loginPassword = '';

    registroNombre = '';
    registroUsuario = '';
    registroPassword = '';

    ngOnInit(): void {
        if (this.authService.autenticado()) {
            this.router.navigateByUrl('/casino');
            return;
        }

        this.resetearFormularios();
    }

    activarModoRegistro(): void {
        this.modoRegistro.set(true);
        this.mensajeError.set('');
        this.mensajeInfo.set('');
    }

    activarModoLogin(): void {
        this.modoRegistro.set(false);
        this.mensajeError.set('');
        this.mensajeInfo.set('');
    }

    enviarFormulario(evento: Event): void {
        evento.preventDefault();

        this.mensajeError.set('');
        this.mensajeInfo.set('');

        if (this.modoRegistro()) {
            this.enviarRegistro();
            return;
        }

        this.enviarLogin();
    }

    private enviarLogin(): void {
        const usuario = this.loginUsuario.trim();
        const password = this.loginPassword.trim();

        if (!usuario || !password) {
            this.mensajeError.set('Completa los campos para iniciar sesion.');
            return;
        }

        const resultado = this.authService.iniciarSesion(usuario, password);

        if (!resultado.ok) {
            this.mensajeError.set(resultado.mensaje);
            return;
        }

        this.router.navigateByUrl('/casino');
    }

    private enviarRegistro(): void {
        const nombre = this.registroNombre.trim();
        const usuario = this.registroUsuario.trim();
        const password = this.registroPassword.trim();

        if (!nombre || !usuario || !password) {
            this.mensajeError.set('Completa todos los campos del registro.');
            return;
        }

        if (nombre.length < 2 || usuario.length < 3 || password.length < 4) {
            this.mensajeError.set('Verifica longitudes minimas: nombre 2, usuario 3 y contrasena 4.');
            return;
        }

        const resultado = this.authService.registrar(nombre, usuario, password);

        if (!resultado.ok) {
            this.mensajeError.set(resultado.mensaje);
            return;
        }

        this.mensajeInfo.set('Registro exitoso. Entrando al casino...');
        this.router.navigateByUrl('/casino');
    }

    private resetearFormularios(): void {
        this.loginUsuario = '';
        this.loginPassword = '';
        this.registroNombre = '';
        this.registroUsuario = '';
        this.registroPassword = '';
    }
}
