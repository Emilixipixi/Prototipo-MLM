# Cambios fase E4 - Calendario del estudiante y cierre (15/11/2026)

Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, fase E4.

## Archivos nuevos

- `src/componentes/campus/ProximasFechas.tsx`
- `src/datos/academico/notificacionesErick.ts`
- `src/hooks/useAgendaPersona.ts`
- `src/paginas/campus/MiCalendario.tsx`
- `src/servicios/proximasFechas.ts`

## Archivos modificados (líneas con + son nuevas; con - las líneas cambiadas)

### `CLAUDE.md`

```diff
@@ -44,7 +44,7 @@
 - E1. Separación y tema (completada: perfil `admin_educativo` DEMO-U04, docente DEMO-U05, módulos de permiso `calendario`, `docentes`, `contenidos`, `configuracion_erick`; el MLM solo consulta lo académico; tema verde pastel con `html[data-tema='erick']` en `src/index.css` y `hooks/useTemaErick.ts`; panel `/erick` con `layouts/LayoutErick.tsx`; Integración ERICK en `/corporativo/integracion-erick`; `/corporativo/academico/*` redirige; 30 alumnos más DEMO-L18 a L47 y 10 membresías en `datos/academico/alumnosAmpliados.ts`; pruebas `npm run prueba:erick`)
 - E2. Administración educativa completa (completada: `store/useErickStore.ts` con calendario, asignaciones de docentes, observaciones y configuración; datos en `datos/academico/erickInicial.ts` y docentes DEMO-U06 y DEMO-U07; servicios `docentes.ts`, `calendario.ts`, `configuracionErick.ts`; pantallas `/erick/resumen`, `/erick/estudiantes`, `/erick/docentes`, `/erick/calendario`, `/erick/configuracion`, `/erick/bitacora`; componente `componentes/campus/CalendarioAcademico.tsx`)
 - E3. Docente (completada: panel `/docente` con `layouts/LayoutDocente.tsx`; `/evaluador` redirige a `/docente/sustentaciones`; pantallas en `paginas/docente/` Mis cursos, Clases en video, Libreta de notas y Calendario; videos MP4/WEBM en IndexedDB con `servicios/videosLocales.ts` (base `erick-videos`, se borra al reiniciar la demostración); `servicios/contenidosDocente.ts` y `servicios/notasDocente.ts`; el archivo subido tiene prioridad sobre YouTube en `TemaCampus`)
-- E4. Calendario del estudiante y cierre (pendiente)
+- E4. Calendario del estudiante y cierre (completada: `/campus/calendario` Mi calendario en `paginas/campus/MiCalendario.tsx`; bloque Próximas fechas `componentes/campus/ProximasFechas.tsx` en Mis programas y en la ruta del programa; `hooks/useAgendaPersona.ts` y `servicios/proximasFechas.ts`; notificaciones precargadas en `datos/academico/notificacionesErick.ts`; flujos F14 a F16 en la guía; `hoyCampus` usa la fecha local; checklist ERK-001 a ERK-011 y guion actualizados)
 
 Pruebas: `npm run pruebas`.
```

### `docs/CHECKLIST_REQUERIMIENTOS.md`

```diff
@@ -162,3 +162,24 @@
 | LMS-097 | API documentada | `/corporativo/integraciones` | Cubierto |  |
 
 Total: 77 requerimientos LMS (77 cubiertos). Pruebas automáticas: `npm run pruebas`.
+
+## Plataforma ERICK S.A.C. independiente (ERK-001 a ERK-011)
+
+Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, criterios CE-01 a CE-11. Fases E1 a E4 completadas el 15/11/2026.
+
+| Código | Criterio | Dónde se ve | Estado | Nota |
+|---|---|---|---|---|
+| ERK-001 | CE-01 Administración completa de ERICK sin entrar al corporativo MLM | `/erick/*` con DEMO-U04 | Cubierto | Resumen, programas, preguntas, matrículas, membresías, certificados, MID, reportes, estudiantes, docentes, calendario, configuración y bitácora. |
+| ERK-002 | CE-02 El MLM solo ve Integración ERICK en lectura | `/corporativo/integracion-erick` | Cubierto | `/corporativo/academico/*` redirige. |
+| ERK-003 | CE-03 Tema verde pastel en ERICK y azul en el MLM | Todas las pantallas `/erick`, `/campus`, `/docente` | Cubierto | `html[data-tema='erick']` se activa al cambiar de rol. |
+| ERK-004 | CE-04 El docente solo ve y modifica sus programas asignados, también por URL | `/docente/cursos/:programaId/*` | Cubierto | Regla en servicios (`puedeGestionarPrograma`); prueba con DEMO-U05 y DEMO-CUR-01. |
+| ERK-005 | CE-05 El docente sube un video y el estudiante lo ve | `/docente/cursos/DEMO-CUR-01/clases`, `/campus/temas/:id` | Cubierto | YouTube o archivo MP4/WEBM hasta 300 MB en IndexedDB; el archivo tiene prioridad. |
+| ERK-006 | CE-06 Libreta por módulo con exportación CSV y PDF | `/docente/cursos/:programaId/notas` | Cubierto | Coincide con `resumirPrograma` (prueba con DEMO-L12 y DEMO-L17). |
+| ERK-007 | CE-07 Notas automáticas intactas; intentos extra con motivo | Cajón del estudiante en la libreta | Cubierto | También observaciones del docente. |
+| ERK-008 | CE-08 Fecha del docente en Mi calendario, Próximas fechas y notificación | `/docente/calendario`, `/campus/calendario`, `/campus/programas` | Cubierto | Crear, cambiar o cancelar avisa a todos los matriculados. |
+| ERK-009 | CE-09 Sustentaciones MID en el calendario del docente y del estudiante | `/docente/calendario`, `/campus/calendario` | Cubierto | Se generan desde las sustentaciones asignadas. |
+| ERK-010 | CE-10 Sin scroll horizontal a 375 px, objetivos de 44 px y foco visible | Revisión 375, 768 y 1440 px | Cubierto | |
+| ERK-011 | CE-11 Build, oxlint y pruebas en verde; 16 verificaciones MLM sin cambios | `npm run pruebas`, `/demo/datos` | Cubierto | 54 pruebas (18 de ERICK); verificaciones MLM 16/16. |
+
+Total: 11 requerimientos ERICK (11 cubiertos).
+
```

### `docs/GUION_DEMOSTRACION.md`

```diff
@@ -146,3 +146,25 @@
 ### Nota sobre la verificación pública
 
 Los datos viven en el navegador. Un QR escaneado desde otro dispositivo verifica los documentos precargados; los emitidos durante la demostración se verifican en el mismo navegador.
+
+## 8. Plataforma ERICK S.A.C. independiente
+
+ERICK S.A.C. tiene su propia identidad (verde pastel) y su propia administración. Cambia de rol con el selector "Rol demo" o desde la Guía de flujos; el tema cambia al instante.
+
+### Recorrido por roles (8 a 10 minutos)
+
+- **Administrador educativo (DEMO-U04, `/erick/resumen`).** Resumen educativo con próximas fechas y carga docente; Estudiantes con ficha lateral; Docentes con asignaciones; Calendario académico; Configuración y Bitácora académica.
+- **Docente (DEMO-U03, `/docente/cursos`).** Mis cursos con el avance de cada grupo; Clases en video; Libreta de notas con exportación, intento extra y observaciones; su calendario y la bandeja MID.
+- **Alumno (DEMO-L01, `/campus/programas`).** Próximas fechas con cuenta regresiva, Mi calendario y la campana de notificaciones.
+
+### Orden recomendado: F14, F15, F16
+
+- **F14 - Docente agenda el examen final.** DEMO-U03 abre Calendario y usa "Agendar fecha" para un Examen final del Curso Liderazgo Comercial. Cambiar a DEMO-L01: la campana muestra el aviso, Próximas fechas lo destaca en naranja y Mi calendario lo marca en la vista mensual.
+- **F15 - Docente sube una clase.** DEMO-U03 abre Clases en video del Curso Liderazgo Comercial, "Cambiar video" en el tema 1.2 "Estilos de liderazgo" y sube un MP4 o WEBM. Cambiar a DEMO-L01 y abrir el tema: se reproduce la clase subida y al terminar se marca como vista. Se usa el tema 1.2 porque es el que DEMO-L01 tiene disponible (el 1.3 sigue bloqueado hasta aprobar el 1.2).
+- **F16 - Administración asigna un docente.** DEMO-U04 abre Docentes y asigna a DEMO-U05 el Curso Liderazgo Comercial. Cambiar a DEMO-U05: el curso aparece en Mis cursos con su libreta. Antes de asignarlo, escribir `/docente/cursos/DEMO-CUR-01/notas` con DEMO-U05 muestra "Este programa no está asignado a ti".
+
+### Notas para la presentación
+
+- Los videos subidos por archivo viven solo en el navegador donde se suben y "Reiniciar demostración" los borra. Para presentar en otro equipo, usar enlaces de YouTube.
+- Si el navegador ya tenía datos de una versión anterior, usar "Reiniciar demostración" para ver las notificaciones y fechas precargadas.
+
```

### `docs/PROMPT_INTEGRACION_LMS_ERICK.md`

```diff
@@ -591,6 +591,7 @@
 - Cálculo de impuestos o facturación electrónica.
 - Integración con Moodle u otro LMS externo (se documenta como opción futura en `docs/API_LMS.md`).
 - Cambios en los motores de compensación del MLM.
+- Actualización por la ampliación ERICK (`docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, 15/11/2026): la subida de video SÍ se permite en el prototipo como archivo `.mp4` o `.webm` de hasta 300 MB guardado en IndexedDB del navegador (solo visible en el navegador donde se subió y borrado al reiniciar la demostración). Sigue fuera de alcance un servidor de videos real, la transmisión en vivo y la sincronización con calendarios externos.
 
 ---
```

### `pruebas/erick.prueba.ts`

```diff
@@ -18,6 +18,11 @@
 import { validarArchivoVideo } from '../src/servicios/videosLocales';
 import { resumirPrograma } from '../src/motores/academico/progreso';
 import { usePersonasStore } from '../src/store/usePersonasStore';
+import { diasHasta, proximasFechas, textoCuentaRegresiva } from '../src/servicios/proximasFechas';
+import { filasExportablesLibreta } from '../src/servicios/notasDocente';
+import { flujosDemostracion } from '../src/datos/guiaFlujos';
+import { notificacionesErick } from '../src/datos/academico/notificacionesErick';
+import { hoyCampus } from '../src/datos/academico/fechasCampus';
 
 let total = 0;
 function prueba(nombre: string, cuerpo: () => void): void {
@@ -206,4 +211,42 @@
   assert.equal(rutaInicioPorPerfil('evaluador'), '/docente/cursos');
 });
 
+prueba('E4 próximas fechas: solo programadas y futuras, ordenadas, máximo 3 y filtro por programa', () => {
+  const hoy = relativoHoy(0);
+  const agenda = eventosDePersona('DEMO-L01');
+  const lista = proximasFechas(agenda, hoy);
+  assert.ok(lista.length > 0 && lista.length <= 3);
+  lista.forEach((evento) => { assert.equal(evento.estado, 'programado'); assert.ok(evento.fecha >= hoy); });
+  assert.deepEqual(lista.map((evento) => `${evento.fecha}${evento.horaInicio}`), [...lista.map((evento) => `${evento.fecha}${evento.horaInicio}`)].sort());
+  const curso = programasActuales().find((programa) => programa.id === 'DEMO-CUR-03');
+  assert.ok(proximasFechas(eventosDePersona('DEMO-L01'), hoy, 10, curso, programasActuales()).every((evento) => evento.programaId === 'DEMO-CUR-03'));
+  assert.equal(textoCuentaRegresiva(0), 'Hoy');
+  assert.equal(textoCuentaRegresiva(1), 'Mañana');
+  assert.equal(textoCuentaRegresiva(diasHasta(relativoHoy(9), hoy)), 'En 9 días');
+  assert.match(hoyCampus(), /^\d{4}-\d{2}-\d{2}$/);
+});
+
+prueba('E4 F14: el examen final del docente llega a Mi calendario, Próximas fechas y notificaciones de DEMO-L01', () => {
+  const avisosAntes = useNotificacionesStore.getState().notificaciones.filter((item) => item.personaId === 'DEMO-L01').length;
+  const creado = crearEvento({ ...base('DEMO-CUR-01'), titulo: 'Examen final adelantado', fecha: relativoHoy(1) }, 'DEMO-U03');
+  assert.ok(creado.ok);
+  const id = creado.ok ? creado.valor.evento.id : '';
+  assert.ok(eventosDePersona('DEMO-L01').some((evento) => evento.id === id));
+  assert.equal(proximasFechas(eventosDePersona('DEMO-L01'), relativoHoy(0))[0]?.fecha <= relativoHoy(1), true);
+  assert.equal(useNotificacionesStore.getState().notificaciones.filter((item) => item.personaId === 'DEMO-L01').length, avisosAntes + 1);
+  assert.ok(cancelarEvento(id, 'DEMO-U03', 'Se mantiene la fecha original del examen').ok);
+  assert.ok(!proximasFechas(eventosDePersona('DEMO-L01'), relativoHoy(0), 20).some((evento) => evento.id === id));
+});
+
+prueba('E4 notificaciones precargadas, exportación de la libreta y flujos F14 a F16', () => {
+  assert.ok(notificacionesErick.some((item) => item.personaId === 'DEMO-L01' && item.titulo.includes('Examen final')));
+  assert.equal(new Set(notificacionesErick.map((item) => item.id)).size, notificacionesErick.length);
+  const libreta = libretaDe('DEMO-CUR-01');
+  const filas = filasExportablesLibreta(libreta);
+  assert.equal(filas.length, libreta.filas.length);
+  assert.equal(new Set(filas.map((fila) => fila.Estudiante)).size, filas.length);
+  ['F14', 'F15', 'F16'].forEach((id) => assert.ok(flujosDemostracion.some((flujo) => flujo.id === id), id));
+  assert.equal(flujosDemostracion.flatMap((flujo) => flujo.pasos).length, 55);
+});
+
 console.log(`\n${total} pruebas de ERICK superadas`);
```

### `src/componentes/demo/GuiaFlujos.tsx`

```diff
@@ -23,6 +23,7 @@
   'DEMO-L01': 'Alumna DEMO-L01', 'DEMO-L03': 'Alumno DEMO-L03', 'DEMO-L06': 'Alumna DEMO-L06', 'DEMO-U03': 'Evaluador DEMO-U03',
   'DEMO-U04': 'Administradora educativa DEMO-U04',
 };
+nombresRol['DEMO-U05'] = 'Docente DEMO-U05';
 
 function useEstadoGuia(): EstadoGuia {
   const personas = usePersonasStore((estado) => estado.personas);
```

### `src/datos/academico/fechasCampus.ts`

```diff
@@ -2,7 +2,7 @@
 import { fechaHoraActualIso } from '../../utilidades/fechas';
 
 export function hoyCampus(): string {
-  return fechaHoraActualIso().slice(0, 10);
+  return format(parseISO(fechaHoraActualIso()), 'yyyy-MM-dd');
 }
 
 export function sumarDias(fecha: string, dias: number): string {
```

### `src/datos/guiaFlujos.ts`

```diff
@@ -42,6 +42,7 @@
 const pedidosBase = new Set(pedidosIniciales.map((pedido) => pedido.id));
 const nuevosEmpresarios = (estado: EstadoGuia) => estado.personas.filter((persona) => !idsIniciales.has(persona.id) && persona.tipo === 'empresario' && persona.referenteId === 'DEMO-A01');
 const corridaC02 = (estado: EstadoGuia) => estado.corridas.find((corrida) => corrida.periodoId === 'DEMO-C02' && !corrida.parametrosTemporales) ?? estado.corridas.find((corrida) => corrida.periodoId === 'DEMO-C02');
+const accionDe = (estado: EstadoGuia, accion: string, actorId: string, referenciaId?: string) => estado.bitacora.some((registro) => registro.accion === accion && registro.actorId === actorId && (!referenciaId || registro.referenciaId === referenciaId));
 const hayAccion = (estado: EstadoGuia, accion: string, referenciaId?: string) => estado.bitacora.some((registro) => registro.accion === accion && (!referenciaId || registro.referenciaId === referenciaId));
 
 export const flujosDemostracion: FlujoDemostracion[] = [
@@ -158,4 +159,26 @@
       { id: 'F13-4', texto: 'DEMO-L03 ve su constancia MID; su diploma sigue igual.', ruta: '/campus/certificados', rolId: 'DEMO-L03', detectar: (estado) => documentoNuevo(estado, 'DEMO-L03', 'constancia_mid') },
     ],
   },
+  {
+    id: 'F14', titulo: 'Docente agenda el examen final', objetivo: 'Una fecha creada por el docente llega al estudiante como notificación, en Mi calendario y en Próximas fechas.',
+    pasos: [
+      { id: 'F14-1', texto: 'DEMO-U03 agenda un "Examen final" para el Curso Liderazgo Comercial (DEMO-CUR-01) con el botón Agendar fecha.', ruta: '/docente/calendario', rolId: 'DEMO-U03', detectar: (estado) => accionDe(estado, 'Fecha agendada en el calendario', 'DEMO-U03') },
+      { id: 'F14-2', texto: 'DEMO-L01 recibe la notificación (campana) y ve la fecha en Próximas fechas de Mis programas.', ruta: '/campus/programas', rolId: 'DEMO-L01' },
+      { id: 'F14-3', texto: 'DEMO-L01 abre Mi calendario y encuentra el examen en la vista mensual y en Próximas.', ruta: '/campus/calendario', rolId: 'DEMO-L01' },
+    ],
+  },
+  {
+    id: 'F15', titulo: 'Docente sube una clase en video', objetivo: 'El docente reemplaza la clase de un tema con un archivo propio y el estudiante la reproduce.',
+    pasos: [
+      { id: 'F15-1', texto: 'DEMO-U03 abre Clases en video del Curso Liderazgo Comercial y sube un MP4 o WEBM al tema 1.2 "Estilos de liderazgo".', ruta: '/docente/cursos/DEMO-CUR-01/clases', rolId: 'DEMO-U03', detectar: (estado) => accionDe(estado, 'Clase en video actualizada', 'DEMO-U03', 'DEMO-TEM-002') },
+      { id: 'F15-2', texto: 'DEMO-L01 abre el tema y reproduce la clase subida por su docente (el archivo tiene prioridad sobre YouTube).', ruta: '/campus/temas/DEMO-TEM-002', rolId: 'DEMO-L01' },
+    ],
+  },
+  {
+    id: 'F16', titulo: 'Administración asigna un docente', objetivo: 'El administrador educativo decide qué programas ve cada docente.',
+    pasos: [
+      { id: 'F16-1', texto: 'DEMO-U04 asigna a DEMO-U05 (Docente Ventas) el Curso Liderazgo Comercial en Docentes.', ruta: '/erick/docentes', rolId: 'DEMO-U04', detectar: (estado) => estado.bitacora.some((registro) => registro.accion === 'Docente asignado a programa' && registro.referenciaId === 'DEMO-CUR-01' && JSON.stringify(registro.despues).includes('DEMO-U05')) },
+      { id: 'F16-2', texto: 'DEMO-U05 entra a Mis cursos y ya ve el Curso Liderazgo Comercial con su libreta de notas.', ruta: '/docente/cursos', rolId: 'DEMO-U05' },
+    ],
+  },
 ];
```

### `src/datos/notificaciones.ts`

```diff
@@ -1,4 +1,5 @@
 import type { Notificacion } from '../tipos/notificacion';
+import { notificacionesErick } from './academico/notificacionesErick';
 
 export const notificacionesIniciales: Notificacion[] = [
   {
@@ -26,3 +27,5 @@
     fecha: '2026-11-03T11:20:00', leida: true,
   },
 ];
+
+notificacionesIniciales.push(...notificacionesErick);
```

### `src/paginas/campus/MisProgramas.tsx`

```diff
@@ -3,6 +3,7 @@
 import { Link } from 'react-router-dom';
 import { rutaRenovacion } from '../../componentes/campus/rutasCampus';
 import { TarjetaProgramaCampus } from '../../componentes/campus/TarjetaProgramaCampus';
+import { ProximasFechas } from '../../componentes/campus/ProximasFechas';
 import { Boton } from '../../componentes/ui/Boton';
 import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
 import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
@@ -69,6 +70,8 @@
         />
       </div>
 
+      <ProximasFechas personaId={persona.id} />
+
       {datos.membresia && datos.estadoMembresia === 'por_vencer' && (
         <div className="flex flex-wrap items-center gap-3 rounded-tarjeta border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-[#92400E]">
           <AlertTriangle className="size-5 shrink-0" aria-hidden />
```

### `src/paginas/campus/RutaPrograma.tsx`

```diff
@@ -2,6 +2,7 @@
 import { Link, useParams } from 'react-router-dom';
 import { ArrowLeft, ArrowRight, CalendarDays, ClipboardList, GraduationCap, Lock, Microscope, NotebookPen } from 'lucide-react';
 import { AnilloProgreso } from '../../componentes/campus/AnilloProgreso';
+import { ProximasFechas } from '../../componentes/campus/ProximasFechas';
 import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
 import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
 import { Insignia } from '../../componentes/ui/Insignia';
@@ -97,6 +98,7 @@
       {acceso.acceso && acceso.vencimiento && (
         <p className="flex items-center gap-2 text-[12.5px] text-texto-2"><CalendarDays className="size-4" aria-hidden />Acceso hasta el {formatearFecha(acceso.vencimiento)}{acceso.via === 'membresia' ? ' (membresía)' : acceso.via === 'diplomado' ? ' (por tu diplomado)' : ''}</p>
       )}
+      {persona && <ProximasFechas personaId={persona.id} programaId={programa.id} />}
 
       {resumen.cursos.map((curso, indiceCurso) => (
         <section key={curso.programa.id} className="flex flex-col gap-3">
```

### `src/rutas/Rutas.tsx`

```diff
@@ -90,6 +90,8 @@
 };
 
 const rutasCampus = ['programas', 'programas/:id', 'temas/:id', 'evaluaciones/:ambito/:id', 'tim/:id', 'notas', 'historial', 'certificados', 'membresia', 'mid'];
+pantallasCampus.calendario = lazy(() => import('../paginas/campus/MiCalendario'));
+rutasCampus.push('calendario');
 
 const pantallasAcademicas: Record<string, ComponentType> = {
   'academico/resumen': lazy(() => import('../paginas/corporativo/academico/ResumenAcademico')),
```

### `src/rutas/navegacionCampus.ts`

```diff
@@ -78,3 +78,5 @@
   },
   { titulo: 'Evaluación académica', items: [{ texto: 'Sustentaciones MID', ruta: '/docente/sustentaciones', icono: ClipboardPen }] },
 ];
+
+navegacionCampus[0].items.push({ texto: 'Mi calendario', ruta: '/campus/calendario', icono: CalendarDays });
```

### `src/rutas/pantallas.ts`

```diff
@@ -56,6 +56,7 @@
   { patron: '/campus/historial', numero: 'C7', nombre: 'Historial académico', requerimientos: ['LMS-055'], fase: 8, descripcion: 'Programas por estado y documentos obtenidos.' },
   { patron: '/campus/certificados', numero: 'C8', nombre: 'Mis certificados', requerimientos: ['LMS-056'], fase: 8, descripcion: 'Certificados y diplomas en PDF con código QR y verificación.' },
   { patron: '/campus/membresia', numero: 'C9', nombre: 'Mi membresía', requerimientos: ['LMS-057', 'LMS-063'], fase: 8, descripcion: 'Plan, vencimiento y renovación de la membresía educativa.' },
+  { patron: '/campus/calendario', numero: 'C11', nombre: 'Mi calendario', requerimientos: ['ERK-E4'], fase: 9, etiquetaFase: 'ERICK E4', descripcion: 'Exámenes finales, clases en vivo, entregas y sustentaciones de mis programas.' },
   { patron: '/campus/mid', numero: 'C10', nombre: 'Mi MID', requerimientos: ['LMS-070', 'LMS-071'], fase: 8, descripcion: 'Solicitud, entrega y resultado de la sustentación MID.' },
   { patron: '/erick/resumen', numero: 'P1', nombre: 'Resumen educativo', requerimientos: ['LMS-088'], fase: 8, descripcion: 'Estadísticas de matrículas, avance, aprobación y documentos.' },
   { patron: '/erick/programas', numero: 'P2', nombre: 'Programas académicos', requerimientos: ['LMS-080'], fase: 8, descripcion: 'Cursos, diplomados y MID con su estado de publicación.' },
```
