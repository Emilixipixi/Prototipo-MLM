# Cambios fase E3 - Panel del docente (15/11/2026)

Fuente: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`, fase E3.

## Archivos nuevos

- `src/componentes/campus/ReproductorArchivo.tsx`
- `src/componentes/campus/SinProgramaAsignado.tsx`
- `src/hooks/useLibreta.ts`
- `src/hooks/useProgramasDocente.ts`
- `src/layouts/LayoutDocente.tsx`
- `src/paginas/docente/CalendarioDocente.tsx`
- `src/paginas/docente/ClasesVideo.tsx`
- `src/paginas/docente/LibretaNotas.tsx`
- `src/paginas/docente/MisCursos.tsx`
- `src/servicios/contenidosDocente.ts`
- `src/servicios/notasDocente.ts`
- `src/servicios/videosLocales.ts`

## Archivos modificados (líneas con + son nuevas; con - las líneas cambiadas)

### `CLAUDE.md`

```diff
@@ -43,7 +43,7 @@
 Fuente de verdad: `docs/PROMPT_ADMIN_EDUCATIVO_ERICK.md`.
 - E1. Separación y tema (completada: perfil `admin_educativo` DEMO-U04, docente DEMO-U05, módulos de permiso `calendario`, `docentes`, `contenidos`, `configuracion_erick`; el MLM solo consulta lo académico; tema verde pastel con `html[data-tema='erick']` en `src/index.css` y `hooks/useTemaErick.ts`; panel `/erick` con `layouts/LayoutErick.tsx`; Integración ERICK en `/corporativo/integracion-erick`; `/corporativo/academico/*` redirige; 30 alumnos más DEMO-L18 a L47 y 10 membresías en `datos/academico/alumnosAmpliados.ts`; pruebas `npm run prueba:erick`)
 - E2. Administración educativa completa (completada: `store/useErickStore.ts` con calendario, asignaciones de docentes, observaciones y configuración; datos en `datos/academico/erickInicial.ts` y docentes DEMO-U06 y DEMO-U07; servicios `docentes.ts`, `calendario.ts`, `configuracionErick.ts`; pantallas `/erick/resumen`, `/erick/estudiantes`, `/erick/docentes`, `/erick/calendario`, `/erick/configuracion`, `/erick/bitacora`; componente `componentes/campus/CalendarioAcademico.tsx`)
-- E3. Docente (pendiente)
+- E3. Docente (completada: panel `/docente` con `layouts/LayoutDocente.tsx`; `/evaluador` redirige a `/docente/sustentaciones`; pantallas en `paginas/docente/` Mis cursos, Clases en video, Libreta de notas y Calendario; videos MP4/WEBM en IndexedDB con `servicios/videosLocales.ts` (base `erick-videos`, se borra al reiniciar la demostración); `servicios/contenidosDocente.ts` y `servicios/notasDocente.ts`; el archivo subido tiene prioridad sobre YouTube en `TemaCampus`)
 - E4. Calendario del estudiante y cierre (pendiente)
 
 Pruebas: `npm run pruebas`.
```

### `pruebas/erick.prueba.ts`

```diff
@@ -13,6 +13,11 @@
 import { useCampusStore } from '../src/store/useCampusStore';
 import { useErickStore } from '../src/store/useErickStore';
 import { useNotificacionesStore } from '../src/store/useNotificacionesStore';
+import { actualizarVideoTema, origenVideo } from '../src/servicios/contenidosDocente';
+import { agregarObservacion, construirLibreta, otorgarIntentoDocente } from '../src/servicios/notasDocente';
+import { validarArchivoVideo } from '../src/servicios/videosLocales';
+import { resumirPrograma } from '../src/motores/academico/progreso';
+import { usePersonasStore } from '../src/store/usePersonasStore';
 
 let total = 0;
 function prueba(nombre: string, cuerpo: () => void): void {
@@ -132,4 +137,73 @@
   assert.ok(useBitacoraStore.getState().registros.filter((registro) => ['docentes', 'calendario', 'configuracion_erick'].includes(registro.modulo)).length >= 8);
 });
 
+const estructura = () => ({ programas: useAcademicoStore.getState().programas, modulos: useAcademicoStore.getState().modulos });
+const registroCampus = () => { const { matriculas, progreso, intentos } = useCampusStore.getState(); return { matriculas, progreso, intentos }; };
+const libretaDe = (programaId: string) => construirLibreta(programaId, usePersonasStore.getState().personas, estructura(), registroCampus());
+
+prueba('E3 la libreta del docente coincide con resumirPrograma (L12 y L17)', () => {
+  ['DEMO-L12', 'DEMO-L17'].forEach((personaId) => {
+    const programaIds = useCampusStore.getState().matriculas.filter((item) => item.personaId === personaId).map((item) => item.programaId)
+      .filter((id) => programasActuales().find((programa) => programa.id === id)?.tipo !== 'mid');
+    assert.ok(programaIds.length > 0, personaId);
+    programaIds.forEach((programaId) => {
+      const fila = libretaDe(programaId).filas.find((item) => item.persona.id === personaId);
+      const resumen = resumirPrograma(personaId, programaId, estructura(), registroCampus());
+      assert.ok(fila && resumen, `${personaId} ${programaId}`);
+      assert.equal(fila.nota, resumen.nota.nota);
+      assert.equal(fila.estado, resumen.nota.estado);
+      assert.equal(fila.avance, resumen.avance);
+    });
+  });
+  assert.ok(libretaDe('DEMO-CUR-01').columnas.length >= 2);
+  assert.equal(libretaDe('DEMO-DIP-01').columnas.length, programasActuales().find((programa) => programa.id === 'DEMO-DIP-01')?.cursoIds.length);
+});
+
+prueba('E3 validación de archivos de video (formato y tamaño)', () => {
+  assert.equal(validarArchivoVideo({ type: 'video/mp4', size: 10 * 1024 * 1024 }), null);
+  assert.equal(validarArchivoVideo({ type: 'video/webm', size: 300 * 1024 * 1024 }), null);
+  assert.match(validarArchivoVideo({ type: 'video/quicktime', size: 1000 }) ?? '', /MP4 o WEBM/);
+  assert.match(validarArchivoVideo({ type: 'video/mp4', size: 301 * 1024 * 1024 }) ?? '', /300 MB/);
+  assert.match(validarArchivoVideo({ type: 'video/mp4', size: 0 }) ?? '', /vacío/);
+});
+
+prueba('E3 el docente cambia el video de sus temas; el archivo tiene prioridad sobre YouTube', () => {
+  const modulo = useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01');
+  const temaId = modulo?.temaIds[0] ?? '';
+  assert.equal(actualizarVideoTema(temaId, { urlVideo: 'https://ejemplo.com/video' }, 'DEMO-U03').ok, false);
+  const conEnlace = actualizarVideoTema(temaId, { urlVideo: 'https://youtu.be/abcdefghijk' }, 'DEMO-U03');
+  assert.ok(conEnlace.ok);
+  assert.equal(conEnlace.ok && origenVideo(conEnlace.valor.video), 'youtube');
+  const conArchivo = actualizarVideoTema(temaId, { archivoVideoId: 'VID-PRUEBA', nombreArchivo: 'clase.mp4' }, 'DEMO-U03');
+  assert.equal(conArchivo.ok && origenVideo(conArchivo.valor.video), 'archivo');
+  const sinArchivo = actualizarVideoTema(temaId, { archivoVideoId: null }, 'DEMO-U03');
+  assert.equal(sinArchivo.ok && origenVideo(sinArchivo.valor.video), 'youtube');
+  assert.ok(useBitacoraStore.getState().registros.some((registro) => registro.modulo === 'contenidos' && registro.referenciaId === temaId));
+});
+
+prueba('E3 DEMO-U05 no puede ver ni gestionar DEMO-CUR-01', () => {
+  assert.ok(!programasDeDocente('DEMO-U05', erick().asignacionesDocentes, programasActuales()).includes('DEMO-CUR-01'));
+  const temaId = useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01')?.temaIds[0] ?? '';
+  assert.equal(actualizarVideoTema(temaId, { urlVideo: 'https://youtu.be/abcdefghijk' }, 'DEMO-U05').ok, false);
+  assert.equal(agregarObservacion('DEMO-U05', 'DEMO-L12', 'DEMO-CUR-01', 'Observación no autorizada de prueba').ok, false);
+  const matricula = useCampusStore.getState().matriculas.find((item) => item.programaId === 'DEMO-CUR-01');
+  assert.equal(otorgarIntentoDocente('DEMO-U05', 'DEMO-CUR-01', matricula?.id ?? '', temaId, 1, 'Motivo suficientemente largo').ok, false);
+});
+
+prueba('E3 el intento extra y la observación no cambian la nota automática', () => {
+  const fila = libretaDe('DEMO-CUR-01').filas.find((item) => item.matricula && item.persona.id === 'DEMO-L12') ?? libretaDe('DEMO-CUR-01').filas.find((item) => item.matricula);
+  assert.ok(fila?.matricula);
+  const elemento = fila.bloqueados[0] ?? useAcademicoStore.getState().modulos.find((item) => item.programaId === 'DEMO-CUR-01')?.temaIds[0] ?? '';
+  const antes = resumirPrograma(fila.persona.id, 'DEMO-CUR-01', estructura(), registroCampus());
+  assert.equal(otorgarIntentoDocente('DEMO-U03', 'DEMO-CUR-01', fila.matricula.id, elemento, 1, 'corto').ok, false);
+  assert.ok(otorgarIntentoDocente('DEMO-U03', 'DEMO-CUR-01', fila.matricula.id, elemento, 1, 'Reprogramación por problemas de conexión').ok);
+  const observacion = agregarObservacion('DEMO-U03', fila.persona.id, 'DEMO-CUR-01', 'Buen avance en el módulo, reforzar el caso práctico.');
+  assert.ok(observacion.ok);
+  assert.equal(agregarObservacion('DEMO-U03', fila.persona.id, 'DEMO-CUR-01', 'corta').ok, false);
+  const despues = resumirPrograma(fila.persona.id, 'DEMO-CUR-01', estructura(), registroCampus());
+  assert.equal(despues?.nota.nota, antes?.nota.nota);
+  assert.ok((useCampusStore.getState().matriculas.find((item) => item.id === fila.matricula?.id)?.intentosExtra[elemento] ?? 0) >= 1);
+  assert.equal(rutaInicioPorPerfil('evaluador'), '/docente/cursos');
+});
+
 console.log(`\n${total} pruebas de ERICK superadas`);
```

### `src/componentes/demo/BuscadorGlobal.tsx`

```diff
@@ -21,7 +21,7 @@
   const [abierto, setAbierto] = useState(false);
   const referencia = useClicFuera<HTMLDivElement>(abierto, () => setAbierto(false));
   const corporativo = esCorporativo(sesion);
-  const prefijo = corporativo ? '/corporativo' : sesion?.perfil === 'admin_educativo' ? '/erick' : '/afiliado';
+  const prefijo = corporativo ? '/corporativo' : sesion?.perfil === 'admin_educativo' ? '/erick' : sesion?.perfil === 'evaluador' ? '/docente' : '/afiliado';
 
   const resultados = useMemo<Resultado[]>(() => {
     const termino = normalizar(texto.trim());
```

### `src/datos/guiaFlujos.ts`

```diff
@@ -154,7 +154,7 @@
     pasos: [
       { id: 'F13-1', texto: 'DEMO-L03 (diploma emitido) solicita el MID con título, resumen y archivo.', ruta: '/campus/mid', rolId: 'DEMO-L03', detectar: (estado) => Boolean(sustentacionL03(estado)) },
       { id: 'F13-2', texto: 'La administradora educativa asigna a DEMO-U03 y la fecha.', ruta: '/erick/mid', rolId: 'DEMO-U04', detectar: (estado) => Boolean(sustentacionL03(estado)?.evaluadorId) },
-      { id: 'F13-3', texto: 'El evaluador califica con la rúbrica y observaciones.', ruta: '/evaluador', rolId: 'DEMO-U03', detectar: (estado) => ['aprobado', 'desaprobado'].includes(sustentacionL03(estado)?.estado ?? '') },
+      { id: 'F13-3', texto: 'El evaluador califica con la rúbrica y observaciones.', ruta: '/docente/sustentaciones', rolId: 'DEMO-U03', detectar: (estado) => ['aprobado', 'desaprobado'].includes(sustentacionL03(estado)?.estado ?? '') },
       { id: 'F13-4', texto: 'DEMO-L03 ve su constancia MID; su diploma sigue igual.', ruta: '/campus/certificados', rolId: 'DEMO-L03', detectar: (estado) => documentoNuevo(estado, 'DEMO-L03', 'constancia_mid') },
     ],
   },
```

### `src/paginas/campus/TemaCampus.tsx`

```diff
@@ -24,6 +24,7 @@
 import { formatearNumero } from '../../utilidades/formatos';
 import { ReproductorYoutube } from '../../componentes/campus/ReproductorYoutube';
 import { idYoutube } from '../../utilidades/youtube';
+import { ReproductorArchivo } from '../../componentes/campus/ReproductorArchivo';
 
 type PestanaTema = 'video' | 'lectura' | 'caso' | 'evaluacion';
 
@@ -73,7 +74,8 @@
   if (!contexto.acceso.acceso) return <AvisoSinAcceso programaId={contexto.programa.id} texto="Tu acceso a este programa no está vigente. Tus notas y certificados siguen disponibles en Mis notas y Mis certificados." />;
   if (contexto.estado === 'bloqueado') return <AvisoSinAcceso programaId={contexto.programa.id} texto="Este tema se desbloquea cuando apruebas el contenido anterior." />;
 
-  const videoYoutube = idYoutube(tema.video.urlVideo);
+  const videoArchivo = tema.video.archivoVideoId ?? null;
+  const videoYoutube = videoArchivo ? null : idYoutube(tema.video.urlVideo);
   const terminarVideoYoutube = () => {
     const resultado = marcarComponente(persona.id, tema.id, 'video');
     if (resultado.ok) toast.exito('Videoclase completada', 'Se registró tu avance.');
@@ -111,6 +113,16 @@
         <Tarjeta className="min-w-0">
           <Pestanas etiqueta="Componentes del tema" activa={pestana} alCambiar={(valor) => setPestana(valor as PestanaTema)} pestanas={pestanas} />
           <div className="pt-5">
+            {pestana === 'video' && videoArchivo && (
+              <div className="flex flex-col gap-4">
+                <ReproductorArchivo archivoVideoId={videoArchivo} titulo={tema.video.titulo} alTerminar={terminarVideoYoutube} />
+                <p className="text-[13px] text-texto-2">{tema.video.titulo}. Clase subida por tu docente: al terminar el video se registra como visto; también puedes marcarlo con el botón.</p>
+                <div className="flex flex-wrap justify-between gap-2">
+                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.video} onClick={() => marcar('video', 'lectura')}>{componentes.video ? 'Video visto' : 'Marcar como visto'}</Boton>
+                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('lectura')}>Siguiente: Lectura</Boton>
+                </div>
+              </div>
+            )}
             {pestana === 'video' && videoYoutube && (
               <div className="flex flex-col gap-4">
                 <ReproductorYoutube videoId={videoYoutube} titulo={tema.video.titulo} alTerminar={terminarVideoYoutube} />
@@ -121,7 +133,7 @@
                 </div>
               </div>
             )}
-            {pestana === 'video' && !videoYoutube && (
+            {pestana === 'video' && !videoYoutube && !videoArchivo && (
               <div className="flex flex-col gap-4">
                 <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${contexto.programa.colores[0]}, ${contexto.programa.colores[1]})` }}>
                   {tema.video.portada && <img src={tema.video.portada} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 mix-blend-overlay" />}
```

### `src/rutas/Rutas.tsx`

```diff
@@ -76,6 +76,11 @@
 const MisCertificados = lazy(() => import('../paginas/campus/MisCertificados'));
 const MiMid = lazy(() => import('../paginas/campus/MiMid'));
 const BandejaMid = lazy(() => import('../paginas/evaluador/BandejaMid'));
+const LayoutDocente = lazy(() => import('../layouts/LayoutDocente'));
+const MisCursosDocente = lazy(() => import('../paginas/docente/MisCursos'));
+const ClasesVideoDocente = lazy(() => import('../paginas/docente/ClasesVideo'));
+const LibretaNotasDocente = lazy(() => import('../paginas/docente/LibretaNotas'));
+const CalendarioDocente = lazy(() => import('../paginas/docente/CalendarioDocente'));
 const VerificarDocumento = lazy(() => import('../paginas/publico/VerificarDocumento'));
 
 const pantallasCampus: Record<string, ComponentType> = {
@@ -220,7 +225,16 @@
         </Route>
 
         <Route path="/evaluador" element={<RutaPorPerfil perfiles={['evaluador']}><LayoutEvaluador /></RutaPorPerfil>}>
-          <Route index element={<BandejaMid />} />
+          <Route index element={<Navigate to="/docente/sustentaciones" replace />} />
+        </Route>
+
+        <Route path="/docente" element={<RutaPorPerfil perfiles={['evaluador']}><LayoutDocente /></RutaPorPerfil>}>
+          <Route index element={<Navigate to="cursos" replace />} />
+          <Route path="cursos" element={<MisCursosDocente />} />
+          <Route path="cursos/:programaId/clases" element={<ClasesVideoDocente />} />
+          <Route path="cursos/:programaId/notas" element={<LibretaNotasDocente />} />
+          <Route path="calendario" element={<CalendarioDocente />} />
+          <Route path="sustentaciones" element={<BandejaMid />} />
         </Route>
 
         <Route path="/demo" element={<RutaPorPerfil perfiles={['superadministrador']}><LayoutCorporativo /></RutaPorPerfil>}>
```

### `src/rutas/navegacionCampus.ts`

```diff
@@ -67,3 +67,14 @@
     ],
   },
 ];
+
+export const navegacionDocente: GrupoNavegacion[] = [
+  {
+    titulo: 'Docencia',
+    items: [
+      { texto: 'Mis cursos', ruta: '/docente/cursos', icono: GraduationCap },
+      { texto: 'Calendario', ruta: '/docente/calendario', icono: CalendarDays },
+    ],
+  },
+  { titulo: 'Evaluación académica', items: [{ texto: 'Sustentaciones MID', ruta: '/docente/sustentaciones', icono: ClipboardPen }] },
+];
```

### `src/rutas/pantallas.ts`

```diff
@@ -73,6 +73,11 @@
   { patron: '/erick/configuracion', numero: 'P14', nombre: 'Configuración ERICK', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Datos institucionales, texto del certificado y valores por defecto.' },
   { patron: '/erick/bitacora', numero: 'P15', nombre: 'Bitácora académica', requerimientos: ['ERK-E2'], fase: 9, etiquetaFase: 'ERICK E2', descripcion: 'Acciones registradas sobre la plataforma ERICK.' },
   { patron: '/corporativo/integracion-erick', numero: '25', nombre: 'Integración ERICK', requerimientos: ['MLM-065', 'LMS-091'], fase: 9, etiquetaFase: 'ERICK E1', descripcion: 'Consulta de ventas formativas, estado formativo de afiliados y eventos del conector.' },
+  { patron: '/docente/cursos', numero: 'D1', nombre: 'Mis cursos', requerimientos: ['ERK-E3'], fase: 9, etiquetaFase: 'ERICK E3', descripcion: 'Programas asignados al docente con avance del grupo, bloqueos y próximas fechas.' },
+  { patron: '/docente/cursos/:programaId/clases', numero: 'D2', nombre: 'Clases en video', requerimientos: ['ERK-E3'], fase: 9, etiquetaFase: 'ERICK E3', descripcion: 'Video de cada tema: enlace de YouTube o archivo MP4/WEBM subido por el docente.' },
+  { patron: '/docente/cursos/:programaId/notas', numero: 'D3', nombre: 'Libreta de notas', requerimientos: ['ERK-E3'], fase: 9, etiquetaFase: 'ERICK E3', descripcion: 'Notas por módulo, estado, intentos, intentos extra y observaciones por estudiante.' },
+  { patron: '/docente/calendario', numero: 'D4', nombre: 'Calendario del docente', requerimientos: ['ERK-E3'], fase: 9, etiquetaFase: 'ERICK E3', descripcion: 'Fechas importantes de sus programas y sustentaciones asignadas.' },
+  { patron: '/docente/sustentaciones', numero: 'D5', nombre: 'Sustentaciones MID', requerimientos: ['LMS-073', 'LMS-075'], fase: 9, etiquetaFase: 'ERICK E3', descripcion: 'Sustentaciones asignadas al docente con rúbrica de calificación.' },
   { patron: '/evaluador', numero: 'E', nombre: 'Bandeja de sustentaciones MID', requerimientos: ['LMS-073', 'LMS-075'], fase: 8, descripcion: 'Sustentaciones asignadas al evaluador con rúbrica de calificación.' },
   { patron: '/verificar', numero: 'V', nombre: 'Verificar documento', requerimientos: ['LMS-046'], fase: 8, descripcion: 'Verificación pública de certificados y diplomas por código.' },
   { patron: '/verificar/:codigo', numero: 'V', nombre: 'Resultado de verificación', requerimientos: ['LMS-046'], fase: 8, descripcion: 'Documento válido, anulado o inexistente.' },
```

### `src/store/reiniciarDemo.ts`

```diff
@@ -18,6 +18,7 @@
 import { useRedStore } from './useRedStore';
 import { useSesionStore } from './useSesionStore';
 import { useErickStore } from './useErickStore';
+import { borrarTodosLosVideos } from '../servicios/videosLocales';
 
 export function reiniciarDemo(): void {
   usePersonasStore.getState().reiniciar();
@@ -40,4 +41,5 @@
   useAcademicoStore.getState().reiniciar();
   useCampusStore.getState().reiniciar();
   useErickStore.getState().reiniciar();
+  void borrarTodosLosVideos().catch(() => undefined);
 }
```

### `src/store/useSesionStore.ts`

```diff
@@ -57,7 +57,7 @@
   if (perfil === 'superadministrador' || perfil === 'operador') return '/corporativo/resumen';
   if (perfil === 'afiliado') return '/afiliado/inicio';
   if (perfil === 'cliente_alumno') return '/cuenta';
-  if (perfil === 'evaluador') return '/evaluador';
+  if (perfil === 'evaluador') return '/docente/cursos';
   if (perfil === 'admin_educativo') return '/erick/resumen';
   return '/';
 }
```

### `src/tipos/academico.ts`

```diff
@@ -121,3 +121,5 @@
   razonSocial: string; ruc: string; direccion: string; correoContacto: string; telefono: string;
   textoCertificado: string; mesesAccesoPorDefecto: number; intentosPorDefecto: number;
 }
+
+export interface ContenidoVideo { archivoVideoId?: string; nombreArchivo?: string }
```
