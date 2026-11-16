# MLM 2027 - Prototipo navegable

Fuente de verdad: `docs/PROMPT_MAESTRO.md`. Referencia visual: `docs/referencia_visual_MLM2027.html`.

## Reglas obligatorias
- Entorno Windows: comandos de PowerShell (`Remove-Item`, `Copy-Item`, `$env:VAR=`), rutas `D:\Prototipo\Prototipo-MLM`.
- Prohibido usar emojis en código, interfaz, datos, commits y respuestas. Iconos solo de `lucide-react`.
- Nombres de código en español sin tildes; textos visibles con tildes correctas. Archivos en UTF-8.
- Trabajo por fases: no adelantar fases, no reescribir lo que funciona; al cerrar cada fase listar archivos, comandos, criterios cubiertos y revisión responsive.
- No inventar el Plan de Compensación: todo valor es ficticio, editable y rotulado DEMOSTRACIÓN.
- Sin integraciones reales, sin backend: datos en memoria (`src/datos/`) y stores de zustand. "Reiniciar demostración" restablece todo.
- TypeScript estricto, sin `any`, sin comentarios innecesarios, motores de cálculo como funciones puras.
- Responsive mobile-first en cada fase: sin scroll horizontal de página, táctiles de 44 px, revisar 375/768/1440 px.

## Stack
Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`), react-router-dom 7, zustand, lucide-react, recharts, react-zoom-pan-pinch, date-fns. Fuentes: Plus Jakarta Sans (interfaz) y JetBrains Mono (cifras y códigos).

## Estructura
`src/rutas` (rutas, guardas, navegación, registro de pantallas), `src/layouts` (público, afiliado, corporativo), `src/paginas` (publico, afiliado, corporativo, sesion), `src/componentes/ui`, `src/componentes/demo`, `src/store`, `src/datos`, `src/tipos`, `src/hooks`, `src/utilidades`. Fases siguientes agregan `src/motores`, `src/servicios`, `src/validaciones`, `src/componentes/redes|rangos|bonos|graficos`.

## Fases
1. Base del proyecto (completada)
2. Núcleo de dominio y datos (completada: datos DEMO, motores, servicios, /demo/datos)
3. Recorrido público y cliente/alumno (pantallas 01-04) (completada)
4. Back office del afiliado (05-13) (completada)
5. Corporativo I (14-19) (completada)
6. Corporativo II (20-25) (completada)
7. Demostración guiada y control de calidad (completada)
8. Ampliaciones posteriores: Mi balance, Balance financiero, descuentos, imágenes de producto, Mis cobros y Retiros (completadas)

## Integración Campus ERICK (LMS)
Fuente de verdad: `docs/PROMPT_INTEGRACION_LMS_ERICK.md`. Referencia visual: `docs/referencia_visual_campus_ERICK.html`.
- L1. Base académica y datos (completada: tipos, perfil evaluador, módulos academico/matriculas/certificados, 45 temas y 432 preguntas, matrículas precargadas, motores puros con pruebas `npm run prueba:academico`, máquinas de estado, consistencia académica, LayoutCampus y rutas provisionales)
- L2. Matrículas, membresías y pagos (completada: conector `servicios/conectorLms.ts`, matrícula automática al confirmar el cobro, suspensión por devolución, membresías y renovación, avisos de vencimiento, pasarela local simulada en el checkout, Mis programas, Mi membresía, entradas desde Mi cuenta y el menú de usuario; pruebas `npm run prueba:matriculas`)
- L3. Campus y evaluación automática (completada)
- L4. Certificados y verificación (completada)
- L5. Panel académico, MID y reportes (completada)
- L6. Integración con MLM y control de calidad (completada: conector actualiza la formación y el RUN, registro de eventos, ficha Académico, F09 a F13, `docs/API_LMS.md`)

- Mejoras del panel académico (completadas: reordenar temas y módulos, portada de video, extender acceso, gráficos de estadísticas, filtro de fechas en reportes, clases de YouTube en los temas, 10 alumnos precargados DEMO-L08 a L17 con sustentaciones MID en `datos/academico/alumnosCampus.ts`; pruebas `npm run prueba:panel`)

## Plataforma ERICK S.A.C. independiente
Fuente de verdad: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`.
- E1. Separación y tema (completada: perfil `admin_educativo` DEMO-U04, docente DEMO-U05, módulos de permiso `calendario`, `docentes`, `contenidos`, `configuracion_erick`; el MLM solo consulta lo académico; tema verde pastel con `html[data-tema='erick']` en `src/index.css` y `hooks/useTemaErick.ts`; panel `/erick` con `layouts/LayoutErick.tsx`; Integración ERICK en `/corporativo/integracion-erick`; `/corporativo/academico/*` redirige; 30 alumnos más DEMO-L18 a L47 y 10 membresías en `datos/academico/alumnosAmpliados.ts`; pruebas `npm run prueba:erick`)
- E2. Administración educativa completa (completada: `store/useErickStore.ts` con calendario, asignaciones de docentes, observaciones y configuración; datos en `datos/academico/erickInicial.ts` y docentes DEMO-U06 y DEMO-U07; servicios `docentes.ts`, `calendario.ts`, `configuracionErick.ts`; pantallas `/erick/resumen`, `/erick/estudiantes`, `/erick/docentes`, `/erick/calendario`, `/erick/configuracion`, `/erick/bitacora`; componente `componentes/campus/CalendarioAcademico.tsx`)
- E3. Docente (completada: panel `/docente` con `layouts/LayoutDocente.tsx`; `/evaluador` redirige a `/docente/sustentaciones`; pantallas en `paginas/docente/` Mis cursos, Clases en video, Libreta de notas y Calendario; videos MP4/WEBM en IndexedDB con `servicios/videosLocales.ts` (base `erick-videos`, se borra al reiniciar la demostración); `servicios/contenidosDocente.ts` y `servicios/notasDocente.ts`; el archivo subido tiene prioridad sobre YouTube en `TemaCampus`)
- E4. Calendario del estudiante y cierre (pendiente)

Pruebas: `npm run pruebas`.

Archivos clave: `src/tipos/academico.ts`, `src/datos/academico/*`, `src/motores/academico/*`, `src/store/useAcademicoStore.ts`, `src/store/useCampusStore.ts`, `src/layouts/LayoutCampus.tsx`, `src/rutas/navegacionCampus.ts`, `pruebas/academico.prueba.ts`.
