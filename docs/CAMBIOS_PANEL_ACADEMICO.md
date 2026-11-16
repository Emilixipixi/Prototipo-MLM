# Cambios: panel académico y clases de YouTube (14/11/2026)

Archivos nuevos: `src/componentes/campus/CampoPortadaVideo.tsx`, `src/componentes/campus/GraficosAcademicos.tsx`, `src/componentes/campus/distribucionNotas.ts`, `src/componentes/campus/ReproductorYoutube.tsx`, `src/utilidades/youtube.ts`, `src/datos/academico/videosYoutube.ts`, `pruebas/panel.prueba.ts`.

Cada bloque indica el archivo y el lugar exacto (líneas con + son nuevas; con - las únicas líneas modificadas).

Para ver las clases de YouTube de demostración en un navegador que ya usó el prototipo, pulsa Reiniciar demostración.

## `src/servicios/academico.ts`

```diff
@@ -7,6 +7,7 @@
 import { transicionesPrograma, validarTransicion } from '../validaciones/transiciones';
 import { fechaActualLocal } from './eventosLms';
 import { registrarBitacora } from './registro';
+import { idYoutube } from '../utilidades/youtube';
 
 const coloresNuevos: Array<[string, string]> = [['#7C2D12', '#EA580C'], ['#4C1D95', '#8B5CF6'], ['#064E3B', '#10B981'], ['#1E293B', '#64748B']];
 
@@ -189,6 +190,7 @@
 export function guardarTema(tema: Tema, actorId: string): Resultado<null> {
   if (tema.nombre.trim().length < 3) return fallo('El nombre del tema es obligatorio.');
   if (tema.video.minutos < 1 || tema.video.minutos > 120) return fallo('La duración del video debe estar entre 1 y 120 minutos.');
+  if (tema.video.urlVideo?.trim() && !idYoutube(tema.video.urlVideo)) return fallo('El enlace del video debe ser de YouTube (youtube.com/watch?v=..., youtu.be/... o youtube.com/shorts/...).');
   if (tema.lectura.contenido.trim().length < 20) return fallo('La lectura debe tener contenido.');
   const { temas, actualizar } = useAcademicoStore.getState();
   const limpio = { ...tema, objetivos: tema.objetivos.map((objetivo) => objetivo.trim()).filter(Boolean) };
@@ -281,3 +283,45 @@
   registrarBitacora({ actorId, accion: plan.activo ? 'Plan de membresía desactivado' : 'Plan de membresía activado', modulo: 'matriculas', referenciaId: id });
   return exito(!plan.activo);
 }
+
+export type DireccionOrden = 'subir' | 'bajar';
+
+function intercambiar<T>(lista: T[], indice: number, direccion: DireccionOrden): T[] | null {
+  const destino = direccion === 'subir' ? indice - 1 : indice + 1;
+  if (indice < 0 || destino < 0 || destino >= lista.length) return null;
+  const copia = [...lista];
+  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
+  return copia;
+}
+
+export function moverTema(moduloId: string, temaId: string, direccion: DireccionOrden, actorId: string): Resultado<string[]> {
+  const programa = programaDeModulo(moduloId);
+  if (!programa) return fallo('Módulo no encontrado.');
+  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
+  const { modulos, temas, actualizar } = useAcademicoStore.getState();
+  const modulo = modulos.find((item) => item.id === moduloId);
+  if (!modulo) return fallo('Módulo no encontrado.');
+  const temaIds = intercambiar(modulo.temaIds, modulo.temaIds.indexOf(temaId), direccion);
+  if (!temaIds) return fallo(direccion === 'subir' ? 'El tema ya es el primero del módulo.' : 'El tema ya es el último del módulo.');
+  actualizar({
+    modulos: modulos.map((item) => (item.id === moduloId ? { ...item, temaIds } : item)),
+    temas: temas.map((item) => (temaIds.includes(item.id) ? { ...item, orden: temaIds.indexOf(item.id) + 1 } : item)),
+  });
+  registrarBitacora({ actorId, accion: 'Orden de temas actualizado', modulo: 'academico', referenciaId: moduloId, antes: modulo.temaIds, despues: temaIds });
+  return exito(temaIds);
+}
+
+export function moverModulo(programaId: string, moduloId: string, direccion: DireccionOrden, actorId: string): Resultado<string[]> {
+  const { programas, modulos, actualizar } = useAcademicoStore.getState();
+  const programa = programas.find((item) => item.id === programaId);
+  if (!programa) return fallo('Programa no encontrado.');
+  if (programa.estado !== 'borrador') return fallo('La estructura solo se modifica con el programa en borrador.');
+  const moduloIds = intercambiar(programa.moduloIds, programa.moduloIds.indexOf(moduloId), direccion);
+  if (!moduloIds) return fallo(direccion === 'subir' ? 'El módulo ya es el primero del curso.' : 'El módulo ya es el último del curso.');
+  actualizar({
+    programas: programas.map((item) => (item.id === programaId ? { ...item, moduloIds } : item)),
+    modulos: modulos.map((item) => (moduloIds.includes(item.id) ? { ...item, orden: moduloIds.indexOf(item.id) + 1 } : item)),
+  });
+  registrarBitacora({ actorId, accion: 'Orden de módulos actualizado', modulo: 'academico', referenciaId: programaId, antes: programa.moduloIds, despues: moduloIds });
+  return exito(moduloIds);
+}
```

## `src/servicios/matriculas.ts`

```diff
@@ -178,3 +178,27 @@
   if (nuevos.length > 0) actualizar({ avisos: [...useCampusStore.getState().avisos, ...nuevos] });
   return nuevos.length;
 }
+
+export const mesesExtension = [1, 2, 3, 6, 9, 12] as const;
+
+export function extenderAcceso(matriculaId: string, meses: number, actorId: string, motivo: string): Resultado<Matricula> {
+  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
+  if (!(mesesExtension as readonly number[]).includes(meses)) return fallo('La extensión debe ser de 1, 2, 3, 6, 9 o 12 meses.');
+  const { matriculas, actualizar } = useCampusStore.getState();
+  const matricula = matriculas.find((item) => item.id === matriculaId);
+  if (!matricula) return fallo('Matrícula no encontrada.');
+  if (matricula.origen === 'membresia') return fallo('Esta matrícula depende de la membresía: extiende o renueva la membresía.');
+  if (matricula.suspendida) return fallo('La matrícula está suspendida: reactívala antes de extender el acceso.');
+  const programa = useAcademicoStore.getState().programas.find((item) => item.id === matricula.programaId);
+  const vencimiento = sumarMeses(baseRenovacion(matricula.vencimiento, relativoHoy(0)), meses);
+  const actualizada: Matricula = {
+    ...matricula, vencimiento,
+    historial: [...matricula.historial, { fecha: fechaActualLocal(), actorId, accion: `Acceso extendido ${meses} ${meses === 1 ? 'mes' : 'meses'}`, motivo: motivo.trim() }],
+  };
+  actualizar({ matriculas: matriculas.map((item) => (item.id === matriculaId ? actualizada : item)) });
+  registrarEventoLms('matricula_creada', matricula.personaId, matricula.programaId, { matriculaId, origen: 'manual', pedidoId: null, vencimiento, renovacion: true }, `Acceso extendido hasta ${vencimiento}`);
+  registrarBitacora({ actorId, accion: 'Extensión de acceso', modulo: 'matriculas', motivo: motivo.trim(), referenciaId: matriculaId, antes: { vencimiento: matricula.vencimiento }, despues: { vencimiento } });
+  notificar({ personaId: matricula.personaId, tipo: 'estado', titulo: 'Acceso extendido', mensaje: `${programa?.nombre ?? matricula.programaId}: tu acceso en Campus ERICK se extendió hasta el ${vencimiento}.` });
+  sincronizarFormacion(matricula.personaId);
+  return exito(actualizada);
+}
```

## `src/datos/academico/contenidos.ts`

```diff
@@ -2,6 +2,7 @@
 import { HORAS_TEMA, HORAS_TIM } from '../../motores/academico/notas';
 import { programasIniciales } from './programas';
 import { semillasCur01, semillasCur02, semillasCur03, type SemillaModulo, type SemillaTema } from './semillas';
+import { videosYoutubeIniciales } from './videosYoutube';
 
 export interface SemillaUbicada { tema: SemillaTema; temaId: string; moduloId: string; indiceModulo: number; indiceTema: number }
 
@@ -48,7 +49,7 @@
       `Aplicar «${c2}» y «${c3}» en situaciones de trabajo comercial.`,
       'Seguir el procedimiento recomendado y evitar los errores frecuentes.',
     ],
-    video: { titulo: `Videoclase: ${tema.nombre}`, minutos: 28 + (numero % 5) },
+    video: { titulo: `Videoclase: ${tema.nombre}`, minutos: 28 + (numero % 5), ...(videosYoutubeIniciales[temaId] ? { urlVideo: videosYoutubeIniciales[temaId] } : {}) },
     lectura: { titulo: `Lectura: ${tema.nombre}`, contenido: construirLectura(tema, nombreModulo), minutos: 60, descargable: true },
     caso: {
       enunciado: `${tema.caso} A partir de esta situación, aplica lo estudiado en el tema «${tema.nombre}».`,
```

## `src/paginas/corporativo/academico/EditorPrograma.tsx`

```diff
@@ -16,6 +16,10 @@
 import { useCatalogoStore } from '../../../store/useCatalogoStore';
 import { usePersonaSesion } from '../../../store/useSesionStore';
 import type { Programa, ReglasPrograma, Tema } from '../../../tipos/academico';
+import { ChevronDown, ChevronUp } from 'lucide-react';
+import { CampoPortadaVideo } from '../../../componentes/campus/CampoPortadaVideo';
+import { moverModulo, moverTema } from '../../../servicios/academico';
+import { idYoutube, miniaturaYoutube } from '../../../utilidades/youtube';
 
 const claseArea = 'w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave disabled:bg-fondo';
 
@@ -71,6 +75,7 @@
 }
 
 function FormTema({ tema, editable }: { tema: Tema; editable: boolean }) {
+  const colores: [string, string] = useAcademicoStore((estado) => estado.programas.find((programa) => programa.moduloIds.includes(tema.moduloId))?.colores) ?? ['#14305A', '#0E7490'];
   const persona = usePersonaSesion();
   const toast = useToast();
   const [borrador, setBorrador] = useState<Tema>(tema);
@@ -85,7 +90,9 @@
         <Campo etiqueta="Título del video" disabled={!editable} value={borrador.video.titulo} onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, titulo: evento.target.value } })} />
         <Campo etiqueta="Minutos" type="number" disabled={!editable} value={borrador.video.minutos} onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, minutos: Number(evento.target.value) } })} />
       </div>
-      <Campo etiqueta="Enlace del video (opcional)" disabled={!editable} value={borrador.video.urlVideo ?? ''} placeholder="https://" onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, urlVideo: evento.target.value } })} />
+      <Campo etiqueta="Enlace de YouTube de la clase (opcional)" disabled={!editable} value={borrador.video.urlVideo ?? ''} placeholder="https://" onChange={(evento) => setBorrador({ ...borrador, video: { ...borrador.video, urlVideo: evento.target.value } })} />
+      {Boolean(borrador.video.urlVideo?.trim()) && <p className={idYoutube(borrador.video.urlVideo) ? 'text-xs font-semibold text-exito' : 'text-xs font-semibold text-error'}>{idYoutube(borrador.video.urlVideo) ? 'Clase de YouTube reconocida: el campus la reproducirá en lugar del video simulado.' : 'Pega un enlace de YouTube: youtube.com/watch?v=..., youtu.be/... o youtube.com/shorts/...'}</p>}
+      <CampoPortadaVideo miniatura={idYoutube(borrador.video.urlVideo) ? miniaturaYoutube(idYoutube(borrador.video.urlVideo) ?? '') : undefined} portada={borrador.video.portada} colores={colores} editable={editable} alCambiar={(portada) => setBorrador({ ...borrador, video: { ...borrador.video, portada } })} />
       <div className="flex flex-col gap-1.5"><label htmlFor={`lectura-${tema.id}`} className="text-[13px] font-semibold">Lectura (usa ## para subtítulos)</label><textarea id={`lectura-${tema.id}`} rows={8} disabled={!editable} value={borrador.lectura.contenido} onChange={(evento) => setBorrador({ ...borrador, lectura: { ...borrador.lectura, contenido: evento.target.value } })} className={claseArea} /></div>
       <div className="flex flex-col gap-1.5"><label htmlFor={`objetivos-${tema.id}`} className="text-[13px] font-semibold">Objetivos (uno por línea)</label><textarea id={`objetivos-${tema.id}`} rows={3} disabled={!editable} value={borrador.objetivos.join('\n')} onChange={(evento) => setBorrador({ ...borrador, objetivos: evento.target.value.split('\n') })} className={claseArea} /></div>
       <label className="flex min-h-11 items-center gap-2 text-[13.5px]"><input type="checkbox" disabled={!editable} className="size-4 accent-[#0E7490]" checked={borrador.lectura.descargable} onChange={(evento) => setBorrador({ ...borrador, lectura: { ...borrador.lectura, descargable: evento.target.checked } })} />Lectura descargable en PDF</label>
@@ -153,12 +160,20 @@
                 <input name="nombre" aria-label={`Nombre del módulo ${indice + 1}`} defaultValue={modulo.nombre} disabled={!editable} className="min-h-11 min-w-0 flex-1 rounded-xl border border-borde px-3 text-sm outline-none focus:border-acento" />
                 {editable && <Boton tamano="sm" variante="secundario" type="submit" icono={Save}>Guardar</Boton>}
               </form>
+              {editable && programa.estado === 'borrador' && (
+                <div className="mb-3 flex flex-wrap gap-2">
+                  <Boton tamano="sm" variante="fantasma" icono={ChevronUp} disabled={indice === 0} onClick={() => accion(moverModulo(programa.id, modulo.id, 'subir', actor), 'Módulo movido')}>Subir módulo</Boton>
+                  <Boton tamano="sm" variante="fantasma" icono={ChevronDown} disabled={indice === modulos.length - 1} onClick={() => accion(moverModulo(programa.id, modulo.id, 'bajar', actor), 'Módulo movido')}>Bajar módulo</Boton>
+                </div>
+              )}
               <ol className="flex flex-col gap-1.5 text-[13px]">
                 {modulo.temaIds.map((temaIdItem, orden) => (
                   <li key={temaIdItem} className="flex items-center gap-2 rounded-lg bg-fondo px-2.5 py-1.5">
                     <span className="cifra w-5 text-texto-3">{orden + 1}</span>
                     <button type="button" className="min-w-0 flex-1 truncate text-left hover:text-acento" onClick={() => { setTemaId(temaIdItem); setPestana('contenidos'); }}>{datos.temas.find((tema) => tema.id === temaIdItem)?.nombre ?? temaIdItem}</button>
                     <span className="cifra text-xs text-texto-3">{datos.preguntas.filter((pregunta) => pregunta.ambitoId === temaIdItem && pregunta.activa).length} preg.</span>
+                    {editable && programa.estado === 'borrador' && <button type="button" aria-label="Subir tema" disabled={orden === 0} onClick={() => accion(moverTema(modulo.id, temaIdItem, 'subir', actor), 'Tema movido')} className="grid size-9 place-items-center rounded-lg text-texto-2 hover:bg-superficie disabled:opacity-30"><ChevronUp className="size-4" aria-hidden /></button>}
+                    {editable && programa.estado === 'borrador' && <button type="button" aria-label="Bajar tema" disabled={orden === modulo.temaIds.length - 1} onClick={() => accion(moverTema(modulo.id, temaIdItem, 'bajar', actor), 'Tema movido')} className="grid size-9 place-items-center rounded-lg text-texto-2 hover:bg-superficie disabled:opacity-30"><ChevronDown className="size-4" aria-hidden /></button>}
                     {editable && programa.estado === 'borrador' && <button type="button" aria-label="Quitar tema" onClick={() => accion(quitarTema(modulo.id, temaIdItem, actor), 'Tema retirado')} className="grid size-9 place-items-center rounded-lg text-error hover:bg-red-50"><Minus className="size-4" aria-hidden /></button>}
                   </li>
                 ))}
```

## `src/paginas/campus/TemaCampus.tsx`

```diff
@@ -22,6 +22,8 @@
 import type { ProgresoComponente } from '../../tipos/academico';
 import { unirClases } from '../../utilidades/clases';
 import { formatearNumero } from '../../utilidades/formatos';
+import { ReproductorYoutube } from '../../componentes/campus/ReproductorYoutube';
+import { idYoutube } from '../../utilidades/youtube';
 
 type PestanaTema = 'video' | 'lectura' | 'caso' | 'evaluacion';
 
@@ -71,6 +73,11 @@
   if (!contexto.acceso.acceso) return <AvisoSinAcceso programaId={contexto.programa.id} texto="Tu acceso a este programa no está vigente. Tus notas y certificados siguen disponibles en Mis notas y Mis certificados." />;
   if (contexto.estado === 'bloqueado') return <AvisoSinAcceso programaId={contexto.programa.id} texto="Este tema se desbloquea cuando apruebas el contenido anterior." />;
 
+  const videoYoutube = idYoutube(tema.video.urlVideo);
+  const terminarVideoYoutube = () => {
+    const resultado = marcarComponente(persona.id, tema.id, 'video');
+    if (resultado.ok) toast.exito('Videoclase completada', 'Se registró tu avance.');
+  };
   const marcar = (componente: keyof ProgresoComponente, siguiente?: PestanaTema) => {
     const resultado = marcarComponente(persona.id, tema.id, componente);
     if (!resultado.ok) toast.error('No se pudo registrar', resultado.error);
@@ -104,9 +111,20 @@
         <Tarjeta className="min-w-0">
           <Pestanas etiqueta="Componentes del tema" activa={pestana} alCambiar={(valor) => setPestana(valor as PestanaTema)} pestanas={pestanas} />
           <div className="pt-5">
-            {pestana === 'video' && (
+            {pestana === 'video' && videoYoutube && (
+              <div className="flex flex-col gap-4">
+                <ReproductorYoutube videoId={videoYoutube} titulo={tema.video.titulo} alTerminar={terminarVideoYoutube} />
+                <p className="text-[13px] text-texto-2">{tema.video.titulo}. Clase en YouTube: al terminar el video se registra como visto; también puedes marcarlo con el botón.</p>
+                <div className="flex flex-wrap justify-between gap-2">
+                  <Boton variante="secundario" icono={CircleCheck} disabled={componentes.video} onClick={() => marcar('video', 'lectura')}>{componentes.video ? 'Video visto' : 'Marcar como visto'}</Boton>
+                  <Boton variante="fantasma" iconoDerecha={ArrowRight} onClick={() => setPestana('lectura')}>Siguiente: Lectura</Boton>
+                </div>
+              </div>
+            )}
+            {pestana === 'video' && !videoYoutube && (
               <div className="flex flex-col gap-4">
                 <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${contexto.programa.colores[0]}, ${contexto.programa.colores[1]})` }}>
+                  {tema.video.portada && <img src={tema.video.portada} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-80 mix-blend-overlay" />}
                   <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] font-semibold">Video de demostración</span>
                   <button type="button" onClick={() => setReproduciendo((valor) => !valor)} aria-label={reproduciendo ? 'Pausar video' : 'Reproducir video'}
                     className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30">
```

## `src/paginas/corporativo/academico/MatriculasAcademicas.tsx`

```diff
@@ -21,6 +21,8 @@
 import type { EstadoMatricula } from '../../../tipos/academico';
 import { formatearFecha } from '../../../utilidades/fechas';
 import { formatearNumero } from '../../../utilidades/formatos';
+import { CalendarPlus } from 'lucide-react';
+import { extenderAcceso, mesesExtension } from '../../../servicios/matriculas';
 
 type Filtro = 'todas' | EstadoMatricula;
 
@@ -39,6 +41,9 @@
   const [extra, setExtra] = useState<FilaMatricula | null>(null);
   const [elementoExtra, setElementoExtra] = useState('');
   const [motivoExtra, setMotivoExtra] = useState('');
+  const [extension, setExtension] = useState<FilaMatricula | null>(null);
+  const [mesesExtra, setMesesExtra] = useState('3');
+  const [motivoExtension, setMotivoExtension] = useState('');
   const actor = persona?.id ?? 'DEMO-U01';
   const filas = datos.filasMatriculas.filter((fila) => filtro === 'todas' || fila.estado === filtro);
   const candidatos = datos.personas.filter((item) => item.tipo !== 'corporativo' && item.estado === 'activo');
@@ -71,6 +76,7 @@
           <div className="flex flex-wrap justify-end gap-1.5">
             <Boton tamano="sm" variante="fantasma" icono={fila.matricula.suspendida ? CirclePlay : CirclePause} onClick={() => setSuspension(fila)}>{fila.matricula.suspendida ? 'Reactivar' : 'Suspender'}</Boton>
             <Boton tamano="sm" variante="fantasma" icono={RotateCcw} onClick={() => { setExtra(fila); setElementoExtra(''); setMotivoExtra(''); setError(null); }}>Intento extra</Boton>
+            {fila.matricula.origen !== 'membresia' && <Boton tamano="sm" variante="fantasma" icono={CalendarPlus} onClick={() => { setExtension(fila); setMesesExtra('3'); setMotivoExtension(''); setError(null); }}>Extender</Boton>}
           </div>
         ) : null}
       />
@@ -107,6 +113,22 @@
           )}
         </Modal>
       )}
+      {extension && (
+        <Modal abierto alCerrar={() => setExtension(null)} titulo={`Extender acceso · ${extension.matricula.id}`} descripcion="Amplía el vencimiento sin nuevo pago (cortesía, compensación o corrección). Queda en la bitácora y en el historial de la matrícula."
+          pie={<><Boton variante="secundario" onClick={() => setExtension(null)}>Cancelar</Boton><Boton icono={CalendarPlus} onClick={() => {
+            const resultado = extenderAcceso(extension.matricula.id, Number(mesesExtra), actor, motivoExtension);
+            if (!resultado.ok) { setError(resultado.error); return; }
+            toast.exito('Acceso extendido', `${resultado.valor.id} hasta el ${formatearFecha(resultado.valor.vencimiento)}`);
+            setExtension(null);
+          }}>Extender</Boton></>}>
+          <div className="flex flex-col gap-3">
+            <p className="rounded-xl bg-fondo px-3 py-2.5 text-[13px] text-texto-2">{extension.persona ? `${extension.persona.nombres} ${extension.persona.apellidos}` : extension.matricula.personaId} · {extension.programa}. Vencimiento actual: <span className="cifra">{formatearFecha(extension.matricula.vencimiento)}</span>; si ya venció, la extensión se cuenta desde hoy.</p>
+            <Selector etiqueta="Meses a extender" value={mesesExtra} onChange={(evento) => setMesesExtra(evento.target.value)} opciones={mesesExtension.map((meses) => ({ valor: String(meses), texto: `${meses} ${meses === 1 ? 'mes' : 'meses'}` }))} />
+            <Campo etiqueta="Motivo (obligatorio)" value={motivoExtension} onChange={(evento) => setMotivoExtension(evento.target.value)} placeholder="Cortesía, compensación o corrección" />
+            {error && <p className="text-[13px] font-medium text-error">{error}</p>}
+          </div>
+        </Modal>
+      )}
       <Confirmacion abierto={Boolean(suspension)} alCerrar={() => setSuspension(null)} requiereMotivo peligro={!suspension?.matricula.suspendida}
         titulo={suspension?.matricula.suspendida ? 'Reactivar acceso' : 'Suspender acceso'}
         resumen={suspension ? `${suspension.programa} de ${suspension.persona?.nombres ?? suspension.matricula.personaId}. Las notas y los certificados se conservan.` : ''}
```

## `src/paginas/corporativo/academico/ResumenAcademico.tsx`

```diff
@@ -9,6 +9,7 @@
 import { esVigente } from '../../../motores/academico/accesos';
 import { formatearFechaHora } from '../../../utilidades/fechas';
 import { formatearNumero, formatearPorcentaje } from '../../../utilidades/formatos';
+import { GraficosAcademicos } from '../../../componentes/campus/GraficosAcademicos';
 
 export default function ResumenAcademico() {
   const datos = useDatosAcademicos();
@@ -42,6 +43,7 @@
         <TarjetaKpi etiqueta="Intentos registrados" valor={intentos.length} icono={Activity} tono="acento" />
         <TarjetaKpi etiqueta="Eventos con error" valor={errores} icono={AlertTriangle} tono={errores ? 'error' : 'exito'} />
       </div>
+      <GraficosAcademicos intentos={intentos} programas={porPrograma.map((fila) => ({ codigo: fila.programa.codigo, nombre: fila.programa.nombre, avance: fila.avance, matriculas: fila.total }))} />
       <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
         <Tarjeta titulo="Desempeño por programa" subtitulo="Matrículas, avance promedio y aprobación" icono={Library}>
           <ul className="flex flex-col gap-4">
```

## `src/paginas/corporativo/academico/ReportesAcademicos.tsx`

```diff
@@ -11,11 +11,30 @@
 import { nombresOrigen } from '../../../servicios/matriculas';
 import { descargarPdfTabla } from '../../../servicios/pdfCertificados';
 import type { FilaExportable } from '../../../servicios/exportar';
+import { CalendarRange, X } from 'lucide-react';
+import { Campo } from '../../../componentes/ui/Campo';
+
+function enRango(fecha: string, desde: string, hasta: string): boolean {
+  const dia = fecha.slice(0, 10);
+  return (!desde || dia >= desde) && (!hasta || dia <= hasta);
+}
 
 type Reporte = 'matriculas' | 'notas' | 'documentos' | 'eventos';
 
 export default function ReportesAcademicos() {
-  const datos = useDatosAcademicos();
+  const datosCompletos = useDatosAcademicos();
+  const [desde, setDesde] = useState('');
+  const [hasta, setHasta] = useState('');
+  const datos = {
+    ...datosCompletos,
+    filasMatriculas: datosCompletos.filasMatriculas.filter((fila) => enRango(fila.matricula.inicio, desde, hasta)),
+    campus: {
+      ...datosCompletos.campus,
+      documentos: datosCompletos.campus.documentos.filter((documento) => enRango(documento.fechaEmision, desde, hasta)),
+      eventos: datosCompletos.campus.eventos.filter((evento) => enRango(evento.fecha, desde, hasta)),
+    },
+  };
+  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
   const puedeExportar = usePermiso('academico', 'exportar');
   const [reporte, setReporte] = useState<Reporte>('matriculas');
   const construir = (): FilaExportable[] => {
@@ -35,6 +54,13 @@
         { id: 'documentos', texto: 'Documentos', contador: datos.campus.documentos.length },
         { id: 'eventos', texto: 'Eventos', contador: datos.campus.eventos.length },
       ]} />
+      <div className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-superficie p-4 sm:flex-row sm:items-end">
+        <p className="flex items-center gap-2 text-[13px] font-semibold text-texto sm:mb-3"><CalendarRange className="size-4 text-acento" aria-hidden />Rango de fechas</p>
+        <Campo etiqueta="Desde" type="date" value={desde} max={hasta || undefined} onChange={(evento) => setDesde(evento.target.value)} />
+        <Campo etiqueta="Hasta" type="date" value={hasta} min={desde || undefined} onChange={(evento) => setHasta(evento.target.value)} />
+        {(desde || hasta) && <Boton tamano="sm" variante="fantasma" icono={X} className="sm:mb-1" onClick={() => { setDesde(''); setHasta(''); }}>Quitar filtro</Boton>}
+        <p className="text-xs text-texto-2 sm:mb-3 sm:ml-auto">{rangoInvalido ? 'La fecha inicial es posterior a la final.' : 'Matrículas por fecha de inicio, documentos por emisión y eventos por fecha de registro.'}</p>
+      </div>
       <Tarjeta titulo={titulos[reporte]} subtitulo={`${filas.length} filas`}>
         <div className="mb-3 flex flex-wrap gap-2">
           <BarraExportar modulo="academico" nombreArchivo={`reporte_${reporte}`} filas={construir} />
```

## `package.json`

```diff
@@ -11,7 +11,8 @@
     "prueba:academico": "tsx pruebas/academico.prueba.ts",
     "prueba:matriculas": "tsx pruebas/matriculas.prueba.ts",
     "prueba:campus": "tsx pruebas/campus.prueba.ts",
-    "pruebas": "tsx pruebas/academico.prueba.ts && tsx pruebas/matriculas.prueba.ts && tsx pruebas/campus.prueba.ts"
+    "prueba:panel": "tsx pruebas/panel.prueba.ts",
+    "pruebas": "tsx pruebas/academico.prueba.ts && tsx pruebas/matriculas.prueba.ts && tsx pruebas/campus.prueba.ts && tsx pruebas/panel.prueba.ts"
   },
   "dependencies": {
     "date-fns": "^4.4.0",
```


# Cambios: 10 alumnos con datos precargados y MID (15/11/2026)

Archivo nuevo: `src/datos/academico/alumnosCampus.ts` (alumnos DEMO-L08 a DEMO-L17, sus matrículas en el diplomado, filas de formación y 8 sustentaciones MID con 2 constancias). Pulsa Reiniciar demostración (la cantidad de personas cambió, así que el navegador recarga los datos solo).

## `src/datos/personas.ts`

```diff
@@ -1,5 +1,6 @@
 import type { Persona } from '../tipos/persona';
 import { personasAmpliadas } from './ampliacion';
+import { alumnosCampus } from './academico/alumnosCampus';
 
 const personasFase1: Persona[] = [
   {
@@ -145,4 +146,4 @@
   },
 ];
 
-export const personasIniciales: Persona[] = [...personasFase1, ...personasRed, ...personasAmpliadas];
+export const personasIniciales: Persona[] = [...personasFase1, ...personasRed, ...personasAmpliadas, ...alumnosCampus];
```

## `src/datos/academico/matriculasIniciales.ts`

```diff
@@ -10,6 +10,7 @@
 import { relativoHoy, sumarDias, sumarMeses } from './fechasCampus';
 import { preguntasIniciales } from './preguntas';
 import { programasIniciales } from './programas';
+import { generarMidInicial, semillasAlumnosCampus } from './alumnosCampus';
 
 interface SemillaMatricula {
   personaId: string; programaId: string; origen: OrigenMatricula; pedidoId?: string; membresiaId?: string;
@@ -48,6 +49,7 @@
   { personaId: 'DEMO-L07', programaId: 'DEMO-CUR-01', origen: 'manual', inicio: '2026-11-08' },
   { personaId: 'DEMO-L07', programaId: 'DEMO-CUR-02', origen: 'compra', pedidoId: 'DEMO-P196', inicio: '2026-11-10' },
 ];
+semillas.push(...semillasAlumnosCampus);
 
 const motivosOrigen: Record<OrigenMatricula, string> = {
   compra: 'Matrícula automática por pago confirmado',
@@ -225,3 +227,7 @@
 export const documentosIniciales: DocumentoAcademico[] = generarDocumentos(semillas, matriculasIniciales, progresoInicial, intentosIniciales);
 export const sustentacionesIniciales: SustentacionMid[] = [];
 export const eventosIniciales: EventoIntegracion[] = generarEventos(matriculasIniciales, documentosIniciales, intentosIniciales);
+const midInicial = generarMidInicial(documentosIniciales);
+documentosIniciales.push(...midInicial.constancias);
+sustentacionesIniciales.push(...midInicial.sustentaciones);
+eventosIniciales.push(...midInicial.eventos.map((evento, indice) => ({ ...evento, id: `DEMO-EVL-${String(eventosIniciales.length + indice + 1).padStart(3, '0')}` })));
```

## `src/datos/academico/formacionCampus.ts`

```diff
@@ -1,5 +1,6 @@
 import type { EstadoFormativo } from '../../tipos/formacion';
 import { relativoHoy } from './fechasCampus';
+import { formacionAlumnosCampus } from './alumnosCampus';
 
 const NIVEL_1 = 'Programa Liderazgo Comercial - Nivel 1';
 const NIVEL_2 = 'Programa Liderazgo Comercial - Nivel 2';
@@ -25,3 +26,4 @@
 ] as Array<[string, string, EstadoFormativo['estado'], string]>).map(([personaId, programaExterno, estado, fechaActualizacion], indice) => ({
   id: `DEMO-FOR-${30 + indice}`, personaId, programaExterno, proveedor: 'ERICK S.A.C.', estado, fechaActualizacion,
 }));
+formacionCampus.push(...formacionAlumnosCampus);
```

## `pruebas/academico.prueba.ts`

```diff
@@ -142,11 +142,12 @@
   assert.equal(preguntasIniciales.filter((pregunta) => pregunta.ambito === 'tim').length, 72);
 });
 
-prueba('Datos: 12 documentos, 1 anulado y 1 reemitido', () => {
-  assert.equal(documentosIniciales.length, 12);
+prueba('Datos: 29 documentos, 1 anulado y 1 reemitido', () => {
+  assert.equal(documentosIniciales.length, 29);
   assert.equal(documentosIniciales.filter((documento) => documento.estado === 'anulado').length, 1);
   assert.equal(documentosIniciales.filter((documento) => documento.reemplazaA).length, 1);
-  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'diploma').length, 1);
+  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'diploma').length, 5);
+  assert.equal(documentosIniciales.filter((documento) => documento.tipo === 'constancia_mid').length, 2);
 });
 
 prueba('Datos: estados precargados de los flujos', () => {
```

