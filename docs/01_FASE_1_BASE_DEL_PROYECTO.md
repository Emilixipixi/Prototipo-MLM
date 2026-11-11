# FASE 1 - BASE DEL PROYECTO

Proyecto: MLM 2027 (prototipo navegable)
Requisito previo: haber leido `docs\PROMPT_MAESTRO.md` (o `00_PROMPT_MAESTRO_MLM2027.md`) y `CLAUDE.md`. Todo lo de esta fase debe cumplir las reglas de la seccion 0 del prompt maestro (Windows/PowerShell, sin emojis, iconos `lucide-react`, espanol, responsive mobile-first, sin backend).

Objetivo de la fase: dejar el esqueleto completo de la aplicacion funcionando: proyecto creado, sistema de diseno, layouts por rol, todas las rutas navegables (con pantallas provisionales), ingreso simulado por perfil, permisos con restricciones visibles, centro de notificaciones, bitacora basica y leyenda de DEMOSTRACION.

**No construyas todavia** el contenido real de las pantallas 01 a 25, ni los datos completos de la seccion 13, ni los motores. Eso corresponde a fases posteriores.

---

## 1. Creacion del proyecto (PowerShell)

La carpeta `D:\Prototipo\Prototipo-MLM` ya contiene `00_PROMPT_MAESTRO_MLM2027.md`, `referencia_visual_MLM2027.html`, `CLAUDE.md` y `docs\`. Crea el proyecto Vite **sin borrar esos archivos**. Si `npm create vite@latest .` pide confirmacion por carpeta no vacia, elige la opcion que **ignora archivos existentes** (no la que los elimina).

```powershell
cd D:\Prototipo\Prototipo-MLM
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom zustand lucide-react recharts react-zoom-pan-pinch date-fns
npm install -D tailwindcss @tailwindcss/vite
```

Configuracion:

- `vite.config.ts`: agrega el plugin `tailwindcss()` de `@tailwindcss/vite` junto a `react()`.
- `tsconfig.app.json`: confirma `"strict": true`.
- `index.html`: `lang="es"`, titulo `MLM 2027 - Prototipo`, y los enlaces de Google Fonts para **Plus Jakarta Sans** (400, 500, 600, 700, 800) y **JetBrains Mono** (400, 500, 600) con `preconnect`.
- Elimina el contenido de ejemplo de Vite (`App.css`, logos, contador). No elimines nada mas.

## 2. Sistema de diseno (`src/index.css`)

```css
@import "tailwindcss";
```

Define en `@theme` todos los tokens de la seccion 14 del prompt maestro, con estos nombres:

| Token | Valor |
|---|---|
| `--color-primario` | `#14305A` |
| `--color-primario-hover` | `#1E4577` |
| `--color-primario-suave` | `#E8EEF6` |
| `--color-primario-profundo` | `#0F2547` |
| `--color-acento` | `#0E7490` |
| `--color-acento-suave` | `#E0F2F6` |
| `--color-acento-brillo` | `#22B8D6` |
| `--color-oro` | `#B7791F` |
| `--color-oro-suave` | `#FBF3E4` |
| `--color-fondo` | `#F8FAFC` |
| `--color-superficie` | `#FFFFFF` |
| `--color-borde` | `#E2E8F0` |
| `--color-texto` | `#0F172A` |
| `--color-texto-2` | `#475569` |
| `--color-texto-3` | `#94A3B8` |
| `--color-exito` | `#15803D` |
| `--color-advertencia` | `#B45309` |
| `--color-error` | `#B91C1C` |
| `--color-info` | `#1D4ED8` |
| `--color-retenida` | `#6B7280` |
| `--color-brazo-a` | `#2563EB` |
| `--color-brazo-b` | `#7C3AED` |
| `--color-brazo-c` | `#DB2777` |
| `--color-demo-fondo` | `#FEF3C7` |
| `--color-demo-texto` | `#92400E` |
| `--font-sans` | `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, Consolas, monospace` |
| `--radius-tarjeta` | `16px` |
| `--shadow-tarjeta` | `0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)` |

Estilos base: `body` con fondo `fondo`, color `texto`, fuente sans, 14 px, antialiasing. Clase utilitaria `.cifra` = fuente mono + `font-feature-settings: "tnum"`. Foco visible con anillo `acento`.

## 3. Componentes UI base (`src/componentes/ui/`)

Crea estos componentes reutilizables, tipados y responsive, siguiendo el lenguaje visual de `docs\referencia_visual_MLM2027.html`:

| Componente | Requisitos |
|---|---|
| `Boton` | Variantes `primario`, `secundario`, `fantasma`, `peligro`; tamanos `sm`, `md`; prop `icono`; estado `deshabilitado` y `cargando`; alto minimo 44 px en movil. |
| `BotonIcono` | Cuadrado 40 px (44 px en movil), radio 12 px, borde, `aria-label` obligatorio. |
| `Tarjeta` | Radio 16 px, borde y sombra de tarjeta; props `titulo`, `subtitulo`, `icono`, `acciones`; variante `oscura` (degradado de la tarjeta de calificacion) y variante `simulacion` (borde discontinuo azul + fondo rayado). |
| `TarjetaKpi` | Icono en recuadro de color suave, etiqueta, cifra en mono, tendencia (sube/baja/neutra con color e icono) y espacio para sparkline opcional. |
| `Insignia` | Pildora con icono opcional y tono: `exito`, `advertencia`, `error`, `info`, `retenida`, `neutra`, `primaria`. |
| `ChipBrazo` | Cuadro de 22 px con la letra A, B o C sobre su color. |
| `Campo` | Input con etiqueta arriba, ayuda, mensaje de error y prop `icono`. |
| `Selector` | Select nativo estilizado con etiqueta y error. |
| `Modal` | Accesible (foco atrapado, cierre con Escape y fondo), en movil ocupa ancho completo desde abajo. |
| `Cajon` | Panel lateral deslizable (se usa como menu en movil). |
| `Pestanas` | Pestanas con desplazamiento horizontal propio en movil. |
| `Tabla` | Encabezado con buscador y espacio para filtros/acciones, orden por columna, paginacion con total de registros, menu de acciones por fila; en pantallas menores a `md` se muestra como tarjetas apiladas. Generica con `columnas` y `filas` tipadas. |
| `EstadoVacio` | Icono, titulo, texto y accion sugerida. |
| `EstadoError` | Icono, que paso y como seguir, boton reintentar opcional. |
| `Confirmacion` | Modal con resumen de la accion; prop `requiereMotivo` que obliga a escribir un motivo (minimo 10 caracteres) antes de confirmar. |
| `Toast` + `useToast` | Avisos de exito, error, advertencia e informacion, apilados, se cierran solos. |
| `Tooltip` | Para los iconos `Info` de conceptos (VP, VC, RUN, etc.). |
| `Avatar` | Iniciales sobre color, tamanos sm/md. |

## 4. Componentes de demostracion (`src/componentes/demo/`)

- `LeyendaDemostracion`: franja fija superior con icono `FlaskConical` y el texto de la seccion 1.6 del prompt maestro. En movil el texto se acorta ("DEMOSTRACIÓN - Datos y montos ficticios. Sin cobros ni pagos reales.") sin perder legibilidad. Variante `bloque` para usar dentro de tarjetas.
- `SelectorRolDemo`: menu en la barra superior que permite cambiar entre las cinco sesiones demo (seccion 6) sin volver a la pantalla de ingreso; registra el cambio en la bitacora.
- `BotonReiniciarDemo`: pide confirmacion y restablece todos los stores a su estado inicial.

## 5. Estado global (`src/store/`)

Con `zustand`, crea:

- `useSesionStore`: persona en sesion, perfil, `iniciarSesion(id)`, `cerrarSesion()`, `cambiarRol(id)`.
- `usePermisosStore`: matriz de permisos por perfil (seccion 7 de esta fase), `alternarPermiso(perfil, modulo, accion)`, `tienePermiso(perfil, modulo, accion)`.
- `useNotificacionesStore`: lista, `agregar`, `marcarLeida`, `marcarTodasLeidas`, contador de no leidas filtrado por persona en sesion (las de corporativo tienen `personaId: null`).
- `useBitacoraStore`: lista y `registrar({ actorId, accion, modulo, motivo, antes, despues, referenciaId })` con fecha y hora automaticas.
- `reiniciarDemo()` en `src/store/reiniciarDemo.ts` que restablece todos los stores.

El estado vive solo en memoria (sin `localStorage`).

## 6. Datos minimos de esta fase (`src/datos/`)

Crea `src/tipos/persona.ts` con los tipos `TipoPersona`, `PerfilAcceso`, `EstadoCuenta` y la interfaz `Persona` **exactamente** como en la seccion 8 del prompt maestro, y `src/datos/personas.ts` solo con estas cinco personas (en la Fase 2 se agregara el resto, sin modificar estas):

| ID | Nombre | Tipo | Perfil | Estado | Correo |
|---|---|---|---|---|---|
| DEMO-U01 | Admin Demo | corporativo | superadministrador | activo | admin@correo.demo |
| DEMO-U02 | Operador Demo | corporativo | operador | activo | operador@correo.demo |
| DEMO-A01 | Mariana Vega Ruiz | empresario | afiliado | activo | mariana.vega@correo.demo |
| DEMO-C01 | Rosa Delgado Arce | cliente | cliente_alumno | activo | rosa.delgado@correo.demo |
| DEMO-L01 | Gabriela Ponce Lara | alumno | cliente_alumno | activo | gabriela.ponce@correo.demo |

Completa los demas campos de `Persona` con datos ficticios coherentes (pais Peru, moneda USD, idioma es, telefonos `+51 900 000 0xx`, documentos `DEMO-DOC-xxx`, referente de DEMO-C01 = DEMO-A01, de DEMO-L01 = DEMO-A04).

Notificaciones iniciales de ejemplo (`src/datos/notificaciones.ts`): una de compra confirmada para DEMO-L01, una de liquidacion disponible para DEMO-A01, una de cierre de periodo para corporativo y una de cambio de estado para corporativo. Textos con tildes correctas.

## 7. Permisos (MLM-005)

Implementa la matriz de la seccion 4.3 del prompt maestro en `src/datos/permisosIniciales.ts`:

- Acciones: `consultar`, `crear`, `editar`, `aprobar`, `liquidar`, `exportar`, `auditar`.
- Modulos: `usuarios`, `catalogo`, `pedidos`, `redes`, `periodos`, `rangos`, `bonos`, `simulador`, `liquidaciones`, `compliance`, `auditoria`, `reportes`, `integraciones`, `configuracion`, `permisos`.
- `superadministrador`: todas las acciones en todos los modulos.
- `operador`: `consultar` en todos los modulos excepto `permisos` y `configuracion`; `crear` y `editar` en `usuarios`, `pedidos` y `redes`; `crear` en `compliance` (proponer ajustes); `exportar` en `reportes`; **sin** `aprobar`, `liquidar` ni `auditar` por defecto.
- `afiliado` y `cliente_alumno`: no usan esta matriz para el area corporativa (acceden solo a su propia area).

Crea:

- `src/hooks/usePermiso.ts`: `usePermiso(modulo, accion): boolean`.
- `src/componentes/ui/ConPermiso.tsx`: envuelve una accion; si no hay permiso muestra el hijo deshabilitado con icono `Lock` y tooltip "Requiere permiso: {accion} en {modulo}".
- Guardas de ruta en `src/rutas/`: `RutaPorPerfil` (perfil permitido) y `RutaPorPermiso` (modulo + `consultar`). Sin sesion -> `/ingresar`. Sin permiso -> `/acceso-restringido` mostrando el permiso faltante.

## 8. Layouts (`src/layouts/`)

Todos con la `LeyendaDemostracion` fija arriba y siguiendo `docs\referencia_visual_MLM2027.html`.

**LayoutPublico** (visitante y cliente/alumno): barra superior blanca con logo "MLM 2027", enlaces Inicio, Catalogo, Registro, icono de carrito con contador (en 0 por ahora), y a la derecha "Ingresar" o el menu de usuario (Mi cuenta, Cerrar sesion). En movil los enlaces van en un `Cajon`. Pie simple con texto "Prototipo de demostración".

**LayoutAfiliado**: menu lateral oscuro (degradado `primario` -> `primario-profundo`) con logo y subtitulo "Back office afiliado", grupos y enlaces:
- General: Mi inicio, Mis redes (Unilevel, Trinaria), Mi equipo
- Desempeno: Mi volumen, Mi RUN, Mis bonos
- Historial: Mis compras, Mis liquidaciones, Mi formacion
- Tarjeta del usuario al pie (avatar, nombre, codigo en mono).
Item activo con fondo translucido y linea izquierda `acento-brillo`. Barra superior: titulo de la pagina, buscador global (visual por ahora), `SelectorRolDemo`, notificaciones, `BotonReiniciarDemo`, menu de usuario. En movil el menu lateral se convierte en `Cajon` con boton `Menu`.

**LayoutCorporativo**: misma estructura, subtitulo "Administración corporativa", grupos y enlaces:
- General: Resumen
- Comercial: Usuarios, Permisos, Productos
- Red y calificacion: Arboles, Periodos, Rangos
- Compensacion: Bonos, Simulador, Liquidaciones
- Control: Compliance, Auditoria, Reportes, Integraciones
Los enlaces a modulos sin permiso de `consultar` se muestran deshabilitados con icono `Lock` (restriccion visible), no se ocultan.

## 9. Rutas (`src/rutas/Rutas.tsx`)

Crea **todas** las rutas de las secciones 9.1 a 9.4 del prompt maestro. Las pantallas que aun no se construyen usan un componente `PantallaProvisional` que muestra: numero y nombre de la pantalla, requerimientos MLM que cubrira, la fase en la que se construye y un `EstadoVacio` con icono `Construction`. Esto permite recorrer toda la navegacion desde ahora.

| Grupo | Rutas | Guarda |
|---|---|---|
| Publico | `/`, `/catalogo`, `/catalogo/:id`, `/registro`, `/carrito`, `/checkout`, `/pedido/:id` | Libre |
| Sesion | `/ingresar`, `/recuperar-acceso`, `/acceso-restringido` | Libre |
| Cliente/alumno | `/cuenta` | Perfil `cliente_alumno` |
| Afiliado | `/afiliado/inicio`, `/afiliado/redes/unilevel`, `/afiliado/redes/trinaria`, `/afiliado/equipo`, `/afiliado/volumen`, `/afiliado/run`, `/afiliado/bonos`, `/afiliado/compras`, `/afiliado/liquidaciones`, `/afiliado/formacion` | Perfil `afiliado` |
| Corporativo | `/corporativo/resumen`, `/corporativo/usuarios`, `/corporativo/usuarios/:id`, `/corporativo/permisos`, `/corporativo/productos`, `/corporativo/arboles`, `/corporativo/periodos`, `/corporativo/rangos`, `/corporativo/bonos`, `/corporativo/simulador`, `/corporativo/liquidaciones`, `/corporativo/compliance`, `/corporativo/auditoria`, `/corporativo/reportes`, `/corporativo/integraciones` | Perfil `superadministrador` u `operador` + permiso `consultar` del modulo |
| Otras | `*` | Pantalla 404 |

Usa `React.lazy` + `Suspense` por grupo de rutas con un indicador de carga sobrio.

## 10. Pantallas que si se construyen completas en esta fase

**Ingreso (`/ingresar`, MLM-001):** diseno dividido en escritorio (panel izquierdo oscuro con el logo, una frase del principio funcional y tres puntos clave con iconos; panel derecho con el formulario) y de una sola columna en movil. Formulario correo + clave (cualquier clave sirve, se valida que no esten vacios) y debajo "Acceso rapido de demostración" con cinco botones: Superadministrador, Operador, Afiliado (DEMO-A01), Cliente (DEMO-C01), Alumno (DEMO-L01). Al ingresar: registro en bitacora ("Inicio de sesión"), notificacion de bienvenida en toast y redireccion por perfil (`superadministrador`/`operador` -> `/corporativo/resumen`, `afiliado` -> `/afiliado/inicio`, `cliente_alumno` -> `/cuenta`). Enlace "Recuperar acceso". Error visible si el correo no corresponde a un usuario demo.

**Recuperar acceso (`/recuperar-acceso`):** campo correo; al enviar muestra estado de confirmacion "Si el correo existe, se enviaría un enlace de recuperación (simulado)." y boton volver.

**Acceso restringido (`/acceso-restringido`):** icono `ShieldAlert`, texto con el perfil actual y el permiso o perfil requerido, boton "Volver" y boton "Ir a mi inicio".

**404:** icono `MapPinOff`, texto y enlace al inicio que corresponda a la sesion.

**Cerrar sesion:** desde el menu de usuario; registra en bitacora ("Cierre de sesión") y vuelve a `/ingresar`.

## 11. Centro de notificaciones (MLM-069, estructura)

Boton `Bell` en las barras superiores con punto de no leidas (color `brazo-c`) y contador. Al abrir: panel desplegable (en movil, `Cajon` a pantalla completa) con lista por fecha, icono segun tipo (`ShoppingCart` compra, `RefreshCw` estado, `CalendarCheck` cierre, `Receipt` liquidacion), marcar como leida y "Marcar todas como leídas". `EstadoVacio` si no hay notificaciones.

## 12. Glosario

Crea `src/datos/glosario.ts` con las definiciones de VP, VC, RUN de Cobro, RUN Historico, ciclo, corrida, liquidacion, brazo y remanente (seccion 1.2 del prompt maestro) y un componente `TerminoInfo` (`Info` + `Tooltip`) para reutilizar en todas las pantallas.

---

## 13. Criterios de cierre de esta fase

Verifica y reporta cada punto:

1. `npm run dev` levanta sin errores y `npm run build` compila sin errores de TypeScript.
2. Los cinco accesos rapidos llevan a su area correcta con su layout y menu (CA-01).
3. El operador ve en el menu corporativo los modulos sin permiso deshabilitados con candado; al entrar por URL a `/corporativo/permisos` llega a "Acceso restringido".
4. Un cliente que intenta abrir `/afiliado/inicio` o `/corporativo/resumen` es redirigido a "Acceso restringido".
5. Todas las rutas de la seccion 9 existen y muestran su `PantallaProvisional` con numero, nombre, requerimientos y fase.
6. La leyenda DEMOSTRACION se ve en todas las pantallas.
7. El selector de rol cambia de sesion sin pasar por el ingreso y queda registrado en la bitacora (verificable en consola o en una tabla provisional en `/corporativo/auditoria`).
8. Las notificaciones muestran el contador correcto segun la sesion y se pueden marcar como leidas.
9. "Reiniciar demostración" restablece sesion, notificaciones y bitacora.
10. Revision responsive (regla 11) en 375, 768 y 1440 px: menu en cajon en movil, sin scroll horizontal, botones de 44 px.
11. No hay emojis en ningun archivo, y todos los textos visibles tienen tildes correctas.

Al terminar, entrega: lista de archivos creados y modificados con ruta exacta, comandos de PowerShell para ejecutar, criterios cubiertos (MLM-001, MLM-005, MLM-007 parcial, MLM-069 parcial, CA-01) y confirmacion de la revision responsive. Luego detente y espera la instruccion "FASE 2".
