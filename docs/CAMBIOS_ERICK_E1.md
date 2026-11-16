# Cambios fase E1 - Separación y tema verde ERICK (15/11/2026)

Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, fase E1.

## Archivos nuevos

- `pruebas/erick.prueba.ts`
- `src/datos/academico/alumnosAmpliados.ts`
- `src/datos/academico/personalErick.ts`
- `src/hooks/useTemaErick.ts`
- `src/layouts/LayoutErick.tsx`
- `src/paginas/corporativo/IntegracionErick.tsx`
- `src/paginas/erick/IntegracionMlm.tsx`

## Archivos modificados (líneas con + son nuevas; con - las líneas cambiadas)

### `CLAUDE.md`

```diff
@@ -39,6 +39,13 @@
 
 - Mejoras del panel académico (completadas: reordenar temas y módulos, portada de video, extender acceso, gráficos de estadísticas, filtro de fechas en reportes, clases de YouTube en los temas, 10 alumnos precargados DEMO-L08 a L17 con sustentaciones MID en `datos/academico/alumnosCampus.ts`; pruebas `npm run prueba:panel`)
 
+## Plataforma ERICK S.A.C. independiente
+Fuente de verdad: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`.
+- E1. Separación y tema (completada: perfil `admin_educativo` DEMO-U04, docente DEMO-U05, módulos de permiso `calendario`, `docentes`, `contenidos`, `configuracion_erick`; el MLM solo consulta lo académico; tema verde pastel con `html[data-tema='erick']` en `src/index.css` y `hooks/useTemaErick.ts`; panel `/erick` con `layouts/LayoutErick.tsx`; Integración ERICK en `/corporativo/integracion-erick`; `/corporativo/academico/*` redirige; 30 alumnos más DEMO-L18 a L47 y 10 membresías en `datos/academico/alumnosAmpliados.ts`; pruebas `npm run prueba:erick`)
+- E2. Administración educativa completa (pendiente)
+- E3. Docente (pendiente)
+- E4. Calendario del estudiante y cierre (pendiente)
+
 Pruebas: `npm run pruebas`.
 
 Archivos clave: `src/tipos/academico.ts`, `src/datos/academico/*`, `src/motores/academico/*`, `src/store/useAcademicoStore.ts`, `src/store/useCampusStore.ts`, `src/layouts/LayoutCampus.tsx`, `src/rutas/navegacionCampus.ts`, `pruebas/academico.prueba.ts`.
```

### `package.json`

```diff
@@ -12,7 +12,8 @@
     "prueba:matriculas": "tsx pruebas/matriculas.prueba.ts",
     "prueba:campus": "tsx pruebas/campus.prueba.ts",
     "prueba:panel": "tsx pruebas/panel.prueba.ts",
-    "pruebas": "tsx pruebas/academico.prueba.ts && tsx pruebas/matriculas.prueba.ts && tsx pruebas/campus.prueba.ts && tsx pruebas/panel.prueba.ts"
+    "prueba:erick": "tsx pruebas/erick.prueba.ts",
+    "pruebas": "tsx pruebas/academico.prueba.ts && tsx pruebas/matriculas.prueba.ts && tsx pruebas/campus.prueba.ts && tsx pruebas/panel.prueba.ts && tsx pruebas/erick.prueba.ts"
   },
   "dependencies": {
     "date-fns": "^4.4.0",
```

### `pruebas/academico.prueba.ts`

```diff
@@ -142,12 +142,12 @@
   assert.equal(preguntasIniciales.filter((pregunta) => pregunta.ambito === 'tim').length, 72);
 });
 
-prueba('Datos: 29 documentos, 1 anulado y 1 reemitido', () => {
-  assert.equal(documentosIniciales.length, 29);
+prueba('Datos: 50 documentos, 1 anulado y 1 reemitido', () => {
+  assert.equal(documentosIniciales.length, 50);
   assert.equal(documentosIniciales.filter((documento) => documento.estado === 'anulado').length, 1);
   assert.equal(documentosIniciales.filter((documento) => documento.reemplazaA).length, 1);
-  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'diploma').length, 5);
-  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'constancia_mid').length, 2);
+  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'diploma').length, 8);
+  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'constancia_mid').length, 3);
 });
 
 prueba('Datos: estados precargados de los flujos', () => {
```

### `pruebas/panel.prueba.ts`

```diff
@@ -103,11 +103,11 @@
   assert.equal(alumnos.length, 10);
   assert.ok(alumnos.every((alumno) => campus().matriculas.some((matricula) => matricula.personaId === alumno.id && matricula.programaId === 'DEMO-DIP-01')));
   const asignadas = campus().sustentaciones.filter((item) => item.evaluadorId === 'DEMO-U03');
-  assert.equal(asignadas.filter((item) => item.estado === 'asignado').length, 3);
-  assert.equal(asignadas.filter((item) => item.estado === 'aprobado').length, 2);
+  assert.equal(asignadas.filter((item) => item.estado === 'asignado').length, 5);
+  assert.equal(asignadas.filter((item) => item.estado === 'aprobado').length, 3);
   assert.equal(asignadas.filter((item) => item.estado === 'desaprobado').length, 1);
-  assert.equal(campus().sustentaciones.filter((item) => item.estado === 'solicitado').length, 2);
-  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 2);
+  assert.equal(campus().sustentaciones.filter((item) => item.estado === 'solicitado').length, 4);
+  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 3);
   assert.ok(campus().sustentaciones.every((item) => midDisponible(item.personaId)));
   assert.equal(campus().sustentaciones.some((item) => item.personaId === 'DEMO-L03'), false);
   assert.ok(midDisponible('DEMO-L03'));
@@ -116,7 +116,7 @@
   const calificada = calificarSustentacion(pendiente.id, 'DEMO-U03', [16, 17, 15, 16], 'Trabajo bien sustentado y con propuesta aplicable.');
   assert.ok(calificada.ok, calificada.ok ? '' : calificada.error);
   assert.match(calificada.ok ? calificada.valor.constancia?.codigo ?? '' : '', /^ERK-MID-\d{4}-\d{5}$/);
-  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 3);
+  assert.equal(campus().documentos.filter((documento) => documento.tipo === 'constancia_mid').length, 4);
 });
 
 console.log(`\n${total} pruebas del panel académico superadas`);
```

### `src/componentes/campus/FichaAcademica.tsx`

```diff
@@ -10,9 +10,11 @@
 import { formatearFecha } from '../../utilidades/fechas';
 import { formatearNumero } from '../../utilidades/formatos';
 import { RegistroEventosLms } from './RegistroEventosLms';
+import { usePersonaSesion } from '../../store/useSesionStore';
 
 export function FichaAcademica({ personaId }: { personaId: string }) {
   const datos = useCampusPersona(personaId);
+  const administraErick = usePersonaSesion()?.perfil === 'admin_educativo';
   const documentos = useCampusStore((estado) => estado.documentos).filter((documento) => documento.personaId === personaId);
   return (
     <div className="flex flex-col gap-4">
@@ -36,7 +38,9 @@
             </ul>
           )}
           {datos.membresia && <p className="mt-3 text-[12.5px] text-texto-2">Membresía {datos.plan?.nombre ?? ''}: {datos.estadoMembresia ? estadosAcceso[datos.estadoMembresia].texto.toLowerCase() : ''}, vence el {formatearFecha(datos.membresia.vencimiento)}.</p>}
-          <Link to="/corporativo/academico/matriculas" className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-acento md:min-h-0">Gestionar matrículas</Link>
+          {administraErick
+            ? <Link to="/erick/matriculas" className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-acento md:min-h-0">Gestionar matrículas</Link>
+            : <p className="mt-3 text-[12.5px] text-texto-2">Las matrículas se gestionan en la plataforma ERICK S.A.C.</p>}
         </Tarjeta>
         <Tarjeta titulo="Certificados y diplomas" icono={Award}>
           {documentos.length === 0 ? <p className="text-[13px] text-texto-2">Sin documentos emitidos.</p> : (
```

### `src/componentes/demo/BuscadorGlobal.tsx`

```diff
@@ -21,7 +21,7 @@
   const [abierto, setAbierto] = useState(false);
   const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));
   const corporativo = esCorporativo(sesion);
-  const prefijo = corporativo ? '/corporativo' : '/afiliado';
+  const prefijo = corporativo ? '/corporativo' : sesion?.perfil === 'admin_educativo' ? '/erick' : '/afiliado';
 
   const resultados = useMemo<Resultado[]>(() => {
     const termino = normalizar(texto.trim());
```

### `src/componentes/demo/GuiaFlujos.tsx`

```diff
@@ -21,6 +21,7 @@
 const nombresRol: Record<string, string> = {
   'DEMO-U01': 'Superadministrador', 'DEMO-U02': 'Operador', 'DEMO-A01': 'Afiliado DEMO-A01', 'DEMO-C01': 'Cliente DEMO-C01',
   'DEMO-L01': 'Alumna DEMO-L01', 'DEMO-L03': 'Alumno DEMO-L03', 'DEMO-L06': 'Alumna DEMO-L06', 'DEMO-U03': 'Evaluador DEMO-U03',
+  'DEMO-U04': 'Administradora educativa DEMO-U04',
 };
 
 function useEstadoGuia(): EstadoGuia {
```

### `src/componentes/demo/sesionesDemo.ts`

```diff
@@ -1,4 +1,4 @@
-import { Briefcase, ClipboardPen, GraduationCap, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';
+import { Briefcase, ClipboardPen, GraduationCap, School, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';
 
 export interface SesionDemo { personaId: string; etiqueta: string; detalle: string; icono: LucideIcon; }
 
@@ -8,5 +8,6 @@
   { personaId: 'DEMO-A01', etiqueta: 'Afiliado', detalle: 'Mariana Vega - DEMO-A01', icono: Briefcase },
   { personaId: 'DEMO-C01', etiqueta: 'Cliente', detalle: 'Rosa Delgado - DEMO-C01', icono: ShoppingBag },
   { personaId: 'DEMO-L01', etiqueta: 'Alumno', detalle: 'Gabriela Ponce - DEMO-L01', icono: GraduationCap },
-  { personaId: 'DEMO-U03', etiqueta: 'Evaluador académico', detalle: 'Docente Evaluador - DEMO-U03', icono: ClipboardPen },
+  { personaId: 'DEMO-U04', etiqueta: 'Administrador educativo', detalle: 'ERICK S.A.C. - DEMO-U04', icono: School },
+  { personaId: 'DEMO-U03', etiqueta: 'Docente', detalle: 'Docente Evaluador - DEMO-U03', icono: ClipboardPen },
 ];
```

### `src/datos/academico/alumnosCampus.ts`

```diff
@@ -120,6 +120,32 @@
       resumen: 'Propone una metodología sencilla para fijar y revisar metas trimestrales en equipos de cinco a diez personas con seguimiento quincenal.',
       archivo: 'MID_Villacres_metas_trimestrales.pdf', fechaPropuesta: relativoHoy(15),
     },
+    {
+      personaId: 'DEMO-L20', titulo: 'Embudo de ventas digitales para emprendedores de catálogo',
+      resumen: 'Diseña y prueba durante ocho semanas un embudo de captación por WhatsApp y redes con veinte emprendedores, midiendo conversión por etapa.',
+      archivo: 'MID_Marquez_embudo_digital.pdf', fechaPropuesta: '2026-09-21', fechaAsignada: '2026-09-23',
+      notas: [18.5, 18, 17.5, 19], observaciones: 'Trabajo sobresaliente: datos completos, análisis riguroso y una propuesta replicable por otros equipos.',
+    },
+    {
+      personaId: 'DEMO-L21', titulo: 'Escucha activa y fidelización de clientes recurrentes',
+      resumen: 'Analiza si la práctica de escucha activa en la visita de seguimiento aumenta la recompra de clientes durante tres ciclos comerciales.',
+      archivo: 'MID_Pena_escucha_fidelizacion.pdf', fechaPropuesta: relativoHoy(3), fechaAsignada: relativoHoy(6),
+    },
+    {
+      personaId: 'DEMO-L22', titulo: 'Liderazgo femenino en redes de venta directa',
+      resumen: 'Recoge la experiencia de doce líderes de equipo y describe las prácticas que más influyen en el crecimiento sostenido de sus redes.',
+      archivo: 'MID_Jaramillo_liderazgo_femenino.pdf', fechaPropuesta: relativoHoy(9), fechaAsignada: relativoHoy(11),
+    },
+    {
+      personaId: 'DEMO-L23', titulo: 'Indicadores clave para el seguimiento semanal de un equipo comercial',
+      resumen: 'Propone un tablero de cinco indicadores semanales y su rutina de revisión para líderes que gestionan entre diez y veinte asesores.',
+      archivo: 'MID_Cordero_indicadores_semanales.pdf', fechaPropuesta: relativoHoy(18),
+    },
+    {
+      personaId: 'DEMO-L28', titulo: 'Capacitación por microlecciones para asesores nuevos',
+      resumen: 'Evalúa un plan de microlecciones diarias de cinco minutos durante el primer mes de los asesores y su efecto en las primeras ventas.',
+      archivo: 'MID_Villalba_microlecciones.pdf', fechaPropuesta: relativoHoy(21),
+    },
   ];
 }
 
```

### `src/datos/academico/formacionCampus.ts`

```diff
@@ -1,6 +1,7 @@
 import type { EstadoFormativo } from '../../tipos/formacion';
 import { relativoHoy } from './fechasCampus';
 import { formacionAlumnosCampus } from './alumnosCampus';
+import { formacionAlumnosAmpliados } from './alumnosAmpliados';
 
 const NIVEL_1 = 'Programa Liderazgo Comercial - Nivel 1';
 const NIVEL_2 = 'Programa Liderazgo Comercial - Nivel 2';
@@ -27,3 +28,4 @@
   id: `DEMO-FOR-${30 + indice}`, personaId, programaExterno, proveedor: 'ERICK S.A.C.', estado, fechaActualizacion,
 }));
 formacionCampus.push(...formacionAlumnosCampus);
+formacionCampus.push(...formacionAlumnosAmpliados);
```

### `src/datos/academico/matriculasIniciales.ts`

```diff
@@ -11,6 +11,7 @@
 import { preguntasIniciales } from './preguntas';
 import { programasIniciales } from './programas';
 import { generarMidInicial, semillasAlumnosCampus } from './alumnosCampus';
+import { eventosMembresiasAmpliadas, membresiasAmpliadas, semillasAlumnosAmpliados } from './alumnosAmpliados';
 
 interface SemillaMatricula {
   personaId: string; programaId: string; origen: OrigenMatricula; pedidoId?: string; membresiaId?: string;
@@ -50,6 +51,7 @@
   { personaId: 'DEMO-L07', programaId: 'DEMO-CUR-02', origen: 'compra', pedidoId: 'DEMO-P196', inicio: '2026-11-10' },
 ];
 semillas.push(...semillasAlumnosCampus);
+semillas.push(...semillasAlumnosAmpliados);
 
 const motivosOrigen: Record<OrigenMatricula, string> = {
   compra: 'Matrícula automática por pago confirmado',
@@ -231,3 +233,5 @@
 documentosIniciales.push(...midInicial.constancias);
 sustentacionesIniciales.push(...midInicial.sustentaciones);
 eventosIniciales.push(...midInicial.eventos.map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(eventosIniciales.length + indice + 1).padStart(3, '0')}` })));
+membresiasIniciales.push(...membresiasAmpliadas);
+eventosIniciales.push(...eventosMembresiasAmpliadas().map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(eventosIniciales.length + indice + 1).padStart(3, '0')}` })));
```

### `src/datos/academico/programas.ts`

```diff
@@ -14,25 +14,25 @@
     ...base, id: 'DEMO-DIP-01', codigo: 'DEMO-DIP-01', tipo: 'diplomado', nombre: 'Diplomado en Liderazgo y Gestión Comercial',
     descripcion: 'Programa de 120 horas que integra el Curso Liderazgo Comercial y el Curso Gestión de Equipos y Ventas. Al aprobar ambos cursos se emite el diploma.',
     horas: 120, productoId: 'DEMO-PRD-20', cursoIds: ['DEMO-CUR-01', 'DEMO-CUR-02'], moduloIds: [], midId: 'DEMO-MID-01',
-    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto, mesesAcceso: 12 }, colores: ['#0E3B4A', '#1F6F8B'],
+    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto, mesesAcceso: 12 }, colores: ['#1E4A37', '#3D8B66'],
   },
   {
     ...base, id: 'DEMO-CUR-01', codigo: 'DEMO-CUR-01', tipo: 'curso', nombre: 'Curso Liderazgo Comercial',
     descripcion: 'Fundamentos del liderazgo, comunicación efectiva y motivación del equipo comercial. 3 módulos de 20 horas.',
     horas: 60, productoId: 'DEMO-PRD-01', cursoIds: [], moduloIds: ['DEMO-MOD-01', 'DEMO-MOD-02', 'DEMO-MOD-03'], midId: null,
-    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#14305A', '#22B8D6'],
+    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#2E6B4F', '#4FA37B'],
   },
   {
     ...base, id: 'DEMO-CUR-02', codigo: 'DEMO-CUR-02', tipo: 'curso', nombre: 'Curso Gestión de Equipos y Ventas',
     descripcion: 'Planificación comercial, gestión de equipos e indicadores de seguimiento. 3 módulos de 20 horas.',
     horas: 60, productoId: 'DEMO-PRD-07', cursoIds: [], moduloIds: ['DEMO-MOD-04', 'DEMO-MOD-05', 'DEMO-MOD-06'], midId: null,
-    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#1E3A8A', '#6366F1'],
+    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#245C43', '#4C9A86'],
   },
   {
     ...base, id: 'DEMO-CUR-03', codigo: 'DEMO-CUR-03', tipo: 'curso', nombre: 'Curso Ventas Digitales',
     descripcion: 'Presencia digital, embudo de conversión y fidelización de clientes en canales digitales. 3 módulos de 20 horas.',
     horas: 60, productoId: 'DEMO-PRD-05', cursoIds: [], moduloIds: ['DEMO-MOD-07', 'DEMO-MOD-08', 'DEMO-MOD-09'], midId: null,
-    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#0F766E', '#14B8A6'],
+    incluidoEnMembresia: true, reglas: { ...reglasPorDefecto }, colores: ['#2F6F5E', '#5AAE8E'],
   },
   {
     ...base, id: 'DEMO-MID-01', codigo: 'DEMO-MID-01', tipo: 'mid', nombre: 'Módulo de Investigación y Desarrollo',
```

### `src/datos/guiaFlujos.ts`

```diff
@@ -146,14 +146,14 @@
     pasos: [
       { id: 'F12-1', texto: 'DEMO-A01 aprueba el TIM del módulo 3 del Curso Liderazgo Comercial.', ruta: '/campus/tim/DEMO-TIM-03', rolId: 'DEMO-A01', detectar: (estado) => documentoNuevo(estado, 'DEMO-A01', 'certificado') },
       { id: 'F12-2', texto: 'En Mi formación el programa figura aprobado por el conector y en Mi RUN el requisito se cumple.', ruta: '/afiliado/run', rolId: 'DEMO-A01', detectar: (estado) => estado.formacion.some((item) => item.personaId === 'DEMO-A01' && item.estado === 'aprobado') },
-      { id: 'F12-3', texto: 'En Integraciones, el registro de eventos del conector muestra curso aprobado y avance actualizado.', ruta: '/corporativo/integraciones', rolId: 'DEMO-U01' },
+      { id: 'F12-3', texto: 'En Integración ERICK, el registro de eventos del conector muestra curso aprobado y avance actualizado.', ruta: '/corporativo/integracion-erick', rolId: 'DEMO-U01' },
     ],
   },
   {
     id: 'F13', titulo: 'Sustentación MID', objetivo: 'La única calificación manual: evaluador asignado, rúbrica y constancia, sin cambiar el diploma.',
     pasos: [
       { id: 'F13-1', texto: 'DEMO-L03 (diploma emitido) solicita el MID con título, resumen y archivo.', ruta: '/campus/mid', rolId: 'DEMO-L03', detectar: (estado) => Boolean(sustentacionL03(estado)) },
-      { id: 'F13-2', texto: 'El superadministrador asigna a DEMO-U03 y la fecha.', ruta: '/corporativo/academico/mid', rolId: 'DEMO-U01', detectar: (estado) => Boolean(sustentacionL03(estado)?.evaluadorId) },
+      { id: 'F13-2', texto: 'La administradora educativa asigna a DEMO-U03 y la fecha.', ruta: '/erick/mid', rolId: 'DEMO-U04', detectar: (estado) => Boolean(sustentacionL03(estado)?.evaluadorId) },
       { id: 'F13-3', texto: 'El evaluador califica con la rúbrica y observaciones.', ruta: '/evaluador', rolId: 'DEMO-U03', detectar: (estado) => ['aprobado', 'desaprobado'].includes(sustentacionL03(estado)?.estado ?? '') },
       { id: 'F13-4', texto: 'DEMO-L03 ve su constancia MID; su diploma sigue igual.', ruta: '/campus/certificados', rolId: 'DEMO-L03', detectar: (estado) => documentoNuevo(estado, 'DEMO-L03', 'constancia_mid') },
     ],
```

### `src/datos/perfiles.ts`

```diff
@@ -5,5 +5,6 @@
   operador: 'Operador corporativo',
   afiliado: 'Afiliado / empresario',
   cliente_alumno: 'Cliente / alumno',
-  evaluador: 'Evaluador académico',
+  evaluador: 'Docente evaluador',
+  admin_educativo: 'Administrador educativo',
 };
```

### `src/datos/permisosIniciales.ts`

```diff
@@ -7,14 +7,18 @@
   'usuarios', 'catalogo', 'pedidos', 'redes', 'periodos', 'rangos', 'bonos', 'simulador',
   'liquidaciones', 'compliance', 'auditoria', 'reportes', 'integraciones', 'configuracion', 'permisos',
   'academico', 'matriculas', 'certificados',
+  'calendario', 'docentes', 'contenidos', 'configuracion_erick',
 ];
 
+export const modulosErick: ModuloPermiso[] = ['academico', 'matriculas', 'certificados', 'calendario', 'docentes', 'contenidos', 'configuracion_erick'];
+
 export const nombresModulos: Record<ModuloPermiso, string> = {
   usuarios: 'Usuarios', catalogo: 'Catálogo', pedidos: 'Pedidos', redes: 'Redes', periodos: 'Períodos',
   rangos: 'Rangos', bonos: 'Bonos', simulador: 'Simulador', liquidaciones: 'Liquidaciones',
   compliance: 'Compliance', auditoria: 'Auditoría', reportes: 'Reportes', integraciones: 'Integraciones',
   configuracion: 'Configuración', permisos: 'Permisos',
   academico: 'Académico', matriculas: 'Matrículas', certificados: 'Certificados',
+  calendario: 'Calendario académico', docentes: 'Docentes', contenidos: 'Contenidos y clases', configuracion_erick: 'Configuración ERICK',
 };
 
 export const nombresAcciones: Record<AccionPermiso, string> = {
@@ -51,15 +55,33 @@
 function crearEvaluador(): Record<ModuloPermiso, AccionPermiso[]> {
   const tabla = crearVacia();
   tabla.academico = ['consultar', 'aprobar'];
+  tabla.contenidos = ['consultar', 'editar'];
+  tabla.calendario = ['consultar', 'crear', 'editar'];
+  tabla.reportes = ['consultar', 'exportar'];
+  return tabla;
+}
+
+function crearAdminEducativo(): Record<ModuloPermiso, AccionPermiso[]> {
+  const tabla = crearVacia();
+  modulosErick.forEach((modulo) => { tabla[modulo] = [...acciones]; });
+  tabla.reportes = ['consultar', 'exportar'];
+  tabla.integraciones = ['consultar'];
+  return tabla;
+}
+
+function limitarErickEnMlm(tabla: Record<ModuloPermiso, AccionPermiso[]>): Record<ModuloPermiso, AccionPermiso[]> {
+  (['academico', 'matriculas', 'certificados'] as ModuloPermiso[]).forEach((modulo) => { tabla[modulo] = ['consultar']; });
+  (['calendario', 'docentes', 'contenidos', 'configuracion_erick'] as ModuloPermiso[]).forEach((modulo) => { tabla[modulo] = []; });
   return tabla;
 }
 
 export function crearPermisosIniciales(): TablaPermisos {
   return {
-    superadministrador: crearSuperadministrador(),
-    operador: crearOperador(),
+    superadministrador: limitarErickEnMlm(crearSuperadministrador()),
+    operador: limitarErickEnMlm(crearOperador()),
     afiliado: crearVacia(),
     cliente_alumno: crearVacia(),
     evaluador: crearEvaluador(),
+    admin_educativo: crearAdminEducativo(),
   };
 }
```

### `src/datos/personas.ts`

```diff
@@ -1,6 +1,8 @@
 import type { Persona } from '../tipos/persona';
 import { personasAmpliadas } from './ampliacion';
 import { alumnosCampus } from './academico/alumnosCampus';
+import { personalErick } from './academico/personalErick';
+import { alumnosAmpliados } from './academico/alumnosAmpliados';
 
 const personasFase1: Persona[] = [
   {
@@ -146,4 +148,4 @@
   },
 ];
 
-export const personasIniciales: Persona[] = [...personasFase1, ...personasRed, ...personasAmpliadas, ...alumnosCampus];
+export const personasIniciales: Persona[] = [...personasFase1, ...personasRed, ...personasAmpliadas, ...alumnosCampus, ...personalErick, ...alumnosAmpliados];
```

### `src/index.css`

```diff
@@ -138,3 +138,47 @@
 [role='tablist']::-webkit-scrollbar { display: none; }
 
 .fondo-menu-lateral.fondo-menu-campus { background: linear-gradient(180deg, #0E3B4A 0%, #0F2547 100%); }
+
+html[data-tema='erick'] {
+  --color-primario: #2E6B4F;
+  --color-primario-hover: #255A42;
+  --color-primario-suave: #E6F4EC;
+  --color-primario-profundo: #1E4A37;
+  --color-acento: #2F7D5B;
+  --color-acento-suave: #DDF1E5;
+  --color-acento-brillo: #8FD3AE;
+  --color-fondo: #F3FAF5;
+  --color-borde: #D6EADD;
+}
+
+html[data-tema='erick'] .text-\[\#155E75\] { color: #245C43; }
+html[data-tema='erick'] .accent-\[\#0E7490\] { accent-color: #2F7D5B; }
+html[data-tema='erick'] .text-\[\#B9D4E8\] { color: #CDEBD9; }
+html[data-tema='erick'] .border-\[\#0E3B4A\] { border-color: #2E6B4F; }
+html[data-tema='erick'] .bg-\[\#0E3B4A\] { background-color: #2E6B4F; }
+html[data-tema='erick'] .text-\[\#0E3B4A\] { color: #1E4A37; }
+html[data-tema='erick'] circle[stroke='#0E7490'] { stroke: #2F7D5B; }
+html[data-tema='erick'] path[fill='#0E7490'] { fill: #2F7D5B; }
+html[data-tema='erick'] .fondo-calificacion { background: radial-gradient(120% 140% at 100% 0%, #3D8B66 0%, #2E6B4F 45%, #1E4A37 100%); }
+
+.fondo-menu-lateral.fondo-menu-campus {
+  background: linear-gradient(180deg, #EAF6EE 0%, #D4ECDD 100%);
+  color: #1E4A37;
+  border-right: 1px solid #C7E3D2;
+}
+.fondo-menu-campus .text-\[\#6F86AA\] { color: #43614F; }
+.fondo-menu-campus .text-\[\#8FA3C2\] { color: #43614F; }
+.fondo-menu-campus .text-\[\#C7D3E6\] { color: #1E4A37; }
+.fondo-menu-campus .text-white { color: #1E4A37; }
+.fondo-menu-campus .hover\:text-white:hover { color: #1E4A37; }
+.fondo-menu-campus .hover\:bg-white\/5:hover { background-color: rgba(46, 107, 79, 0.09); }
+.fondo-menu-campus .hover\:bg-white\/10:hover { background-color: rgba(46, 107, 79, 0.12); }
+.fondo-menu-campus .bg-white\/\[0\.06\] { background-color: rgba(255, 255, 255, 0.7); box-shadow: 0 1px 2px rgba(30, 74, 55, 0.08); }
+.fondo-menu-campus .border-white\/10 { border-color: rgba(30, 74, 55, 0.18); }
+.fondo-menu-campus .bg-white\/10 { background-color: #2E6B4F; color: #FFFFFF; box-shadow: none; }
+.fondo-menu-campus .bg-white\/10 svg { color: #FFFFFF; }
+.fondo-menu-campus .from-\[\#E2C46E\] { --tw-gradient-from: #8FD3AE; }
+.fondo-menu-campus .to-\[\#B8862B\] { --tw-gradient-to: #2F7D5B; }
+.fondo-menu-campus, .fondo-menu-campus * { scrollbar-color: rgba(30, 74, 55, 0.25) transparent; }
+.fondo-menu-campus *::-webkit-scrollbar-thumb { background: rgba(30, 74, 55, 0.25); background-clip: padding-box; }
+html[data-tema='erick'] [role='progressbar'] > span[style*='rgb(14, 116, 144)'] { background: linear-gradient(90deg, #2F7D5B, #8FD3AE) !important; }
```

### `src/layouts/LayoutCampus.tsx`

```diff
@@ -5,9 +5,11 @@
 import { rutaInicioPorPerfil, usePersonaSesion } from '../store/useSesionStore';
 import { LayoutPanel } from './compartidos/LayoutPanel';
 import { revisarVencimientos } from '../servicios/matriculas';
+import { useTemaErick } from '../hooks/useTemaErick';
 
 export default function LayoutCampus() {
   const persona = usePersonaSesion();
+  useTemaErick();
   const grupos = useMemo<GrupoNavegacion[]>(() => [
     ...navegacionCampus,
     { titulo: 'MLM 2027', items: [{ texto: 'Volver a MLM 2027', ruta: rutaInicioPorPerfil(persona?.perfil), icono: ArrowLeftCircle }] },
```

### `src/layouts/LayoutEvaluador.tsx`

```diff
@@ -1,6 +1,8 @@
 import { navegacionEvaluador } from '../rutas/navegacionCampus';
 import { LayoutPanel } from './compartidos/LayoutPanel';
+import { useTemaErick } from '../hooks/useTemaErick';
 
 export default function LayoutEvaluador() {
-  return <LayoutPanel grupos={navegacionEvaluador} subtitulo="Evaluación académica" contexto="Campus ERICK · Evaluador" marca="campus" />;
+  useTemaErick();
+  return <LayoutPanel grupos={navegacionEvaluador} subtitulo="Evaluación académica" contexto="Campus ERICK · Docente" marca="campus" />;
 }
```

### `src/layouts/compartidos/LayoutPanel.tsx`

```diff
@@ -13,7 +13,7 @@
   grupos: GrupoNavegacion[];
   subtitulo: string;
   contexto: string;
-  marca?: 'mlm' | 'campus';
+  marca?: 'mlm' | 'campus' | 'erick';
 }
 
 const claveMenuOculto = 'mlm2027-menu-oculto';
```

### `src/layouts/compartidos/Logo.tsx`

```diff
@@ -6,11 +6,12 @@
   soloIconoEnMovil?: boolean;
   oscuro?: boolean;
   className?: string;
-  marca?: 'mlm' | 'campus';
+  marca?: 'mlm' | 'campus' | 'erick';
 }
 
 export function Logo({ subtitulo, oscuro = false, soloIconoEnMovil = false, className, marca = 'mlm' }: PropsLogo) {
-  const esCampus = marca === 'campus';
+  const esCampus = marca === 'campus' || marca === 'erick';
+  const titulo = marca === 'erick' ? 'ERICK S.A.C.' : esCampus ? 'Campus ERICK' : 'MLM 2027';
   const IconoMarca = esCampus ? GraduationCap : Network;
   return (
     <span className={unirClases('flex items-center gap-2.5', className)}>
@@ -18,7 +19,7 @@
         <IconoMarca className="size-[18px]" aria-hidden />
       </span>
       <span className={unirClases('min-w-0 leading-tight', soloIconoEnMovil && 'hidden min-[420px]:block')}>
-        <span className={unirClases('block text-[17px] font-extrabold tracking-tight', oscuro ? 'text-white' : 'text-primario')}>{esCampus ? 'Campus ERICK' : 'MLM 2027'}</span>
+        <span className={unirClases('block text-[17px] font-extrabold tracking-tight', oscuro ? 'text-white' : 'text-primario')}>{titulo}</span>
         {subtitulo && <span className={unirClases('block truncate text-[11px] font-medium', oscuro ? 'text-[#8FA3C2]' : 'text-texto-2')}>{subtitulo}</span>}
       </span>
     </span>
```

### `src/layouts/compartidos/MenuLateral.tsx`

```diff
@@ -16,7 +16,7 @@
   alNavegar?: () => void;
   alCerrar?: () => void;
   iconoCerrar?: LucideIcon;
-  marca?: 'mlm' | 'campus';
+  marca?: 'mlm' | 'campus' | 'erick';
 }
 
 const claseItem = 'flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13.5px] font-medium transition-colors md:min-h-10';
@@ -29,7 +29,7 @@
   const permitido = (item: ItemNavegacion) => !item.modulo || !persona || tabla[persona.perfil][item.modulo].includes('consultar');
 
   return (
-    <nav aria-label="Menú principal" className={unirClases('fondo-menu-lateral flex h-full flex-col px-3.5 pb-4 pt-5 text-[#C7D3E6]', marca === 'campus' && 'fondo-menu-campus')}>
+    <nav aria-label="Menú principal" className={unirClases('fondo-menu-lateral flex h-full flex-col px-3.5 pb-4 pt-5 text-[#C7D3E6]', (marca === 'campus' || marca === 'erick') && 'fondo-menu-campus')}>
       <div className="flex items-start gap-2 pb-4 pl-2.5">
         <div className="min-w-0 flex-1"><Logo subtitulo={subtitulo} oscuro marca={marca} /></div>
         {alCerrar && <BotonIcono icono={iconoCerrar} etiqueta="Ocultar menú" oscuro onClick={alCerrar} className="shrink-0" />}
```

### `src/paginas/corporativo/Permisos.tsx`

```diff
@@ -12,7 +12,7 @@
 import type { PerfilAcceso } from '../../tipos/persona';
 import { unirClases } from '../../utilidades/clases';
 
-const perfiles: PerfilAcceso[] = ['operador', 'superadministrador', 'afiliado', 'cliente_alumno', 'evaluador'];
+const perfiles: PerfilAcceso[] = ['operador', 'superadministrador', 'afiliado', 'cliente_alumno', 'evaluador', 'admin_educativo'];
 
 export default function Permisos() {
   const tabla = usePermisosStore((estado) => estado.tabla);
@@ -21,6 +21,7 @@
   const [perfil, setPerfil] = useState<PerfilAcceso>('operador');
   const bloqueado = perfil === 'superadministrador';
   const sinArea = perfil === 'afiliado' || perfil === 'cliente_alumno';
+  const gestionErick = perfil === 'evaluador' || perfil === 'admin_educativo';
 
   const alternar = (modulo: (typeof modulos)[number], accion: (typeof acciones)[number]) => {
     const resultado = alternarPermiso(perfil, modulo, accion, actor?.id ?? 'DEMO-U01');
@@ -33,7 +34,8 @@
       <Pestanas etiqueta="Perfil" activa={perfil} alCambiar={(valor) => setPerfil(valor as PerfilAcceso)} pestanas={perfiles.map((item) => ({ id: item, texto: nombresPerfiles[item], icono: item === 'superadministrador' ? Lock : KeyRound }))} />
       <div className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
         <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
-        {bloqueado ? 'El superadministrador conserva todos los permisos; la matriz se muestra solo como referencia.'
+        {gestionErick ? 'Este perfil pertenece a la plataforma ERICK S.A.C. y se administra allí; aquí se muestra solo como referencia.'
+          : bloqueado ? 'El superadministrador conserva todos los permisos del MLM; la administración académica corresponde a ERICK S.A.C. y aquí solo se consulta.'
           : sinArea ? 'Este perfil no accede al área corporativa: solo ve su propia información. Los permisos aquí no le abren módulos corporativos.'
             : 'Los cambios se aplican de inmediato a las sesiones con este perfil y quedan registrados en la bitácora. Los módulos sin "consultar" aparecen con candado en el menú.'}
       </div>
@@ -59,9 +61,9 @@
                           role="checkbox"
                           aria-checked={activo}
                           aria-label={`${accion} en ${nombresModulos[modulo]}`}
-                          disabled={bloqueado}
+                          disabled={bloqueado || gestionErick}
                           onClick={() => alternar(modulo, accion)}
-                          className={unirClases('mx-auto grid size-11 place-items-center rounded-lg border transition-colors md:size-9', activo ? 'border-acento bg-acento text-white' : 'border-borde bg-superficie text-transparent hover:border-texto-3', bloqueado && 'opacity-70')}
+                          className={unirClases('mx-auto grid size-11 place-items-center rounded-lg border transition-colors md:size-9', activo ? 'border-acento bg-acento text-white' : 'border-borde bg-superficie text-transparent hover:border-texto-3', (bloqueado || gestionErick) && 'opacity-70')}
                         >
                           <Check className="size-4" aria-hidden />
                         </button>
```

### `src/paginas/corporativo/academico/EditorPrograma.tsx`

```diff
@@ -121,7 +121,7 @@
 
   return (
     <div className="flex flex-col gap-5">
-      <Link to="/corporativo/academico/programas" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />Programas</Link>
+      <Link to="/erick/programas" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento md:min-h-0"><ArrowLeft className="size-4" aria-hidden />Programas</Link>
       <div className="flex flex-wrap items-start justify-between gap-3">
         <div>
           <p className="cifra text-xs text-texto-3">{programa.codigo}</p>
@@ -146,7 +146,7 @@
         <Tarjeta titulo="Cursos del diplomado" icono={Layers}>
           <ul className="flex flex-col gap-2">{programa.cursoIds.map((cursoId, indice) => {
             const curso = datos.programas.find((item) => item.id === cursoId);
-            return <li key={cursoId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]"><Link to={`/corporativo/academico/programas/${cursoId}`} className="font-semibold hover:text-acento">Curso {indice + 1}: {curso?.nombre ?? cursoId}</Link><span className="cifra">{curso?.horas ?? 0} h</span></li>;
+            return <li key={cursoId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fondo px-3 py-2.5 text-[13px]"><Link to={`/erick/programas/${cursoId}`} className="font-semibold hover:text-acento">Curso {indice + 1}: {curso?.nombre ?? cursoId}</Link><span className="cifra">{curso?.horas ?? 0} h</span></li>;
           })}</ul>
           <p className="mt-3 text-[12.5px] text-texto-2">Nota del diplomado: promedio simple de los dos cursos. El MID ({programa.midId ?? 'sin MID'}) es opcional y no altera el diploma.</p>
         </Tarjeta>
```

### `src/paginas/corporativo/academico/MembresiasAcademicas.tsx`

```diff
@@ -40,7 +40,7 @@
   ];
   return (
     <div className="flex flex-col gap-5">
-      <Tarjeta titulo="Planes de membresía" subtitulo="Cada plan es un producto del catálogo: su precio y descuentos se gestionan en Productos." icono={WalletCards}>
+      <Tarjeta titulo="Planes de membresía" subtitulo="Cada plan es un producto del catálogo: su precio, VP, VC y descuentos se gestionan en el catálogo del MLM." icono={WalletCards}>
         <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
           {datos.academico.planes.map((plan) => {
             const producto = productos.find((item) => item.id === plan.productoId);
```

### `src/paginas/corporativo/academico/ProgramasAcademicos.tsx`

```diff
@@ -86,7 +86,7 @@
   };
   const columnas: ColumnaTabla<Programa>[] = [
     { clave: 'codigo', titulo: 'Código', render: (fila) => <span className="cifra text-xs">{fila.codigo}</span>, valorOrden: (fila) => fila.codigo },
-    { clave: 'nombre', titulo: 'Programa', principalEnMovil: true, render: (fila) => <Link to={`/corporativo/academico/programas/${fila.id}`} className="font-semibold text-texto hover:text-acento">{fila.nombre}</Link>, valorOrden: (fila) => fila.nombre },
+    { clave: 'nombre', titulo: 'Programa', principalEnMovil: true, render: (fila) => <Link to={`/erick/programas/${fila.id}`} className="font-semibold text-texto hover:text-acento">{fila.nombre}</Link>, valorOrden: (fila) => fila.nombre },
     { clave: 'tipo', titulo: 'Tipo', render: (fila) => `${nombresTipoPrograma[fila.tipo]} · ${fila.horas} h` },
     { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={tonosEstado[fila.estado]}>{fila.estado}</Insignia> },
     { clave: 'matriculas', titulo: 'Matrículas', alinear: 'derecha', render: (fila) => <span className="cifra">{matriculas.filter((matricula) => matricula.programaId === fila.id).length}</span> },
@@ -108,7 +108,7 @@
         accionesCabecera={<ConPermiso modulo="academico" accion="crear"><Boton tamano="sm" icono={Plus} onClick={() => setNuevo(true)}>Nuevo programa</Boton></ConPermiso>}
         accionesFila={(fila) => (
           <div className="flex flex-wrap justify-end gap-1.5">
-            <Link to={`/corporativo/academico/programas/${fila.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-acento md:min-h-9">{puedeEditar ? <FilePen className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}{puedeEditar ? 'Editar' : 'Ver'}</Link>
+            <Link to={`/erick/programas/${fila.id}`} className="inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-acento md:min-h-9">{puedeEditar ? <FilePen className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}{puedeEditar ? 'Editar' : 'Ver'}</Link>
             {puedeEditar && fila.estado === 'borrador' && <Boton tamano="sm" variante="secundario" icono={Upload} onClick={() => cambiar(fila, 'publicado')}>Publicar</Boton>}
             {puedeEditar && fila.estado === 'publicado' && <Boton tamano="sm" variante="fantasma" icono={Archive} onClick={() => cambiar(fila, 'archivado')}>Archivar</Boton>}
           </div>
```

### `src/paginas/corporativo/academico/ResumenAcademico.tsx`

```diff
@@ -50,7 +50,7 @@
             {porPrograma.map((fila) => (
               <li key={fila.programa.id} className="flex flex-col gap-1.5">
                 <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
-                  <Link to={`/corporativo/academico/programas/${fila.programa.id}`} className="font-semibold text-texto hover:text-acento">{fila.programa.nombre}</Link>
+                  <Link to={`/erick/programas/${fila.programa.id}`} className="font-semibold text-texto hover:text-acento">{fila.programa.nombre}</Link>
                   <span className="flex items-center gap-2"><Insignia tono="neutra">{nombresTipoPrograma[fila.programa.tipo]}</Insignia><Insignia tono={fila.programa.estado === 'publicado' ? 'exito' : 'neutra'}>{fila.programa.estado}</Insignia></span>
                 </div>
                 <BarraProgreso valor={fila.avance} maximo={100} etiqueta={`Avance promedio de ${fila.programa.nombre}`} />
@@ -59,7 +59,7 @@
             ))}
           </ul>
         </Tarjeta>
-        <Tarjeta titulo="Actividad reciente del conector" icono={Activity} acciones={<Link to="/corporativo/integraciones" className="text-[13px] font-semibold text-acento">Ver registro</Link>}>
+        <Tarjeta titulo="Actividad reciente del conector" icono={Activity} acciones={<Link to="/erick/integracion" className="text-[13px] font-semibold text-acento">Ver registro</Link>}>
           <ul className="flex flex-col gap-2">
             {recientes.map((evento) => (
               <li key={evento.id} className="rounded-xl bg-fondo px-3 py-2 text-[12.5px]">
```

### `src/paginas/publico/VerificarDocumento.tsx`

```diff
@@ -11,12 +11,14 @@
 import { unirClases } from '../../utilidades/clases';
 import { formatearFecha } from '../../utilidades/fechas';
 import { formatearNumero } from '../../utilidades/formatos';
+import { useTemaErick } from '../../hooks/useTemaErick';
 
 function enmascarar(texto: string): string {
   return texto.length <= 4 ? '****' : `${'*'.repeat(texto.length - 4)}${texto.slice(-4)}`;
 }
 
 export default function VerificarDocumento() {
+  useTemaErick();
   const { codigo } = useParams();
   const navegar = useNavigate();
   const [texto, setTexto] = useState(codigo ?? '');
```

### `src/rutas/Rutas.tsx`

```diff
@@ -54,6 +54,9 @@
 const MiFormacion = lazy(() => import('../paginas/afiliado/MiFormacion'));
 const LayoutCampus = lazy(() => import('../layouts/LayoutCampus'));
 const LayoutEvaluador = lazy(() => import('../layouts/LayoutEvaluador'));
+const LayoutErick = lazy(() => import('../layouts/LayoutErick'));
+const IntegracionErick = lazy(() => import('../paginas/corporativo/IntegracionErick'));
+const IntegracionMlm = lazy(() => import('../paginas/erick/IntegracionMlm'));
 const PantallaProvisionalLms = lazy(() => import('../paginas/campus/PantallaProvisionalLms'));
 const MisProgramas = lazy(() => import('../paginas/campus/MisProgramas'));
 const MiMembresia = lazy(() => import('../paginas/campus/MiMembresia'));
@@ -106,6 +109,7 @@
   productos: Productos, arboles: Arboles, periodos: Periodos, rangos: Rangos,
   bonos: ConfiguracionBonos, simulador: Simulador, liquidaciones: Liquidaciones, compliance: Compliance,
   auditoria: Auditoria, reportes: Reportes, integraciones: Integraciones, balance: BalanceFinanciero, retiros: Retiros,
+  'integracion-erick': IntegracionErick,
 };
 
 const rutasCorporativo: Array<{ ruta: string; modulo?: ModuloPermiso }> = [
@@ -126,6 +130,12 @@
   { ruta: 'balance', modulo: 'reportes' },
   { ruta: 'retiros', modulo: 'liquidaciones' },
   { ruta: 'integraciones', modulo: 'integraciones' },
+  { ruta: 'integracion-erick', modulo: 'academico' },
+];
+
+const rutasErick: Array<{ ruta: string; modulo: ModuloPermiso; Pantalla: ComponentType }> = [
+  ...rutasAcademicas.map(({ ruta, modulo }) => ({ ruta: ruta.replace('academico/', ''), modulo, Pantalla: pantallasAcademicas[ruta] ?? PantallaProvisionalLms })),
+  { ruta: 'integracion', modulo: 'academico', Pantalla: IntegracionMlm },
 ];
 
 export function Rutas() {
@@ -179,11 +189,14 @@
               />
             );
           })}
-          <Route path="academico" element={<Navigate to="resumen" replace />} />
-          {rutasAcademicas.map(({ ruta, modulo }) => {
-            const Pantalla = pantallasAcademicas[ruta] ?? PantallaProvisionalLms;
-            return <Route key={ruta} path={ruta} element={<RutaPorPermiso modulo={modulo}><Pantalla /></RutaPorPermiso>} />;
-          })}
+          <Route path="academico/*" element={<Navigate to="/corporativo/integracion-erick" replace />} />
+        </Route>
+
+        <Route path="/erick" element={<RutaPorPerfil perfiles={['admin_educativo']}><LayoutErick /></RutaPorPerfil>}>
+          <Route index element={<Navigate to="resumen" replace />} />
+          {rutasErick.map(({ ruta, modulo, Pantalla }) => (
+            <Route key={ruta} path={ruta} element={<RutaPorPermiso modulo={modulo}><Pantalla /></RutaPorPermiso>} />
+          ))}
         </Route>
 
         <Route path="/campus" element={<RutaPorPerfil perfiles={['cliente_alumno', 'afiliado']}><LayoutCampus /></RutaPorPerfil>}>
```

### `src/rutas/navegacion.ts`

```diff
@@ -3,7 +3,7 @@
   LayoutDashboard, Network, Package, Plug, Receipt, ScrollText, ShieldAlert, ShoppingCart, SlidersHorizontal,
   Calculator, TrendingUp, Users, Workflow, Scale, Landmark, Banknote, type LucideIcon,
 } from 'lucide-react';
-import { BookOpenCheck, FileBadge, Library, ListChecks, Microscope, School, UserCheck, WalletCards, ChartNoAxesColumn } from 'lucide-react';
+import { School } from 'lucide-react';
 import type { ModuloPermiso } from '../tipos/permisos';
 
 export interface ItemNavegacion {
@@ -81,16 +81,9 @@
     ],
   },
   {
-    titulo: 'Académico',
+    titulo: 'ERICK S.A.C.',
     items: [
-      { texto: 'Resumen académico', ruta: '/corporativo/academico/resumen', icono: ChartNoAxesColumn, modulo: 'academico' },
-      { texto: 'Programas', ruta: '/corporativo/academico/programas', icono: Library, modulo: 'academico' },
-      { texto: 'Banco de preguntas', ruta: '/corporativo/academico/preguntas', icono: ListChecks, modulo: 'academico' },
-      { texto: 'Matrículas', ruta: '/corporativo/academico/matriculas', icono: UserCheck, modulo: 'matriculas' },
-      { texto: 'Membresías', ruta: '/corporativo/academico/membresias', icono: WalletCards, modulo: 'matriculas' },
-      { texto: 'Certificados', ruta: '/corporativo/academico/certificados', icono: FileBadge, modulo: 'certificados' },
-      { texto: 'Sustentaciones MID', ruta: '/corporativo/academico/mid', icono: Microscope, modulo: 'academico' },
-      { texto: 'Reportes académicos', ruta: '/corporativo/academico/reportes', icono: BookOpenCheck, modulo: 'academico' },
+      { texto: 'Integración ERICK', ruta: '/corporativo/integracion-erick', icono: School, modulo: 'academico' },
     ],
   },
   {
```

### `src/rutas/navegacionCampus.ts`

```diff
@@ -1,4 +1,5 @@
 import { Award, BookOpenCheck, ClipboardPen, FileBadge, History, Library, Microscope } from 'lucide-react';
+import { ChartNoAxesColumn, ListChecks, Plug, UserCheck, WalletCards } from 'lucide-react';
 import type { GrupoNavegacion } from './navegacion';
 
 export const navegacionCampus: GrupoNavegacion[] = [
@@ -23,3 +24,30 @@
 export const navegacionEvaluador: GrupoNavegacion[] = [
   { titulo: 'Evaluación académica', items: [{ texto: 'Sustentaciones MID', ruta: '/evaluador', icono: ClipboardPen }] },
 ];
+
+export const navegacionErick: GrupoNavegacion[] = [
+  { titulo: 'General', items: [{ texto: 'Resumen educativo', ruta: '/erick/resumen', icono: ChartNoAxesColumn, modulo: 'academico' }] },
+  {
+    titulo: 'Oferta académica',
+    items: [
+      { texto: 'Programas', ruta: '/erick/programas', icono: Library, modulo: 'academico' },
+      { texto: 'Banco de preguntas', ruta: '/erick/preguntas', icono: ListChecks, modulo: 'academico' },
+    ],
+  },
+  {
+    titulo: 'Estudiantes',
+    items: [
+      { texto: 'Matrículas', ruta: '/erick/matriculas', icono: UserCheck, modulo: 'matriculas' },
+      { texto: 'Membresías', ruta: '/erick/membresias', icono: WalletCards, modulo: 'matriculas' },
+      { texto: 'Certificados', ruta: '/erick/certificados', icono: FileBadge, modulo: 'certificados' },
+      { texto: 'Sustentaciones MID', ruta: '/erick/mid', icono: Microscope, modulo: 'academico' },
+    ],
+  },
+  {
+    titulo: 'Análisis',
+    items: [
+      { texto: 'Reportes académicos', ruta: '/erick/reportes', icono: BookOpenCheck, modulo: 'academico' },
+      { texto: 'Integración con MLM', ruta: '/erick/integracion', icono: Plug, modulo: 'academico' },
+    ],
+  },
+];
```

### `src/rutas/pantallas.ts`

```diff
@@ -57,15 +57,17 @@
   { patron: '/campus/certificados', numero: 'C8', nombre: 'Mis certificados', requerimientos: ['LMS-056'], fase: 8, descripcion: 'Certificados y diplomas en PDF con código QR y verificación.' },
   { patron: '/campus/membresia', numero: 'C9', nombre: 'Mi membresía', requerimientos: ['LMS-057', 'LMS-063'], fase: 8, descripcion: 'Plan, vencimiento y renovación de la membresía educativa.' },
   { patron: '/campus/mid', numero: 'C10', nombre: 'Mi MID', requerimientos: ['LMS-070', 'LMS-071'], fase: 8, descripcion: 'Solicitud, entrega y resultado de la sustentación MID.' },
-  { patron: '/corporativo/academico/resumen', numero: 'P1', nombre: 'Resumen académico', requerimientos: ['LMS-088'], fase: 8, descripcion: 'Estadísticas de matrículas, avance, aprobación y documentos.' },
-  { patron: '/corporativo/academico/programas', numero: 'P2', nombre: 'Programas académicos', requerimientos: ['LMS-080'], fase: 8, descripcion: 'Cursos, diplomados y MID con su estado de publicación.' },
-  { patron: '/corporativo/academico/programas/:id', numero: 'P3', nombre: 'Editor de programa', requerimientos: ['LMS-081', 'LMS-082', 'LMS-084'], fase: 8, descripcion: 'Estructura, contenidos y reglas de aprobación con validación de horas.' },
-  { patron: '/corporativo/academico/preguntas', numero: 'P4', nombre: 'Banco de preguntas', requerimientos: ['LMS-083'], fase: 8, descripcion: 'Preguntas por tema y TIM con respuestas configuradas.' },
-  { patron: '/corporativo/academico/matriculas', numero: 'P5', nombre: 'Matrículas y accesos', requerimientos: ['LMS-085', 'LMS-066'], fase: 8, descripcion: 'Matrículas manuales, suspensión, renovación e intentos extra.' },
-  { patron: '/corporativo/academico/membresias', numero: 'P6', nombre: 'Membresías', requerimientos: ['LMS-086'], fase: 8, descripcion: 'Planes de 1, 2, 3, 6, 9 y 12 meses y membresías activas.' },
-  { patron: '/corporativo/academico/certificados', numero: 'P7', nombre: 'Certificados y diplomas', requerimientos: ['LMS-087', 'LMS-049'], fase: 8, descripcion: 'Registro de documentos emitidos, anulados y reemitidos.' },
-  { patron: '/corporativo/academico/mid', numero: 'P8', nombre: 'Sustentaciones MID', requerimientos: ['LMS-072'], fase: 8, descripcion: 'Solicitudes MID y asignación de evaluadores.' },
-  { patron: '/corporativo/academico/reportes', numero: 'P9', nombre: 'Reportes académicos', requerimientos: ['LMS-089'], fase: 8, descripcion: 'Reportes de matrículas, notas y documentos en CSV y PDF.' },
+  { patron: '/erick/resumen', numero: 'P1', nombre: 'Resumen académico', requerimientos: ['LMS-088'], fase: 8, descripcion: 'Estadísticas de matrículas, avance, aprobación y documentos.' },
+  { patron: '/erick/programas', numero: 'P2', nombre: 'Programas académicos', requerimientos: ['LMS-080'], fase: 8, descripcion: 'Cursos, diplomados y MID con su estado de publicación.' },
+  { patron: '/erick/programas/:id', numero: 'P3', nombre: 'Editor de programa', requerimientos: ['LMS-081', 'LMS-082', 'LMS-084'], fase: 8, descripcion: 'Estructura, contenidos y reglas de aprobación con validación de horas.' },
+  { patron: '/erick/preguntas', numero: 'P4', nombre: 'Banco de preguntas', requerimientos: ['LMS-083'], fase: 8, descripcion: 'Preguntas por tema y TIM con respuestas configuradas.' },
+  { patron: '/erick/matriculas', numero: 'P5', nombre: 'Matrículas y accesos', requerimientos: ['LMS-085', 'LMS-066'], fase: 8, descripcion: 'Matrículas manuales, suspensión, renovación e intentos extra.' },
+  { patron: '/erick/membresias', numero: 'P6', nombre: 'Membresías', requerimientos: ['LMS-086'], fase: 8, descripcion: 'Planes de 1, 2, 3, 6, 9 y 12 meses y membresías activas.' },
+  { patron: '/erick/certificados', numero: 'P7', nombre: 'Certificados y diplomas', requerimientos: ['LMS-087', 'LMS-049'], fase: 8, descripcion: 'Registro de documentos emitidos, anulados y reemitidos.' },
+  { patron: '/erick/mid', numero: 'P8', nombre: 'Sustentaciones MID', requerimientos: ['LMS-072'], fase: 8, descripcion: 'Solicitudes MID y asignación de evaluadores.' },
+  { patron: '/erick/reportes', numero: 'P9', nombre: 'Reportes académicos', requerimientos: ['LMS-089'], fase: 8, descripcion: 'Reportes de matrículas, notas y documentos en CSV y PDF.' },
+  { patron: '/erick/integracion', numero: 'P10', nombre: 'Integración con MLM', requerimientos: ['LMS-090', 'LMS-091'], fase: 9, etiquetaFase: 'ERICK E1', descripcion: 'Eventos que ERICK S.A.C. envía al MLM por el conector.' },
+  { patron: '/corporativo/integracion-erick', numero: '25', nombre: 'Integración ERICK', requerimientos: ['MLM-065', 'LMS-091'], fase: 9, etiquetaFase: 'ERICK E1', descripcion: 'Consulta de ventas formativas, estado formativo de afiliados y eventos del conector.' },
   { patron: '/evaluador', numero: 'E', nombre: 'Bandeja de sustentaciones MID', requerimientos: ['LMS-073', 'LMS-075'], fase: 8, descripcion: 'Sustentaciones asignadas al evaluador con rúbrica de calificación.' },
   { patron: '/verificar', numero: 'V', nombre: 'Verificar documento', requerimientos: ['LMS-046'], fase: 8, descripcion: 'Verificación pública de certificados y diplomas por código.' },
   { patron: '/verificar/:codigo', numero: 'V', nombre: 'Resultado de verificación', requerimientos: ['LMS-046'], fase: 8, descripcion: 'Documento válido, anulado o inexistente.' },
```

### `src/servicios/pdfCertificados.ts`

```diff
@@ -5,7 +5,7 @@
 
 type Pdf = import('jspdf').jsPDF;
 
-const PETROLEO: [number, number, number] = [14, 59, 74];
+const PETROLEO: [number, number, number] = [46, 107, 79];
 const ORO: [number, number, number] = [184, 134, 43];
 const TEXTO: [number, number, number] = [15, 23, 42];
 const GRIS: [number, number, number] = [100, 116, 139];
```

### `src/store/useNotificacionesStore.ts`

```diff
@@ -14,7 +14,7 @@
 }
 
 export function esCorporativa(persona: Persona | null): boolean {
-  return persona?.perfil === 'superadministrador' || persona?.perfil === 'operador';
+  return persona?.perfil === 'superadministrador' || persona?.perfil === 'operador' || persona?.perfil === 'admin_educativo';
 }
 
 export function filtrarPorPersona(notificaciones: Notificacion[], persona: Persona | null): Notificacion[] {
```

### `src/store/useSesionStore.ts`

```diff
@@ -58,5 +58,6 @@
   if (perfil === 'afiliado') return '/afiliado/inicio';
   if (perfil === 'cliente_alumno') return '/cuenta';
   if (perfil === 'evaluador') return '/evaluador';
+  if (perfil === 'admin_educativo') return '/erick/resumen';
   return '/';
 }
```

### `src/tipos/permisos.ts`

```diff
@@ -5,6 +5,7 @@
 export type ModuloPermiso = 'usuarios' | 'catalogo' | 'pedidos' | 'redes' | 'periodos' | 'rangos' | 'bonos'
   | 'simulador' | 'liquidaciones' | 'compliance' | 'auditoria' | 'reportes' | 'integraciones'
   | 'configuracion' | 'permisos'
-  | 'academico' | 'matriculas' | 'certificados';
+  | 'academico' | 'matriculas' | 'certificados'
+  | 'calendario' | 'docentes' | 'contenidos' | 'configuracion_erick';
 
 export interface MatrizPermisos { perfil: PerfilAcceso; permisos: Record<string, string[]>; }
```

### `src/tipos/persona.ts`

```diff
@@ -1,6 +1,6 @@
 export type TipoPersona = 'cliente' | 'alumno' | 'empresario' | 'corporativo';
 export type PerfilAcceso = 'superadministrador' | 'operador' | 'afiliado' | 'cliente_alumno'
-  | 'evaluador';
+  | 'evaluador' | 'admin_educativo';
 export type EstadoCuenta = 'activo' | 'pendiente' | 'suspendido' | 'bloqueado';
 
 export interface Persona {
```

