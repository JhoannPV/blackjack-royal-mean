# ESTUDIO DEL FRONTEND - BLACKJACK ROYAL MEAN

Este documento te da una ruta de estudio para entender la aplicacion de forma progresiva, desde el arranque hasta la logica de negocio.

## 1) Vision general rapida

Arquitectura en capas del frontend:

1. Arranque de Angular y providers globales.
2. Enrutamiento principal y guardas de acceso.
3. Autenticacion (servicio + interceptor + estado de sesion).
4. Features de UI y negocio (casino, login, estadisticas).
5. Componentes compartidos reutilizables.
6. Configuracion SSR y servidor Node para renderizado.

Flujo funcional principal:

1. Usuario entra a la app.
2. Rutas protegidas validan sesion.
3. Login o registro contra backend.
4. Interceptor agrega token JWT en llamadas privadas.
5. Juego registra resultados.
6. Estadisticas personales y globales consumen API.

## 2) Orden recomendado para estudiar (archivo por archivo)

### Fase A - Arranque y configuracion global

Objetivo: entender como inicia la app y que servicios globales se inyectan.

Lee en este orden:

1. src/main.ts
2. src/app/app.ts
3. src/app/app.html
4. src/app/app.config.ts
5. src/styles.css
6. angular.json

Preguntas que debes poder responder:

1. Como se hace el bootstrap del componente raiz.
2. Donde se configura Router y HttpClient.
3. Como entra el interceptor de auth al pipeline HTTP.
4. Que tipo de build usa el proyecto (browser + server/SSR).

### Fase B - Navegacion y control de acceso

Objetivo: entender la entrada a cada pantalla y las reglas de acceso.

Lee en este orden:

1. src/app/app.routes.ts
2. src/app/shared/guards/auth.guard.ts

Preguntas clave:

1. Que rutas requieren autenticacion.
2. Que pasa cuando la sesion es invalida.
3. Como se evita entrar a login si ya estas autenticado.

### Fase C - Autenticacion completa (la columna vertebral)

Objetivo: dominar el estado de sesion y su relacion con backend.

Lee en este orden:

1. src/app/shared/config/api.config.ts
2. src/app/shared/models/auth-user.model.ts
3. src/app/shared/services/auth.service.ts
4. src/app/shared/interceptors/auth-token.interceptor.ts
5. src/app/features/login/login.ts
6. src/app/features/login/login.html

En esta fase enfocate en:

1. Senales y computed en AuthService.
2. Persistencia de sesion en localStorage.
3. Renovacion de token y cierre de sesion seguro.
4. Flujo de login/registro en componente Login.
5. Regla de exclusion del interceptor para login/register.

Mini ejercicio:

1. Traza en papel el camino desde enviar formulario de login hasta llegar a /casino.

### Fase D - Dominio del juego (core funcional)

Objetivo: entender toda la logica de blackjack y actualizacion de estadisticas.

Lee en este orden:

1. src/app/features/casino/models/casino-game.model.ts
2. src/app/features/casino/utils/casino-deck.util.ts
3. src/app/features/casino/services/casino-game.service.ts
4. src/app/features/casino/casino.ts
5. src/app/features/casino/casino.html

Puntos criticos para estudiar con detalle:

1. Como se crea y consume la baraja.
2. Estados del juego con signal (cartas, puntos, modal, estado final).
3. Condiciones de turno de la computadora.
4. Algoritmo actual de determinarGanador.
5. Registro de resultados en API /stats/register-result.

Mini ejercicio:

1. Simula una partida manual y verifica como cambian las signals en cada accion.

### Fase E - Estadisticas y visualizacion de datos

Objetivo: comprender la lectura y presentacion de resultados.

Lee en este orden:

1. src/app/features/estadisticas/estadisticas.ts
2. src/app/features/estadisticas/estadisticas.html
3. src/app/features/estadisticas-globales/estadisticas-globales.ts
4. src/app/features/estadisticas-globales/estadisticas-globales.html

Que revisar:

1. Reutilizacion del estado de CasinoGameService para estadisticas personales.
2. Carga de ranking global desde API /stats/global.
3. Filtrado por texto y categoria en computed.
4. Ordenamiento por categoria seleccionada.

### Fase F - Componentes compartidos y experiencia de usuario

Objetivo: entender piezas reutilizadas en varias pantallas.

Lee en este orden:

1. src/app/shared/components/user-menu/user-menu.ts
2. src/app/shared/components/user-menu/user-menu.html
3. src/app/shared/components/result-modal/result-modal.ts
4. src/app/shared/components/result-modal/result-modal.html

Que debes observar:

1. Uso de input() y output().
2. Navegacion desde menu contextual.
3. Manejo de modal como componente desacoplado.

### Fase G - SSR y servidor

Objetivo: cerrar la comprension de ejecucion en servidor.

Lee en este orden:

1. src/main.server.ts
2. src/app/app.config.server.ts
3. src/app/app.routes.server.ts
4. src/server.ts

Preguntas finales:

1. Como se combina config cliente + config servidor.
2. Que renderMode usa la app en SSR.
3. Que hace Express en tiempo de ejecucion.

## 3) Ruta de estudio sugerida en sesiones

Si estudias 1 a 2 horas por sesion, esta ruta funciona bien:

1. Sesion 1: Fase A + B
2. Sesion 2: Fase C
3. Sesion 3: Fase D (primera mitad)
4. Sesion 4: Fase D (segunda mitad) + E
5. Sesion 5: Fase F + G + repaso completo

## 4) Metodo de estudio recomendado

Aplica este ciclo en cada fase:

1. Leer archivo completo sin editar.
2. Resumir en 5 lineas que responsabilidad cumple.
3. Identificar entradas (inputs, parametros, API) y salidas (estado UI, navegacion, peticiones).
4. Trazar un flujo extremo a extremo de la feature.
5. Recien despues, hacer cambios pequenos y probar.

## 5) Checklist de comprension total

Al final deberias poder explicar sin mirar codigo:

1. Como se inicializa la app y como decide la ruta inicial.
2. Como se mantiene o invalida una sesion.
3. Como viaja el token en las peticiones privadas.
4. Como se resuelve una partida y donde se persisten resultados.
5. Como se construyen estadisticas locales y globales.
6. Como encaja SSR en el proyecto.

Si puedes responder esos 6 puntos con claridad, ya tienes dominio real del frontend.