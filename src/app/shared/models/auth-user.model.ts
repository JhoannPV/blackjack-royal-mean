export interface UsuarioRegistrado {
    nombre: string;
    usuario: string;
    password: string;
}

export interface UsuarioSesion {
    nombre: string;
    usuario: string;
}

export interface ResultadoAuth {
    ok: boolean;
    mensaje: string;
}
