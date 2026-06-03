# SquadUp

SquadUp es una aplicacion social mobile-first para descubrir, crear y unirse a planes en grupo. La experiencia principal funciona como un feed tipo swipe: el usuario ve planes cercanos, puede descartarlos, unirse a ellos, abrir detalles del plan y chatear con el grupo cuando participa.

El proyecto esta construido como una SPA de React con Vite y usa Supabase como backend para autenticacion, base de datos, realtime y almacenamiento de imagenes.

## Funcionalidades principales

- Autenticacion con Supabase: login, registro y recuperacion/cambio de contrasena.
- Perfil de usuario editable con nombre, edad, ciudad, bio y avatar.
- Descubrimiento de planes en modo lista/swipe y modo mapa.
- Creacion de planes con titulo, descripcion, fecha, ubicacion, rango de edad, tamano maximo, tags e imagen.
- Geolocalizacion del usuario y calculo de distancia a los planes.
- Busqueda de ubicaciones con Nominatim/OpenStreetMap.
- Union a planes y separacion entre planes propios y planes unidos.
- Chat por plan con mensajes en tiempo real mediante Supabase Realtime.
- Notificaciones locales para likes, mensajes y recordatorios de eventos.
- Historial de planes pasados, valoraciones y galeria de fotos del evento.
- Limite diario de swipes gratuitos con desbloqueo mediante codigo o pago simulado.
- Internacionalizacion propia en catalan, castellano e ingles.

## Stack

- React 18
- Vite 5
- Supabase JS v2
- Leaflet / OpenStreetMap
- Lucide React
- ESLint

## Estructura del proyecto

```text
src/
  App.jsx                    Estado global y navegacion principal por tabs
  main.jsx                   Punto de entrada de React
  index.css                  Estilos globales y contenedor mobile-first
  components/                Componentes reutilizables y modales
  screens/                   Pantallas principales de la app
  hooks/                     Hooks propios, como el limite de swipes
  contexts/                  Contextos globales, como ubicacion del usuario
  i18n/                      Traducciones y LanguageContext
  utils/                     Supabase client y utilidades
```

La app no usa router. `App.jsx` decide que pantalla renderizar segun la tab activa: descubrir, crear, matches, perfil, notificaciones y ajustes.

## Backend esperado

La aplicacion espera un proyecto de Supabase con estas piezas principales:

- Tabla `perfiles_usuario`: datos publicos del usuario.
- Tabla `planes`: planes publicados.
- Tabla `plan_members`: usuarios unidos a cada plan.
- Tabla `mensajes_chat`: mensajes del chat de cada plan.
- Tabla `plan_ratings`: valoraciones de planes pasados.
- Tabla `plan_photos`: fotos de la galeria del evento.
- Bucket `squad-images`: imagenes de planes, avatares y fotos de eventos.
- RPC `increment_members_count`: incremento atomico del contador de miembros.

Actualmente el cliente de Supabase esta configurado directamente en `src/utils/supabaseClient.js`. Para produccion conviene mover la URL y la anon key a variables de entorno de Vite.

## Instalacion

Instala dependencias:

```bash
npm install
```

Arranca el entorno de desarrollo:

```bash
npm run dev
```

Vite mostrara una URL local, normalmente `http://localhost:5173`.

## Scripts

```bash
npm run dev
```

Levanta el servidor de desarrollo.

```bash
npm run lint
```

Ejecuta ESLint. La configuracion actual trata los warnings como fallo.

```bash
npm run build
```

Genera la build de produccion en `dist/`.

```bash
npm run preview
```

Sirve la build generada para revisarla localmente.

## CI

GitHub Actions ejecuta:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

El workflow esta en `.github/workflows/ci.yml`.

## Notas de desarrollo

- La interfaz esta disenada como una pantalla movil centrada, con ancho maximo de 414px.
- Si el navegador no permite geolocalizacion, la app usa Barcelona como ubicacion de fallback.
- El pago del desbloqueo de swipes es simulado y no realiza ningun cargo real.
- Los codigos de desbloqueo de demo se definen en `src/hooks/useSwipeLimit.js`.
- `dist/` y `node_modules/` estan ignorados por Git.
