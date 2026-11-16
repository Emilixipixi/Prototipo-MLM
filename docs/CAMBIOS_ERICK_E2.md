# Cambios fase E2 - Administración educativa completa (15/11/2026)

Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, fase E2.

## Archivos nuevos

- `src/componentes/campus/CalendarioAcademico.tsx`
- `src/componentes/campus/estilosEvento.ts`
- `src/datos/academico/erickInicial.ts`
- `src/paginas/erick/BitacoraAcademica.tsx`
- `src/paginas/erick/CalendarioErick.tsx`
- `src/paginas/erick/ConfiguracionErick.tsx`
- `src/paginas/erick/Docentes.tsx`
- `src/paginas/erick/Estudiantes.tsx`
- `src/paginas/erick/ResumenErick.tsx`
- `src/servicios/calendario.ts`
- `src/servicios/configuracionErick.ts`
- `src/servicios/docentes.ts`
- `src/store/useErickStore.ts`

## Archivos modificados (líneas con + son nuevas; con - las líneas cambiadas)

### `CLAUDE.md`

```diff
@@ -42,7 +42,7 @@
 ## Plataforma ERICK S.A.C. independiente
 Fuente de verdad: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`.
 - E1. Separación y tema (completada: perfil `admin_educativo` DEMO-U04, docente DEMO-U05, módulos de permiso `calendario`, `docentes`, `contenidos`, `configuracion_erick`; el MLM solo consulta lo académico; tema verde pastel con `html[data-tema='erick']` en `src/index.css` y `hooks/useTemaErick.ts`; panel `/erick` con `layouts/LayoutErick.tsx`; Integración ERICK en `/corporativo/integracion-erick`; `/corporativo/academico/*` redirige; 30 alumnos más DEMO-L18 a L47 y 10 membresías en `datos/academico/alumnosAmpliados.ts`; pruebas `npm run prueba:erick`)
-- E2. Administración educativa completa (pendiente)
+- E2. Administración educativa completa (completada: `store/useErickStore.ts` con calendario, asignaciones de docentes, observaciones y configuración; datos en `datos/academico/erickInicial.ts` y docentes DEMO-U06 y DEMO-U07; servicios `docentes.ts`, `calendario.ts`, `configuracionErick.ts`; pantallas `/erick/resumen`, `/erick/estudiantes`, `/erick/docentes`, `/erick/calendario`, `/erick/configuracion`, `/erick/bitacora`; componente `componentes/campus/CalendarioAcademico.tsx`)
 - E3. Docente (pendiente)
 - E4. Calendario del estudiante y cierre (pendiente)
 
```

### `pruebas/erick.prueba.ts`

```diff
@@ -4,6 +4,15 @@
 import { membresiasIniciales, matriculasIniciales } from '../src/datos/academico/matriculasIniciales';
 import { personasIniciales } from '../src/datos/personas';
 import { rutaInicioPorPerfil } from '../src/store/useSesionStore';
+import { relativoHoy } from '../src/datos/academico/fechasCampus';
+import { cancelarEvento, crearEvento, editarEvento, eventosDePersona, matriculadosDePrograma, validarEvento, type DatosEventoCalendario } from '../src/servicios/calendario';
+import { guardarConfiguracion } from '../src/servicios/configuracionErick';
+import { asignarDocente, crearDocente, programasDeDocente, puedeGestionarPrograma, retirarDocente } from '../src/servicios/docentes';
+import { useAcademicoStore } from '../src/store/useAcademicoStore';
+import { useBitacoraStore } from '../src/store/useBitacoraStore';
+import { useCampusStore } from '../src/store/useCampusStore';
+import { useErickStore } from '../src/store/useErickStore';
+import { useNotificacionesStore } from '../src/store/useNotificacionesStore';
 
 let total = 0;
 function prueba(nombre: string, cuerpo: () => void): void {
@@ -49,4 +58,78 @@
   assert.ok(matriculasIniciales.filter((matricula) => matricula.origen === 'membresia').every((matricula) => membresiasIniciales.some((membresia) => membresia.id === matricula.membresiaId && membresia.vencimiento === matricula.vencimiento)));
 });
 
+const erick = () => useErickStore.getState();
+const programasActuales = () => useAcademicoStore.getState().programas;
+
+prueba('E2 asignaciones: el diplomado habilita sus cursos y su MID; filtro estricto por docente', () => {
+  assert.deepEqual(programasDeDocente('DEMO-U03', erick().asignacionesDocentes, programasActuales()).sort(), ['DEMO-CUR-01', 'DEMO-CUR-02', 'DEMO-DIP-01', 'DEMO-MID-01']);
+  assert.deepEqual(programasDeDocente('DEMO-U05', erick().asignacionesDocentes, programasActuales()), ['DEMO-CUR-03']);
+  assert.deepEqual(programasDeDocente('DEMO-U06', erick().asignacionesDocentes, programasActuales()), ['DEMO-CUR-01']);
+  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), false);
+  assert.equal(puedeGestionarPrograma('DEMO-U04', 'DEMO-CUR-01'), true);
+  assert.equal(puedeGestionarPrograma('DEMO-L01', 'DEMO-CUR-01'), false);
+});
+
+prueba('E2 asignar, duplicar, retirar y registrar docentes', () => {
+  const asignada = asignarDocente('DEMO-U05', 'DEMO-CUR-01', 'DEMO-U04');
+  assert.ok(asignada.ok);
+  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), true);
+  assert.equal(asignarDocente('DEMO-U05', 'DEMO-CUR-01', 'DEMO-U04').ok, false);
+  assert.equal(asignarDocente('DEMO-L01', 'DEMO-CUR-01', 'DEMO-U04').ok, false);
+  assert.equal(retirarDocente(asignada.ok ? asignada.valor.id : '', 'DEMO-U04', 'corto').ok, false);
+  assert.ok(retirarDocente(asignada.ok ? asignada.valor.id : '', 'DEMO-U04', 'Fin del reemplazo temporal').ok);
+  assert.equal(puedeGestionarPrograma('DEMO-U05', 'DEMO-CUR-01'), false);
+  const nuevo = crearDocente({ nombres: 'Lucía', apellidos: 'Prueba Demo', correo: 'lucia.prueba@correo.demo', telefono: '' }, 'DEMO-U04');
+  assert.ok(nuevo.ok);
+  assert.equal(nuevo.ok && nuevo.valor.perfil, 'evaluador');
+  assert.equal(crearDocente({ nombres: 'Otra', apellidos: 'Persona', correo: 'lucia.prueba@correo.demo', telefono: '' }, 'DEMO-U04').ok, false);
+});
+
+const base = (programaId: string): DatosEventoCalendario => ({ programaId, tipo: 'examen_final', titulo: 'Examen final de prueba', descripcion: 'Prueba', fecha: relativoHoy(5), horaInicio: '10:00', horaFin: '11:00', enlace: null });
+
+prueba('E2 calendario: validaciones, permisos por programa y avisos a matriculados', () => {
+  assert.match(validarEvento({ ...base('DEMO-CUR-01'), titulo: 'Ex' }, relativoHoy(0), true) ?? '', /título/);
+  assert.match(validarEvento({ ...base('DEMO-CUR-01'), fecha: relativoHoy(-1) }, relativoHoy(0), true) ?? '', /hoy o posterior/);
+  assert.match(validarEvento({ ...base('DEMO-CUR-01'), horaFin: '09:00' }, relativoHoy(0), true) ?? '', /posterior/);
+  assert.match(validarEvento({ ...base('DEMO-CUR-01'), enlace: 'http://x' }, relativoHoy(0), true) ?? '', /https/);
+  assert.equal(crearEvento(base('DEMO-CUR-01'), 'DEMO-U05').ok, false);
+  const destinatarios = matriculadosDePrograma('DEMO-CUR-01', useCampusStore.getState().matriculas, programasActuales());
+  assert.ok(destinatarios.includes('DEMO-L01') && destinatarios.includes('DEMO-L12'));
+  const antes = useNotificacionesStore.getState().notificaciones.length;
+  const creado = crearEvento(base('DEMO-CUR-01'), 'DEMO-U03');
+  assert.ok(creado.ok, creado.ok ? '' : creado.error);
+  assert.equal(creado.ok && creado.valor.avisados, destinatarios.length);
+  assert.equal(useNotificacionesStore.getState().notificaciones.length - antes, destinatarios.length);
+  const id = creado.ok ? creado.valor.evento.id : '';
+  assert.ok(eventosDePersona('DEMO-L12').some((evento) => evento.id === id));
+  assert.equal(eventosDePersona('DEMO-L25').some((evento) => evento.id === id), false);
+  assert.ok(editarEvento(id, { ...base('DEMO-CUR-01'), fecha: relativoHoy(6) }, 'DEMO-U03').ok);
+  assert.equal(cancelarEvento(id, 'DEMO-U03', 'no').ok, false);
+  assert.ok(cancelarEvento(id, 'DEMO-U03', 'Se reprograma por feriado nacional').ok);
+  assert.equal(erick().eventosCalendario.find((evento) => evento.id === id)?.estado, 'cancelado');
+});
+
+prueba('E2 agenda del estudiante incluye su sustentación MID asignada', () => {
+  const agenda = eventosDePersona('DEMO-L12');
+  assert.ok(agenda.some((evento) => evento.tipo === 'sustentacion' && evento.virtual));
+  assert.ok(agenda.some((evento) => evento.programaId === 'DEMO-CUR-01' && evento.tipo === 'examen_final'));
+});
+
+prueba('E2 configuración: validación, guardado y bitácora', () => {
+  const actual = erick().configuracion;
+  assert.equal(guardarConfiguracion({ ...actual, ruc: '12' }, 'DEMO-U04').ok, false);
+  assert.equal(guardarConfiguracion(actual, 'DEMO-U04').ok, false);
+  const antes = useBitacoraStore.getState().registros.length;
+  assert.ok(guardarConfiguracion({ ...actual, mesesAccesoPorDefecto: 9 }, 'DEMO-U04').ok);
+  assert.equal(erick().configuracion.mesesAccesoPorDefecto, 9);
+  assert.equal(useBitacoraStore.getState().registros.length, antes + 1);
+});
+
+prueba('E2 datos precargados abundantes', () => {
+  assert.ok(erick().eventosCalendario.length >= 16);
+  assert.ok(erick().asignacionesDocentes.length >= 9);
+  assert.ok(erick().observacionesDocentes.length >= 8);
+  assert.ok(useBitacoraStore.getState().registros.filter((registro) => ['docentes', 'calendario', 'configuracion_erick'].includes(registro.modulo)).length >= 8);
+});
+
 console.log(`\n${total} pruebas de ERICK superadas`);
```

### `src/datos/academico/personalErick.ts`

```diff
@@ -13,4 +13,16 @@
     correo: 'docente.ventas@correo.demo', telefono: '+593 99 000 005', documento: 'DEMO-DOC-005',
     pais: 'Ecuador', moneda: 'USD', idioma: 'es', fechaAlta: '2026-04-13', referenteId: null,
   },
+  {
+    id: 'DEMO-U06', codigo: 'DEMO-U06', nombres: 'Carolina', apellidos: 'Benítez Ojeda',
+    tipo: 'corporativo', perfil: 'evaluador', estado: 'activo',
+    correo: 'carolina.benitez@correo.demo', telefono: '+593 99 000 006', documento: 'DEMO-DOC-006',
+    pais: 'Ecuador', moneda: 'USD', idioma: 'es', fechaAlta: '2026-05-04', referenteId: null,
+  },
+  {
+    id: 'DEMO-U07', codigo: 'DEMO-U07', nombres: 'Ricardo', apellidos: 'Almeida Torres',
+    tipo: 'corporativo', perfil: 'evaluador', estado: 'activo',
+    correo: 'ricardo.almeida@correo.demo', telefono: '+593 99 000 007', documento: 'DEMO-DOC-007',
+    pais: 'Ecuador', moneda: 'USD', idioma: 'es', fechaAlta: '2026-06-15', referenteId: null,
+  },
 ];
```

### `src/datos/bitacoraInicial.ts`

```diff
@@ -1,4 +1,5 @@
 import type { Bitacora } from '../tipos/bitacora';
+import { bitacoraErickInicial } from './academico/erickInicial';
 
 type Fila = [string, string, string, string, string, string | null, unknown, unknown];
 
@@ -33,3 +34,4 @@
     fechaHora, actorId, accion, modulo, motivo, referenciaId, antes, despues,
   }))
   .reverse();
+bitacoraInicial.unshift(...[...bitacoraErickInicial].reverse());
```

### `src/datos/permisosIniciales.ts`

```diff
@@ -65,7 +65,7 @@
   const tabla = crearVacia();
   modulosErick.forEach((modulo) => { tabla[modulo] = [...acciones]; });
   tabla.reportes = ['consultar', 'exportar'];
-  tabla.integraciones = ['consultar'];
+  tabla.integraciones = ['consultar', 'exportar'];
   return tabla;
 }
 
```

### `src/rutas/Rutas.tsx`

```diff
@@ -57,6 +57,12 @@
 const LayoutErick = lazy(() => import('../layouts/LayoutErick'));
 const IntegracionErick = lazy(() => import('../paginas/corporativo/IntegracionErick'));
 const IntegracionMlm = lazy(() => import('../paginas/erick/IntegracionMlm'));
+const ResumenErick = lazy(() => import('../paginas/erick/ResumenErick'));
+const Estudiantes = lazy(() => import('../paginas/erick/Estudiantes'));
+const Docentes = lazy(() => import('../paginas/erick/Docentes'));
+const CalendarioErick = lazy(() => import('../paginas/erick/CalendarioErick'));
+const ConfiguracionErick = lazy(() => import('../paginas/erick/ConfiguracionErick'));
+const BitacoraAcademica = lazy(() => import('../paginas/erick/BitacoraAcademica'));
 const PantallaProvisionalLms = lazy(() => import('../paginas/campus/PantallaProvisionalLms'));
 const MisProgramas = lazy(() => import('../paginas/campus/MisProgramas'));
 const MiMembresia = lazy(() => import('../paginas/campus/MiMembresia'));
@@ -134,8 +140,14 @@
 ];
 
 const rutasErick: Array<{ ruta: string; modulo: ModuloPermiso; Pantalla: ComponentType }> = [
-  ...rutasAcademicas.map(({ ruta, modulo }) => ({ ruta: ruta.replace('academico/', ''), modulo, Pantalla: pantallasAcademicas[ruta] ?? PantallaProvisionalLms })),
+  ...rutasAcademicas.filter(({ ruta }) => ruta !== 'academico/resumen').map(({ ruta, modulo }) => ({ ruta: ruta.replace('academico/', ''), modulo, Pantalla: pantallasAcademicas[ruta] ?? PantallaProvisionalLms })),
   { ruta: 'integracion', modulo: 'academico', Pantalla: IntegracionMlm },
+  { ruta: 'resumen', modulo: 'academico', Pantalla: ResumenErick },
+  { ruta: 'estudiantes', modulo: 'academico', Pantalla: Estudiantes },
+  { ruta: 'docentes', modulo: 'docentes', Pantalla: Docentes },
+  { ruta: 'calendario', modulo: 'calendario', Pantalla: CalendarioErick },
+  { ruta: 'configuracion', modulo: 'configuracion_erick', Pantalla: ConfiguracionErick },
+  { ruta: 'bitacora', modulo: 'academico', Pantalla: BitacoraAcademica },
 ];
 
 export function Rutas() {
```

### `src/rutas/navegacionCampus.ts`

```diff
@@ -1,5 +1,6 @@
 import { Award, BookOpenCheck, ClipboardPen, FileBadge, History, Library, Microscope } from 'lucide-react';
 import { ChartNoAxesColumn, ListChecks, Plug, UserCheck, WalletCards } from 'lucide-react';
+import { CalendarDays, GraduationCap, ScrollText, Settings2, Users } from 'lucide-react';
 import type { GrupoNavegacion } from './navegacion';
 
 export const navegacionCampus: GrupoNavegacion[] = [
@@ -35,6 +36,14 @@
     ],
   },
   {
+    titulo: 'Comunidad',
+    items: [
+      { texto: 'Estudiantes', ruta: '/erick/estudiantes', icono: GraduationCap, modulo: 'academico' },
+      { texto: 'Docentes', ruta: '/erick/docentes', icono: Users, modulo: 'docentes' },
+      { texto: 'Calendario académico', ruta: '/erick/calendario', icono: CalendarDays, modulo: 'calendario' },
+    ],
+  },
+  {
     titulo: 'Estudiantes',
     items: [
       { texto: 'Matrículas', ruta: '/erick/matriculas', icono: UserCheck, modulo: 'matriculas' },
@@ -50,4 +59,11 @@
       { texto: 'Integración con MLM', ruta: '/erick/integracion', icono: Plug, modulo: 'academico' },
     ],
   },
+  {
+    titulo: 'Plataforma',
+    items: [
+      { texto: 'Configuración', ruta: '/erick/configuracion', icono: Settings2, modulo: 'configuracion_erick' },
+      { texto: 'Bitácora académica', ruta: '/erick/bitacora', icono: ScrollText, modulo: 'academico' },
+    ],
+  },
 ];
```

### `src/rutas/pantallas.ts`

```diff
@@ -57,7 +57,7 @@
   { patron: '/campus/certificados', numero: 'C8', nombre: 'Mis certificados', requerimientos: ['LMS-056'], fase: 8, descripcion: 'Certificados y diplomas en PDF con código QR y verificación.' },
   { patron: '/campus/membresia', numero: 'C9', nombre: 'Mi membresía', requerimientos: ['LMS-057', 'LMS-063'], fase: 8, descripcion: 'Plan, vencimiento y renovación de la membresía educativa.' },
   { patron: '/campus/mid', numero: 'C10', nombre: 'Mi MID', requerimientos: ['LMS-070', 'LMS-071'], fase: 8, descripcion: 'Solicitud, entrega y resultado de la sustentación MID.' },
-  { patron: '/erick/resumen', numero: 'P1', nombre: 'Resumen académico', requerimientos: ['LMS-088'], fase: 8, descripcion: 'Estadísticas de matrículas, avance, aprobación y documentos.' },
+  { patron: '/erick/resumen', numero: 'P1', nombre: 'Resumen educativo', requerimientos: ['LMS-088'], fase: 8, descripcion: 'Estadísticas de matrículas, avance, aprobación y documentos.' },
   { patron: '/erick/programas', numero: 'P2', nombre: 'Programas académicos', requerimientos: ['LMS-080'], fase: 8, descripcion: 'Cursos, diplomados y MID con su estado de publicación.' },
   { patron: '/erick/programas/:id', numero: 'P3', nombre: 'Editor de programa', requerimientos: ['LMS-081', 'LMS-082', 'LMS-084'], fase: 8, descripcion: 'Estructura, contenidos y reglas de aprobación con validación de horas.' },
   { patron: '/erick/preguntas', numero: 'P4', nombre: 'Banco de preguntas', requerimientos: ['LMS-083'], fase: 8, descripcion: 'Preguntas por tema y TIM con respuestas configuradas.' },
@@ -67,6 +67,11 @@
   { patron: '/erick/mid', numero: 'P8', nombre: 'Sustentaciones MID', requerimientos: ['LMS-072'], fase: 8, descripcion: 'Solicitudes MID y asignación de evaluadores.' },
   { patron: '/erick/reportes', numero: 'P9', nombre: 'Reportes académicos', requerimientos: ['LMS-089'], fase: 8, descripcion: 'Reportes de matrículas, notas y documentos en CSV y PDF.' },
   { patron: '/erick/integracion', numero: 'P10', nombre: 'Integración con MLM', requerimientos: ['LMS-090', 'LMS-091'], fase: 9, etiquetaFase: 'ERICK E1', descripcion: 'Eventos que ERICK S.A.C. envía al MLM por el conector.' },
+  { patron: '/erick/estudiantes', numero: 'P11', nombre: 'Estudiantes', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Directorio de estudiantes con avance, acceso, documentos y ficha académica.' },
+  { patron: '/erick/docentes', numero: 'P12', nombre: 'Docentes', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Alta de docentes, asignación de programas y carga académica.' },
+  { patron: '/erick/calendario', numero: 'P13', nombre: 'Calendario académico', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Exámenes finales, clases en vivo, entregas y sustentaciones de todos los programas.' },
+  { patron: '/erick/configuracion', numero: 'P14', nombre: 'Configuración ERICK', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Datos institucionales, texto del certificado y valores por defecto.' },
+  { patron: '/erick/bitacora', numero: 'P15', nombre: 'Bitácora académica', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Acciones registradas sobre la plataforma ERICK.' },
   { patron: '/corporativo/integracion-erick', numero: '25', nombre: 'Integración ERICK', requerimientos: ['MLM-065', 'LMS-091'], fase: 9, etiquetaFase: 'ERICK E1', descripcion: 'Consulta de ventas formativas, estado formativo de afiliados y eventos del conector.' },
   { patron: '/evaluador', numero: 'E', nombre: 'Bandeja de sustentaciones MID', requerimientos: ['LMS-073', 'LMS-075'], fase: 8, descripcion: 'Sustentaciones asignadas al evaluador con rúbrica de calificación.' },
   { patron: '/verificar', numero: 'V', nombre: 'Verificar documento', requerimientos: ['LMS-046'], fase: 8, descripcion: 'Verificación pública de certificados y diplomas por código.' },
```

### `src/store/persistencia.ts`

```diff
@@ -21,6 +21,7 @@
 import { usePersonasStore } from './usePersonasStore';
 import { useRedStore } from './useRedStore';
 import { useSesionStore } from './useSesionStore';
+import { useErickStore } from './useErickStore';
 
 type Tienda = UseBoundStore<StoreApi<object>>;
 type Instantanea = Record<string, Record<string, unknown>>;
@@ -36,6 +37,7 @@
   notificaciones: useNotificacionesStore, bitacora: useBitacoraStore, descuentos: useDescuentosStore,
   cobros: useCobrosStore,
   academico: useAcademicoStore, campus: useCampusStore,
+  erick: useErickStore,
 };
 
 const porPestana: Record<string, Tienda> = { sesion: useSesionStore, guia: useGuiaStore, carrito: useCarritoStore };
```

### `src/store/reiniciarDemo.ts`

```diff
@@ -17,6 +17,7 @@
 import { usePersonasStore } from './usePersonasStore';
 import { useRedStore } from './useRedStore';
 import { useSesionStore } from './useSesionStore';
+import { useErickStore } from './useErickStore';
 
 export function reiniciarDemo(): void {
   usePersonasStore.getState().reiniciar();
@@ -38,4 +39,5 @@
   useCobrosStore.getState().reiniciar();
   useAcademicoStore.getState().reiniciar();
   useCampusStore.getState().reiniciar();
+  useErickStore.getState().reiniciar();
 }
```

### `src/tipos/academico.ts`

```diff
@@ -104,3 +104,20 @@
 export type EstadoNota = 'pendiente' | 'aprobado' | 'desaprobado';
 
 export interface ResultadoNota { nota: number | null; estado: EstadoNota }
+
+export type TipoEventoCalendario = 'examen_final' | 'clase_en_vivo' | 'entrega' | 'sustentacion' | 'recordatorio';
+
+export interface EventoCalendario {
+  id: string; programaId: string; tipo: TipoEventoCalendario; titulo: string; descripcion: string;
+  fecha: string; horaInicio: string; horaFin: string | null; enlace: string | null;
+  creadoPor: string; estado: 'programado' | 'cancelado'; actualizado: string;
+}
+
+export interface AsignacionDocente { id: string; docenteId: string; programaId: string; desde: string; activa: boolean }
+
+export interface ObservacionDocente { id: string; docenteId: string; personaId: string; programaId: string; fecha: string; texto: string }
+
+export interface ConfiguracionErick {
+  razonSocial: string; ruc: string; direccion: string; correoContacto: string; telefono: string;
+  textoCertificado: string; mesesAccesoPorDefecto: number; intentosPorDefecto: number;
+}
```

