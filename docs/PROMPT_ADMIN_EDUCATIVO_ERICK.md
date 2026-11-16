# Plataforma ERICK S.A.C. independiente: administrador educativo, docente y tema verde

Versión 1 - 15/11/2026. Proyecto: `D:\Prototipo\Prototipo-MLM`.

---

## Parte A. Propuesta

### A.1 Problema

Hoy el Campus ERICK vive dentro del corporativo del MLM: el superadministrador del MLM administra programas, matrículas y certificados desde el menú "Académico". ERICK S.A.C. y la empresa MLM comparten lineamientos, pero tienen propósitos distintos: una vende y compensa, la otra enseña y certifica. Mezclar ambos paneles confunde los roles, da al MLM control sobre decisiones académicas y hace que las dos plataformas se vean iguales.

### A.2 Qué se propone

1. **Administrador educativo (perfil nuevo `admin_educativo`).** Dueño de la plataforma ERICK: programas, contenidos, banco de preguntas, reglas, estudiantes, docentes, matrículas, membresías, certificados, MID, calendario, reportes, eventos de integración, configuración institucional y bitácora académica. Tiene su propio panel en `/erick`.
2. **El MLM deja de administrar lo académico.** El grupo "Académico" sale del menú corporativo del MLM. En su lugar queda una sola pantalla de solo lectura, "Integración ERICK", con lo que el MLM sí necesita: eventos del conector, estado formativo de los afiliados y ventas de productos formativos.
3. **Docente evaluador ampliado** (el perfil `evaluador` se muestra como "Docente"):
   - Trabaja solo sobre los programas que el administrador educativo le asigna.
   - Sube las clases en video de sus temas: enlace de YouTube o archivo de video (ver A.4).
   - Lleva el control de notas de cada estudiante en una libreta por programa.
   - Agenda fechas importantes en un calendario (examen final, clases en vivo, entregas, sustentaciones) que los estudiantes ven en su campus.
   - Sigue calificando las sustentaciones MID asignadas.
4. **Calendario académico para estudiantes:** página "Mi calendario" en el campus, aviso de "Próximas fechas" en Mis programas y en la ruta del programa, y notificación cuando el docente crea, cambia o cancela una fecha.
5. **Identidad visual verde pastel para ERICK** en todo lo que es ERICK (campus del estudiante, panel del docente, panel del administrador educativo y página de verificación de documentos). El MLM conserva su azul.

### A.3 Paleta ERICK propuesta (verde pastel, contraste revisado)

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `primario` | `#2E6B4F` | Botones primarios, títulos de marca | 6,3:1 con texto blanco |
| `primario-hover` | `#255A42` | Hover de primario | |
| `primario-profundo` | `#1E4A37` | Texto sobre fondos pastel, ítem activo del menú | 9,05:1 sobre `#EAF6EE` |
| `primario-suave` | `#E6F4EC` | Fondos de chips y filas seleccionadas | |
| `acento` | `#2F7D5B` | Enlaces, foco, iconos activos | 4,99:1 sobre blanco |
| `acento-suave` | `#DDF1E5` | Avisos informativos (texto `#245C43`, 6,62:1) | |
| `acento-brillo` | `#8FD3AE` | Detalles decorativos, nunca texto | |
| `fondo` | `#F3FAF5` | Fondo general | |
| `borde` | `#D6EADD` | Bordes de tarjetas y tablas | |
| Menú lateral | degradado `#EAF6EE` a `#D4ECDD` | Menú claro pastel con texto `#1E4A37` y secundario `#4F6F5E` (5,02:1) | |
| Logo ERICK | degradado `#8FD3AE` a `#2F7D5B` | Icono de marca | |

Los colores de estado (éxito, advertencia, error, info) no cambian y siempre van con icono y texto, para que el verde de éxito no se confunda con el verde de marca.

### A.4 Decisiones tomadas por defecto (el prompt las aplica; se pueden cambiar antes de ejecutar)

| Decisión | Por defecto | Motivo |
|---|---|---|
| Acceso del superadministrador MLM a ERICK | Solo lectura en "Integración ERICK"; para administrar ERICK se cambia de rol en el selector de demostración | Separación real de empresas |
| Precios, VP y VC de productos formativos | Siguen en el catálogo MLM; ERICK ve las ventas en solo lectura | Cambiar un precio altera la compensación |
| Notas automáticas (temas y TIM) | El docente no las modifica; puede otorgar intentos extra y registrar observaciones | Integridad de la evaluación automática (regla RA del prompt LMS) |
| Subida de videos | Enlace de YouTube o archivo `.mp4` o `.webm` de hasta 300 MB guardado en IndexedDB del navegador | Sin backend: el archivo solo se ve en el mismo navegador donde se subió; "Reiniciar demostración" lo borra |
| Examen final en el calendario | Informativo (fecha y aviso); no bloquea ni habilita la evaluación | Mantiene las reglas de desbloqueo actuales |
| Videos en programas publicados | El docente puede cambiar el video de un tema publicado (contenido); la estructura solo la cambia el administrador educativo en borrador | Corregir una clase no debe obligar a despublicar |

---

## Parte B. Prompt para Claude Code

Copia desde aquí hasta el final y ejecútalo por fases (E1 a E4). No adelantes fases.

### B.1 Contexto

Trabajas sobre el prototipo navegable "MLM 2027" con el Campus ERICK integrado (fases 1 a 7 del MLM y L1 a L6 del LMS completadas). Lee antes de empezar: `CLAUDE.md`, `docs/PROMPT_INTEGRACION_LMS_ERICK.md`, `docs/CHECKLIST_REQUERIMIENTOS.md` y `docs/CAMBIOS_PANEL_ACADEMICO.md`. Este documento es la fuente de verdad de esta ampliación: si contradice al prompt LMS, manda este documento y debes actualizar la sección 15 del prompt LMS al cerrar.

Objetivo: convertir ERICK S.A.C. en una plataforma con identidad y administración propias dentro del mismo proyecto, con un administrador educativo dueño de la plataforma, un docente con más herramientas y un calendario académico visible para los estudiantes.

### B.2 Reglas de trabajo (obligatorias)

- Entorno Windows y comandos de PowerShell. Rutas `D:\Prototipo\Prototipo-MLM`.
- Prohibido usar emojis en código, interfaz, datos, commits y respuestas. Iconos solo de `lucide-react`.
- Código en español sin tildes; textos visibles con tildes correctas. UTF-8.
- No reescribas lo que funciona. Al editar, conserva los comentarios existentes y prefiere agregar líneas nuevas en lugar de modificar las que ya están; si una línea existente debe cambiar, cámbiala mínimamente y repórtala.
- Al cerrar cada fase entrega: archivos nuevos y modificados, el lugar exacto de cada cambio con su código (no un zip ni el proyecto completo), comandos ejecutados, criterios cubiertos y revisión responsive en 375, 768 y 1440 px sin scroll horizontal.
- TypeScript estricto, sin `any`. Motores como funciones puras. Sin backend ni integraciones reales; datos en `src/datos/` y stores de zustand con persistencia y "Reiniciar demostración".
- Mantén verdes `npm run build`, `npx oxlint src pruebas` y `npm run pruebas` en cada fase. Las 16 verificaciones del MLM en `/demo/datos` no deben cambiar.
- No agregues dependencias nuevas salvo que sea imprescindible; el calendario se construye con `date-fns` y la persistencia de videos con la API nativa de IndexedDB.

### B.3 Perfiles y personas de demostración

| Perfil | Código | Persona | Inicio | Alcance |
|---|---|---|---|---|
| Administrador educativo (nuevo) | `admin_educativo` | `DEMO-U04` "Administradora Educativa Demo", tipo `corporativo`, correo `educativo@correo.demo` | `/erick/resumen` | Todo ERICK |
| Docente evaluador (existente, se renombra en pantalla) | `evaluador` | `DEMO-U03` "Docente Evaluador Demo" | `/docente/cursos` | Sus programas asignados y sus sustentaciones MID |
| Segundo docente (nuevo) | `evaluador` | `DEMO-U05` "Docente Ventas Demo", correo `docente.ventas@correo.demo` | `/docente/cursos` | Asignado solo a `DEMO-CUR-03`, para demostrar el filtro por asignación |

- Agrega `'admin_educativo'` a `PerfilAcceso` y a todos los `Record<PerfilAcceso, ...>` (nombres de perfil, matriz de permisos, ruta de inicio, selector de rol, sesiones de demostración).
- En `nombresPerfiles`, `evaluador` se muestra como "Docente evaluador".
- Botones de acceso rápido nuevos en ingreso y `sesionesDemo`: "Administrador educativo" (icono `School`) y "Docente" reemplaza el texto de "Evaluador académico" para `DEMO-U03`.
- Las personas nuevas van en un archivo propio (`src/datos/academico/personalErick.ts`) y se suman a `personasIniciales` igual que `alumnosCampus`, sin tocar `filasPersonas` de `ampliacion.ts` (alteraría la generación de pedidos del MLM).

### B.4 Permisos

- Módulos nuevos en `ModuloPermiso`: `calendario`, `docentes`, `contenidos`, `configuracion_erick`.
- `admin_educativo`: todas las acciones en `academico`, `matriculas`, `certificados`, `calendario`, `docentes`, `contenidos`, `configuracion_erick`; `reportes` consultar y exportar; `integraciones` consultar.
- `evaluador`: `academico` consultar y aprobar; `contenidos` consultar y editar; `calendario` consultar, crear y editar; `reportes` consultar y exportar. Toda acción se limita además a los programas asignados (regla de servicio, no solo de interfaz).
- `superadministrador` y `operador` del MLM: `academico`, `matriculas`, `certificados` pasan a solo `consultar`; los módulos nuevos de ERICK quedan vacíos. La pantalla de Permisos del MLM muestra los perfiles ERICK en solo lectura con la leyenda "Se administran en la plataforma ERICK".

### B.5 Datos nuevos

En `src/tipos/academico.ts` agrega (sin modificar los tipos existentes salvo el campo opcional indicado):

```ts
export type TipoEventoCalendario = 'examen_final' | 'clase_en_vivo' | 'entrega' | 'sustentacion' | 'recordatorio';

export interface EventoCalendario {
  id: string; programaId: string; tipo: TipoEventoCalendario; titulo: string; descripcion: string;
  fecha: string; horaInicio: string; horaFin: string | null; enlace: string | null;
  creadoPor: string; estado: 'programado' | 'cancelado'; actualizado: string;
}

export interface AsignacionDocente { id: string; docenteId: string; programaId: string; desde: string; activa: boolean }

export interface ObservacionDocente { id: string; docenteId: string; personaId: string; programaId: string; fecha: string; texto: string }

export interface ConfiguracionErick {
  razonSocial: string; ruc: string; direccion: string; correoContacto: string; telefono: string;
  textoCertificado: string; mesesAccesoPorDefecto: number; intentosPorDefecto: number;
}
```

- En `ContenidoVideo` agrega el campo opcional `archivoVideoId?: string` (referencia a IndexedDB). Si un tema tiene `urlVideo` de YouTube y `archivoVideoId`, se reproduce el archivo.
- Store nuevo `useErickStore` (persistido y reiniciable): `eventosCalendario`, `asignacionesDocentes`, `observacionesDocentes`, `configuracion`.
- Semillas en `src/datos/academico/erickInicial.ts`:
  - Asignaciones: `DEMO-U03` en `DEMO-DIP-01`, `DEMO-CUR-01`, `DEMO-CUR-02` y `DEMO-MID-01`; `DEMO-U05` en `DEMO-CUR-03`.
  - 8 eventos de calendario relativos a hoy (`relativoHoy`): examen final de `DEMO-CUR-01` (+13 días), examen final de `DEMO-CUR-02` (+20), clase en vivo de `DEMO-CUR-01` (+3, con enlace ficticio), entrega de avance del MID (+9), recordatorio de cierre de módulo de `DEMO-CUR-03` (+6), clase en vivo de `DEMO-CUR-03` (+10, creada por `DEMO-U05`), un evento pasado (-5) y uno cancelado.
  - 4 observaciones docentes de ejemplo sobre alumnos `DEMO-L12` a `DEMO-L17`.
  - Configuración ERICK con datos ficticios rotulados DEMOSTRACIÓN.
- Las sustentaciones MID con evaluador y fecha asignada se muestran en el calendario automáticamente como tipo `sustentacion`, sin duplicarlas en `eventosCalendario`.

### B.6 Servicios y reglas

- `servicios/calendario.ts`: `crearEvento`, `editarEvento`, `cancelarEvento`, `eventosDePersona(personaId)` (eventos de los programas con matrícula vigente o vencida, más sus sustentaciones), `eventosDeDocente(docenteId)`. Validaciones: título de 5 o más caracteres, fecha hoy o posterior al crear, hora fin posterior a inicio, enlace https opcional, el docente solo en sus programas. Cada cambio registra bitácora y notifica a todos los matriculados del programa ("Nueva fecha: Examen final del Curso Liderazgo Comercial el 28/11/2026").
- `servicios/docentes.ts`: `asignarDocente`, `retirarDocente`, `programasDeDocente`, `puedeGestionarPrograma(docenteId, programaId)` (el diplomado habilita también sus cursos y su MID).
- `servicios/videosLocales.ts`: guardar, leer y borrar archivos en IndexedDB (base `erick-videos`, almacén `videos`); formatos `video/mp4` y `video/webm`; tamaño máximo 300 MB; devuelve un `archivoVideoId`. "Reiniciar demostración" borra la base. Si IndexedDB no está disponible, muestra el error y deja solo la opción de YouTube.
- `servicios/notasDocente.ts`: arma la libreta de un programa a partir de `resumirPrograma` (sin recalcular a mano): por estudiante, nota por módulo, TIM, nota del curso, estado, elementos aprobados de total, intentos usados, bloqueos por intentos y fecha de la última actividad. Exporta CSV y PDF con el formato de los reportes existentes.
- Reutiliza las reglas existentes: intentos extra con `otorgarIntentoExtra` de `servicios/evaluaciones.ts` (con motivo), sin permitir cambiar notas automáticas.
- `asignarEvaluador` del MID solo ofrece docentes asignados al MID del programa.

### B.7 Pantallas y rutas

**Administrador educativo** (`/erick`, `LayoutErick` con tema verde y logo "ERICK S.A.C. · Administración educativa"):

| Ruta | Pantalla | Origen |
|---|---|---|
| `/erick/resumen` | Resumen educativo: indicadores, gráficos, próximas fechas, sustentaciones por asignar | Reutiliza `ResumenAcademico` y agrega bloques |
| `/erick/programas`, `/erick/programas/:id` | Programas y editor | Reutiliza `ProgramasAcademicos` y `EditorPrograma`; el editor muestra los docentes asignados |
| `/erick/preguntas` | Banco de preguntas | Reutiliza |
| `/erick/estudiantes` | Directorio de estudiantes con buscador, filtros por programa y estado, y ficha académica (reutiliza `FichaAcademica`) | Nueva |
| `/erick/docentes` | Docentes: alta de docente (persona con perfil `evaluador`), asignación y retiro de programas, carga de cada docente | Nueva |
| `/erick/matriculas` | Matrículas | Reutiliza |
| `/erick/membresias` | Membresías | Reutiliza |
| `/erick/certificados` | Certificados | Reutiliza |
| `/erick/mid` | Sustentaciones MID | Reutiliza |
| `/erick/calendario` | Calendario académico de todos los programas (crear, editar, cancelar) | Nueva, mismo componente que el docente |
| `/erick/reportes` | Reportes académicos | Reutiliza |
| `/erick/integracion` | Eventos del conector LMS y estado de sincronización | Reutiliza `RegistroEventosLms` |
| `/erick/configuracion` | Datos institucionales, texto del certificado y valores por defecto | Nueva |
| `/erick/bitacora` | Bitácora filtrada a los módulos académicos | Nueva, reutiliza la tabla de auditoría |

**Docente** (`/docente`, `LayoutDocente` con tema verde; `/evaluador` redirige a `/docente/sustentaciones`):

| Ruta | Pantalla |
|---|---|
| `/docente/cursos` | Mis cursos asignados: tarjetas con estudiantes, avance promedio, próximas fechas y accesos rápidos |
| `/docente/cursos/:programaId/clases` | Clases en video: lista de temas por módulo con el estado del video (simulado, YouTube o archivo), y para cada tema un panel para pegar el enlace de YouTube o subir un archivo con barra de progreso, vista previa y opción de quitar |
| `/docente/cursos/:programaId/notas` | Libreta de notas: tabla de estudiantes por módulo con buscador, filtros (en curso, aprobados, bloqueados, sin actividad en 14 días), exportación CSV y PDF; al tocar un estudiante se abre un panel con sus intentos, la acción "Otorgar intento extra" con motivo y sus observaciones docentes |
| `/docente/calendario` | Calendario de sus programas: vista mensual y lista; crear, editar y cancelar fechas |
| `/docente/sustentaciones` | Bandeja MID actual (`BandejaMid`) sin cambios de lógica |

En móvil, la libreta muestra una tarjeta por estudiante en lugar de la tabla ancha; la vista mensual del calendario pasa a lista agrupada por semana.

**Estudiante** (campus, con tema verde):

- `/campus/calendario` "Mi calendario": vista mensual y lista de próximas fechas, con un color e icono por tipo (`GraduationCap` examen final, `Video` clase en vivo, `FileUp` entrega, `Microscope` sustentación, `Bell` recordatorio), botón para abrir el enlace de la clase en vivo y estado cancelado tachado.
- Bloque "Próximas fechas" (las 3 siguientes) en Mis programas y en la ruta del programa, con el examen final destacado y la cuenta regresiva en días.
- Agrega "Mi calendario" al menú del campus.

**MLM corporativo:**

- Quita el grupo "Académico" del menú corporativo; las rutas `/corporativo/academico/*` redirigen a `/corporativo/integracion-erick`.
- Nueva pantalla `/corporativo/integracion-erick` de solo lectura: eventos del conector, estado formativo de afiliados y ventas de productos formativos por período, con el aviso "La administración académica corresponde a ERICK S.A.C.".
- Actualiza la Guía de flujos F09 a F13 para que los pasos académicos usen `/erick/...` con `rolId: 'DEMO-U04'` y los pasos del evaluador `/docente/...` con `DEMO-U03`.

### B.8 Tema visual ERICK

- Implementa el tema con variables CSS, sin duplicar componentes: en `src/index.css` agrega un bloque `[data-tema='erick'] { ... }` que redefine `--color-primario`, `--color-primario-hover`, `--color-primario-suave`, `--color-primario-profundo`, `--color-acento`, `--color-acento-suave`, `--color-acento-brillo`, `--color-fondo` y `--color-borde` con los valores de la sección A.3.
- Los layouts ERICK (`LayoutCampus`, `LayoutErick`, `LayoutDocente`) y la página pública `/verificar` ponen `data-tema="erick"` en `document.documentElement` al montarse y lo quitan al desmontarse, para que también cambien el fondo del `body`, los modales y los toasts.
- Menú lateral ERICK claro: agrega una variante `marca="erick"` a `MenuLateral` y `Logo` (degradado `#EAF6EE` a `#D4ECDD`, texto `#1E4A37`, secundario `#4F6F5E`, ítem activo con fondo `#2E6B4F` y texto blanco, foco visible). No cambies la variante MLM.
- Reemplaza los colores fijos que hoy quedan en pantallas ERICK (por ejemplo `text-[#155E75]` en `BandejaMid`, el degradado `.fondo-menu-campus` y los colores de los gráficos académicos) por tokens del tema.
- Los PDF de certificados mantienen su diseño actual salvo el color de acento, que pasa a `#2E6B4F`.
- Revisa el contraste con las cifras de A.3 y repórtalo al cerrar E1.

### B.9 Fases

| Fase | Contenido | Cierre |
|---|---|---|
| **E1 - Separación y tema** | Perfil `admin_educativo` y personas `DEMO-U04` y `DEMO-U05`; permisos nuevos; tema verde (variables, menú, logo, colores fijos); `LayoutErick` y rutas `/erick/*` con las pantallas reutilizadas; quitar "Académico" del MLM y crear Integración ERICK; redirecciones; guía de flujos actualizada | Capturas MLM frente a ERICK en 375 y 1440 px; contraste reportado |
| **E2 - Administración educativa completa** | `useErickStore` y semillas; Estudiantes, Docentes (asignaciones), Configuración, Bitácora académica, Calendario de administración, Resumen ampliado | Pruebas de asignación y de permisos por programa |
| **E3 - Docente** | `LayoutDocente`, Mis cursos, Clases en video (YouTube y archivo en IndexedDB), Libreta de notas con exportación, intentos extra y observaciones, calendario del docente; filtro estricto por programas asignados | Prueba con `DEMO-U05`: no ve `DEMO-CUR-01` |
| **E4 - Calendario del estudiante y cierre** | Mi calendario, Próximas fechas, notificaciones; sustentaciones en el calendario; flujos nuevos F14 a F16 en la guía; documentación; checklist | Todo verde y documentos actualizados |

Flujos nuevos de la guía:
- **F14 - Docente agenda el examen final:** `DEMO-U03` crea "Examen final" de `DEMO-CUR-01`; `DEMO-L01` recibe la notificación y lo ve en Mi calendario y en Próximas fechas.
- **F15 - Docente sube una clase:** `DEMO-U03` sube un archivo de video al tema 3 de `DEMO-CUR-01`; `DEMO-L01` lo reproduce en el tema.
- **F16 - Administrador educativo asigna un docente:** `DEMO-U04` asigna `DEMO-U05` a `DEMO-CUR-01`; el docente ve el curso en Mis cursos.

### B.10 Pruebas

Crea `pruebas/erick.prueba.ts` y súmalo a `npm run pruebas` y como `npm run prueba:erick`. Cubre como mínimo:
1. Permisos: `admin_educativo` tiene todo ERICK; superadministrador MLM solo consulta lo académico.
2. Asignaciones: `puedeGestionarPrograma` acepta el diplomado y sus cursos y rechaza programas no asignados.
3. Calendario: validaciones, notificación a todos los matriculados, cancelación, eventos de una persona incluyen sus sustentaciones.
4. Libreta: coincide con `resumirPrograma` para `DEMO-L12` y `DEMO-L17`; la exportación tiene una fila por estudiante.
5. Videos: rechazo de formato y tamaño (con una función pura de validación, sin IndexedDB en la prueba).
6. Las notas automáticas no cambian al otorgar un intento extra.
7. Verificación de consistencia académica y las 16 verificaciones MLM siguen correctas.

### B.11 Criterios de aceptación

| Código | Criterio |
|---|---|
| CE-01 | Con `DEMO-U04` se administra todo ERICK desde `/erick` sin entrar al corporativo MLM. |
| CE-02 | El superadministrador MLM ya no ve el grupo "Académico"; solo ve Integración ERICK en lectura. |
| CE-03 | Todas las pantallas ERICK usan el tema verde pastel; las del MLM siguen en azul; el cambio de rol cambia el tema al instante. |
| CE-04 | El docente solo ve y modifica sus programas asignados, también si escribe la URL a mano. |
| CE-05 | El docente sube un video (YouTube o archivo) y el estudiante lo ve en el tema. |
| CE-06 | La libreta muestra la nota de cada estudiante por módulo y exporta CSV y PDF. |
| CE-07 | El docente no puede cambiar notas automáticas; sí otorga intentos extra con motivo. |
| CE-08 | Una fecha creada por el docente aparece en Mi calendario y en Próximas fechas, con notificación. |
| CE-09 | Las sustentaciones MID asignadas aparecen en el calendario del docente y del estudiante. |
| CE-10 | Sin scroll horizontal en 375 px; objetivos táctiles de 44 px; foco visible. |
| CE-11 | Build, oxlint y pruebas en verde; 16 verificaciones MLM sin cambios. |

### B.12 Fuera de alcance

Servidor de videos real, transmisión en vivo, videollamadas, correos, sincronización con Google Calendar, pagos reales y firma digital certificada. El video subido por archivo solo existe en el navegador donde se subió.

### B.13 Documentación al cerrar

Actualiza `CLAUDE.md` (sección ERICK con E1 a E4), `docs/CHECKLIST_REQUERIMIENTOS.md` (requerimientos ERK-001 en adelante con los criterios CE), `docs/GUION_DEMOSTRACION.md` (bloque ERICK con F14 a F16), la sección 15 del prompt LMS (subida de video local permitida) y `docs/API_LMS.md` si cambian los eventos del conector.
