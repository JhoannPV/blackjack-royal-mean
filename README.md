# Blackjack Royal Mean (Frontend)

Aplicación frontend en Angular para jugar Blackjack, autenticarse, consultar estadísticas personales y estadísticas globales.

## Tecnologías

- Angular 21
- TypeScript
- Angular Router + Guards
- SSR (configuración incluida por Angular)

## Funcionalidades principales

- Inicio de sesión y registro de usuarios.
- Juego de Blackjack.
- Protección de rutas con guardas de autenticación.
- Vista de estadísticas del jugador autenticado.
- Vista de estadísticas globales.

Rutas principales de la aplicación:

- `/casino`
- `/login`
- `/estadisticas`
- `/estadisticas-globales`

## Requisitos previos

- Node.js 22+
- npm 11+
- Backend del proyecto ejecutándose (por defecto en `http://localhost:3000/api`)

## Configuración de API

La URL base del backend se define en:

`src/app/shared/config/api.config.ts`

Valor actual:

```ts
export const API_BASE_URL = 'http://localhost:3000/api';
```

Si cambias el puerto o dominio del backend, actualiza ese archivo.

## Instalación

```bash
npm install
```

## Scripts disponibles

```bash
# Desarrollo
npm start

# Build de producción
npm run build

# Build en modo watch
npm run watch

# Pruebas
npm test
```

## Ejecución en desarrollo

1. Levanta el backend.
2. Ejecuta este frontend:

```bash
npm start
```

3. Abre: `http://localhost:4200`

## Build para producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/`.

## Notas

- El proyecto incluye configuración para server-side rendering.
- Si aparece un error de CORS o autenticación, verifica que el backend esté levantado y que `API_BASE_URL` apunte correctamente.
